"use client";

import MermaidDiagram from "@/components/ui/mermaid-diagram";
import React, { useState, useEffect, useCallback, useMemo, useId } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { PdfExportDialog } from "@/components/ui/pdf-export-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Plan as PrismaPlan } from '@prisma/client';

interface Plan extends Omit<PrismaPlan, 'version'> {
  versionNumber: number;
}

interface PlanDetailsProps {
  planId: string;
  initialPlanVersion?: Plan | null;
  onRefinementSuccess: (newVersionId: string) => void;
}

const PLAN_SECTIONS_ORDERED: [string, string][] = [
  ['SUMMARY', 'Executive Summary'],
  ['Goals', 'Goals'],
  ['Target Audience', 'Target Audience'],
  ['Core Features', 'Core Features'],
  ['Technology Stack', 'Technology Stack'],
  ['Site Architecture Diagram', 'Site Architecture'],
  ['User Flow Diagram', 'User Flow'],
  ['Database Schema Diagram', 'Database Schema'],
  ['Mind Map Diagram', 'Mind Map'],
  ['SEO Considerations', 'SEO Considerations'],
  ['Monetization Strategy', 'Monetization Strategy']
];

const sectionDisplayTitles: { [key: string]: string } = Object.fromEntries(PLAN_SECTIONS_ORDERED);

// Helper function to extract sections from Markdown text
function parseMarkdownSections(markdown: string): { [key: string]: string } {
    console.log("[Markdown Parser] Starting parse...");
    const sections: { [key: string]: string } = {};
    const lines = markdown.split('\n');
    let currentSectionTitle: string | null = null;
    let currentContent: string[] = [];
    let displayTitleMap: { [key: string]: string } = {}; // Map raw title to display title

    // Heuristic to extract display titles like "Executive Summary" from "# Executive Summary"
    const getDisplayTitle = (rawTitle: string): string => {
        return rawTitle.replace(/^#+\s*/, '').trim();
    }

    lines.forEach(line => {
        const match = line.match(/^#\s+(.*)/); // Match H1 headings
        if (match) {
            const newSectionRawTitle = match[1].trim();
            const newSectionDisplayTitle = getDisplayTitle(newSectionRawTitle);
            console.log(`[Markdown Parser] Starting new section with MD title: ${newSectionRawTitle}`);

            if (currentSectionTitle !== null) {
                // Save the previous section before starting the new one
                const displayKey = displayTitleMap[currentSectionTitle] || currentSectionTitle;
                sections[displayKey] = currentContent.join('\n').trim();
                console.log(`[Markdown Parser] Finishing section: ${currentSectionTitle} (Display: ${displayKey})`);
            }
            // Start new section
            currentSectionTitle = newSectionRawTitle;
            displayTitleMap[currentSectionTitle] = newSectionDisplayTitle; // Store mapping
            currentContent = []; // Reset content
        } else if (currentSectionTitle !== null) {
            // Add line to current section content if a section has started
            currentContent.push(line);
        }
    });

    // Add the last section
    if (currentSectionTitle !== null) {
        const displayKey = displayTitleMap[currentSectionTitle] || currentSectionTitle;
        sections[displayKey] = currentContent.join('\n').trim();
        console.log(`[Markdown Parser] Finishing LAST section: ${currentSectionTitle} (Display: ${displayKey})`);
        console.log(`[Markdown Parser]   -> Found display title: ${displayKey}, Content length: ${sections[displayKey].length}`);
    }

    console.log("[Markdown Parser] Final extracted sections:", sections);
    return sections;
};

export function PlanDetails({ planId, initialPlanVersion, onRefinementSuccess }: PlanDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [planVersion, setPlanVersion] = useState<Plan | null | undefined>(initialPlanVersion);
  const [error, setError] = useState<string | null>(null);
  // Removed unused isLoading state: const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false); // This state controls the actual submission loading
  const [parsedPlanSections, setParsedPlanSections] = useState<Record<string, string>>({});
  const [sectionDisplayTitles, setSectionDisplayTitles] = useState<Record<string, string>>({});
  const [userWrittenFeedback, setUserWrittenFeedback] = useState<Record<string, string>>({});
  const [sectionFeedback, setSectionFeedback] = useState<Record<string, string>>({});
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([]);
  const [hasContent, setHasContent] = useState(false);
  const [hasResearchData, setHasResearchData] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("PlanDetails received initial planVersion:", planVersion);
    if (planVersion) {
      console.log('Processing initialPlanVersion:', planVersion);

      if (planVersion.researchData && typeof planVersion.researchData === 'object') {
        setHasResearchData(true);
      } else {
        setHasResearchData(false);
      }

      const contentToParse = planVersion.planContent;
      console.log('Raw planContent string:', contentToParse);
      if (contentToParse && typeof contentToParse === 'string') {
        try {
          let parsedContentObject;
          try {
            parsedContentObject = JSON.parse(contentToParse);
            console.log('Parsed planContent object:', parsedContentObject);
          } catch (parseError) {
            console.error('Failed to parse plan content as JSON:', parseError);
            parsedContentObject = { planText: contentToParse, suggestions: [] };
          }

          if (parsedContentObject.planText && typeof parsedContentObject.planText === 'string') {
            const extractedSections = parseMarkdownSections(parsedContentObject.planText);
            setParsedPlanSections(extractedSections);
            console.log('[PlanDetails useEffect] Parsed Sections:', extractedSections);
            setHasContent(Object.values(extractedSections).some(content => content.trim() !== ''));
            const displayTitles: { [key: string]: string } = {};
            Object.keys(extractedSections).forEach(key => displayTitles[key] = key);
            setSectionDisplayTitles(displayTitles);
          } else {
            console.warn('planText field is missing or not a string in parsed content');
            setParsedPlanSections({});
            setHasContent(false);
          }

          if (parsedContentObject.suggestions && Array.isArray(parsedContentObject.suggestions)) {
            setAiSuggestions(parsedContentObject.suggestions);
            // Initialize selected state based on incoming suggestions
            setSelectedSuggestionIds(parsedContentObject.suggestions.filter((s: any) => s.selected).map((s: any) => s.id));
            console.log('Extracted AI Suggestions:', parsedContentObject.suggestions);
          } else {
            console.warn('suggestions field is missing or not an array in parsed content');
            setAiSuggestions([]); // Reset if missing or invalid
            setSelectedSuggestionIds([]); // Reset selected IDs
          }

        } catch (error) {
          console.error('Failed to parse plan content or suggestions:', error);
          toast({ title: "Error", description: "Failed to parse plan content.", variant: "destructive" });
          setError('Failed to parse plan content');
          setHasContent(false);
          setAiSuggestions([]); // Reset on error
          setSelectedSuggestionIds([]); // Reset selected IDs on error
        }
      } else {
        setParsedPlanSections({});
        setAiSuggestions([]); // Reset if no content string
        setSelectedSuggestionIds([]); // Reset selected IDs
        setHasContent(false);
      }

      setSectionFeedback({}); // Reset feedback when plan version changes

    } else { // Handle case where planVersion is null/undefined initially
      setParsedPlanSections({});
      setHasResearchData(false);
      setAiSuggestions([]); // Reset suggestions
      setSelectedSuggestionIds([]); // Reset selected IDs
      setHasContent(false);
      setSectionFeedback({});
    }
  }, [planVersion, toast]); // Dependency array includes planVersion and toast

  const handleFeedbackChange = useCallback((sectionTitle: string, value: string) => {
    setSectionFeedback(prev => ({ ...prev, [sectionTitle]: value }));
  }, []);

  // Handler for suggestion checkbox changes
  const handleSuggestionToggle = useCallback((suggestionId: string, checked: boolean) => {
    setSelectedSuggestionIds(prevSelectedIds => {
      if (checked) {
        // Add to array if not already present
        return prevSelectedIds.includes(suggestionId) ? prevSelectedIds : [...prevSelectedIds, suggestionId];
      } else {
        // Filter out from array
        return prevSelectedIds.filter(id => id !== suggestionId);
      }
    });
  }, []);

  const hasWrittenFeedback = useMemo(() =>
    Object.values(sectionFeedback).some(feedback => feedback.trim() !== ''),
    [sectionFeedback]
  );
  const hasSelectedSuggestions = useMemo(() =>
    selectedSuggestionIds.length > 0,
    [selectedSuggestionIds]
  );
  const isSubmitEnabled = hasWrittenFeedback || hasSelectedSuggestions;

  // Prepare data and open the confirmation modal
  const handleOpenConfirmation = useCallback(() => {
    const texts = selectedSuggestionIds.map(id => {
      console.log(`[Popup Prep] Searching for suggestion ID: ${id} in`, aiSuggestions);
      const suggestion = aiSuggestions.find(s => s.id === id);
      console.log(`[Popup Prep] Found suggestion for ID ${id}:`, suggestion);
      return suggestion ? suggestion.description : `Suggestion ID ${id} not found`; // Return description or placeholder
    }).filter(text => text !== undefined); // Filter out any potential undefined entries if find fails unexpectedly

    console.log("[Popup Prep] Calculated selectedSuggestionTexts:", texts);

    setConfirmationData({
      userWrittenFeedback: sectionFeedback,
      selectedSuggestionTexts: texts,
      selectedSuggestionIds: selectedSuggestionIds, // Pass IDs
    });
    setIsConfirmationOpen(true);
  }, [selectedSuggestionIds, aiSuggestions, sectionFeedback]);

  // Actual feedback submission after confirmation
  const handleSubmitFeedback = useCallback(async () => {
    // Check if submission is already in progress
    if (isSubmittingFeedback) return;

    setIsSubmittingFeedback(true); // Set loading state immediately

    // Use setTimeout to allow state update to potentially render before heavy async logic/dialog closure
    setTimeout(async () => {
      setError(null); // Clear previous errors
      setShowSuccessAlert(false);
      setShowErrorAlert(false);
    console.log('[Feedback Submit] Initiated. Feedback:', sectionFeedback, 'Selected IDs:', selectedSuggestionIds);

    // Filter out empty feedback entries
    const filteredFeedback = Object.fromEntries(Object.entries(sectionFeedback).filter(([_, value]) => value.trim() !== ''));

    if (!planVersion) {
      setError("Cannot submit feedback: Plan data is missing.");
      toast({ title: "Error", description: "Plan data is missing.", variant: "destructive" });
      // Keep dialog open on error: setIsConfirmationOpen(false);
      setIsSubmittingFeedback(false); // Stop submission indicator on error
      return;
    }

    // Double check submission readiness (mainly for defensive programming)
    if (!isSubmitEnabled) {
         toast({ title: "Cannot Submit", description: "No feedback or suggestions provided.", variant: "default" });
         // Keep dialog open on error: setIsConfirmationOpen(false);
         setIsSubmittingFeedback(false); // Stop submission indicator on error
         return;
    }

    try {
      console.log("Submitting feedback with selected suggestion IDs:", selectedSuggestionIds);
      const payload = {
        userWrittenFeedback: filteredFeedback,
        latestVersionId: planVersion.id,
        selectedSuggestionIds: selectedSuggestionIds,
      };

      console.log('[Submit] Sending payload:', payload);
      // Note: There's an unused 'isSubmitting' state variable, using 'isSubmittingFeedback' instead as intended.
      // setIsSubmitting(true); // This seems unused, removing for clarity unless needed elsewhere.
      setError(null);

      try { // Outer try for the whole submission process including fetch
        console.log('[Submit] Initiating fetch to API...');
        const response = await fetch(`/api/plans/${planId}/versions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('[Submit] Fetch response received.', response);

        if (!response.ok) {
          let errorBody = 'Unknown error';
          try {
            errorBody = await response.text(); // Attempt to get text body for more info
            console.error('[Submit] Error response body:', errorBody);
          } catch (textError) {
            console.error('[Submit] Could not read error response body:', textError);
          }
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        console.log('[Submit] Response OK. Attempting to parse JSON...');
        const responseData = await response.json();
        console.log('Received API response data object:', responseData);

        // --- Adjust check and access based on the actual response structure ---
        if (!responseData || typeof responseData !== 'object' || !responseData.planVersion || typeof responseData.planVersion !== 'object' || !responseData.planVersion.id) {
            console.error('Invalid response data structure received:', responseData);
            throw new Error('Received invalid data structure for new plan version from API.');
        }

        const newVersionId = responseData.planVersion.id;
        console.log(`[Submit] Successfully received new version ID: ${newVersionId}. Reloading page.`);

        // --- Reload page to show the new version ---
        // router.push(`/dashboard/plans/${planVersion.projectId}?versionId=${newPlanVersion.id}`);
        window.location.href = `/dashboard/plans/${planVersion.projectId}?versionId=${newVersionId}`;

      } catch (err) {
        console.error('[Submit] Error during feedback submission:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        setShowErrorAlert(true);
        // Removed setIsSubmittingFeedback(false) from here
      }
    } catch (error) { // Catch errors from the outer try block (e.g., initial setup errors)
      console.error("Outer Submission Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(`Submission failed: ${errorMessage}`);
      toast({ title: "Submission Failed", description: errorMessage, variant: "destructive" });
      setShowErrorAlert(true);
      // Keep dialog open on error: setIsConfirmationOpen(false);
      // setIsSubmittingFeedback is handled in finally
    } finally {
      // Ensure loading state is always reset
      console.log("[Submit] Finalizing submission attempt.");
      setIsSubmittingFeedback(false);
      // setIsSubmitting(false); // Reset the potentially unused state variable too, if needed
    }
   }, 0); // Delay of 0ms

  }, [planId, planVersion, sectionFeedback, selectedSuggestionIds, isSubmitEnabled, isSubmittingFeedback, onRefinementSuccess, toast, router]); // Added missing dependencies

  const descriptionId = useId();

  const getCombinedFeedbackDescriptionJsx = () => {
    // Access state variables directly as they are in scope
    const writtenFeedbackEntries = Object.entries(sectionFeedback)
      .filter(([, text]: [string, string]) => text.trim() !== ''); // Added type for text
    const selectedSuggestionObjects = selectedSuggestionIds
      .map((id: string) => aiSuggestions.find((s: any) => s.id === id)) // Added types for id and s
      .filter((s): s is any => s !== undefined); // Keep the whole object

    if (writtenFeedbackEntries.length === 0 && selectedSuggestionObjects.length === 0) {
       return <p>No feedback or suggestions were provided.</p>;
    }

    return (
      // Use a div to prevent p-in-p nesting if AlertDialogDescription renders a p
      <div>
        <p>You are about to submit the following feedback to generate a new plan version:</p>

        {writtenFeedbackEntries.length > 0 && (
          <>
            <p className="mt-3 mb-1 font-semibold">Written Feedback:</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {writtenFeedbackEntries.map(([section, text]: [string, string]) => ( // Added type for text
                <li key={section}>
                  <strong className="text-foreground">{section}:</strong> {text.trim()}
                </li>
              ))}
            </ul>
          </>
        )}

        {selectedSuggestionObjects.length > 0 && (
          <>
            <p className="mt-3 mb-1 font-semibold">Selected Suggestions:</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {selectedSuggestionObjects.map((suggestion: any) => ( // Added type for suggestion
                <li key={suggestion.id}>
                  <strong className="text-foreground">{suggestion.text || suggestion.title}:</strong> {suggestion.description?.trim() ?? ''}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  };

  // Use 'error' state and check 'planVersion' for initial load failure
  if (error && !planVersion) { // Show critical error if loading failed entirely
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Plan</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  if (!planVersion && !error) { // Initial loading state before planVersion is set/fetched
    return (
        <Card>
            <CardHeader>
                <CardTitle>Loading Plan...</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Optional: Add skeleton loaders */}
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
    );
  }

  // Explicit check to satisfy TypeScript before accessing planVersion properties
  if (!planVersion) {
      // This should ideally not be reached if the loading/error states above are correct,
      // but it handles potential edge cases and satisfies the compiler.
      return (
          <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Plan data is unexpectedly missing.</AlertDescription>
          </Alert>
      );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
            <CardTitle>Plan Details (Version {planVersion.versionNumber})</CardTitle>
            <CardDescription>Review the generated plan sections below and provide feedback.</CardDescription>
        </CardHeader>
      </Card>

      {hasContent ? (
                  Object.entries(parsedPlanSections).map(([sectionTitle, sectionContent]) => {
                    const uniqueSectionId = sectionTitle.replace(/\s+/g, '-').toLowerCase();
                    let mermaidCode: string | null = null;
                    let textContent = sectionContent; // Start with the full content

                    // Check if the section content contains a Mermaid block
                    const match = sectionContent.match(/```mermaid\s*([\s\S]*?)\s*```/);
                    if (match && match[1]) {
                      mermaidCode = match[1].trim(); // Extract the code if found
                      // Remove the mermaid block from the text content
                      textContent = sectionContent.replace(/```mermaid\s*[\s\S]*?\s*```/, '').trim();
                    }

                    // console.log(`[PlanDetails Render] Section: "${sectionTitle}", FoundCode: ${mermaidCode ? 'Yes' : 'No'}`); // Keep or remove this debug log

                    return (
                      <div key={sectionTitle} className="space-y-3 p-4 border rounded-lg shadow-sm bg-card">
                        <h3 className="text-xl font-semibold mb-2 border-b pb-2">{sectionDisplayTitles[sectionTitle] || sectionTitle}</h3>

                        {/* Always render the text content (Mermaid block removed if present) */}
                        <div className="max-w-none prose prose-sm dark:prose-invert">
                          {textContent ? (
                            <ReactMarkdown>{textContent}</ReactMarkdown>
                          ) : (
                            // If there's no text *and* no diagram, show placeholder
                            !mermaidCode && <p className="text-muted-foreground italic">Content not available for this section.</p>
                          )}
                        </div>

                        {/* If Mermaid code was found, render it within an Accordion */}
                        {mermaidCode && (
                          <Accordion type="single" collapsible className="w-full pt-2">
                            <AccordionItem value="item-1">
                              <AccordionTrigger className="text-sm py-2">View/Hide Diagram</AccordionTrigger>
                              <AccordionContent>
                                <MermaidDiagram chart={mermaidCode} id={`mermaid-${uniqueSectionId}`} />
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                        {/* Feedback section - rendered for ALL sections */}
                        <div className="pt-3 border-t mt-4">
                          <Label htmlFor={`feedback-${sectionTitle}`} className="text-xs font-medium text-muted-foreground">Feedback for {sectionDisplayTitles[sectionTitle] || sectionTitle}:</Label>
                          <Textarea
                            id={`feedback-${sectionTitle}`}
                            placeholder={`Enter your feedback here...`}
                            value={sectionFeedback[sectionTitle] || ''}
                            onChange={(e) => handleFeedbackChange(sectionTitle, e.target.value)}
                            className="min-h-[80px] mt-1 text-sm"
                          />
                        </div>
                      </div>
                    );
                 }) // Map ends here
       ) // Closing parenthesis for the map call, correctly placed now
       : ( // Ternary else starts here
          <Card>
              <CardContent className="pt-6">
                  <p className="text-muted-foreground italic">Plan content is currently being generated or is not available for this version.</p>
              </CardContent>
          </Card>
      )}

      {hasResearchData && (
         <Accordion type="single" collapsible className="w-full border rounded-lg shadow-sm bg-card px-4">
            <AccordionItem value="competitor-analysis" className="border-b-0">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline py-4">Competitive Analysis</AccordionTrigger>
              <AccordionContent className="max-w-none text-sm pb-4">
                <div className="space-y-3">
                   {/* Add competitor analysis content here */}
                 </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
      )}

      {aiSuggestions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>Review these AI-generated suggestions and select any you'd like to incorporate.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {aiSuggestions.map((suggestion) => (
                <li key={suggestion.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={`suggestion-${suggestion.id}`}
                    checked={selectedSuggestionIds.includes(suggestion.id)}
                    onCheckedChange={(checked) => handleSuggestionToggle(suggestion.id, !!checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor={`suggestion-${suggestion.id}`} className="font-semibold cursor-pointer">{suggestion.text || suggestion.title}</label>
                    {suggestion.justification && (
                      <p className="text-sm text-muted-foreground">{suggestion.justification}</p>
                    )}
                     {suggestion.description && !suggestion.justification && (
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="pt-6 border-t mt-8">
          <div className="flex gap-3">
              <Button
                  onClick={handleOpenConfirmation}
                  disabled={!isSubmitEnabled}
                  className="h-11 rounded-md px-8"
              >
                  Review & Submit Feedback
              </Button>
              <PdfExportDialog 
                  planId={planVersion.id}
                  contentRef={parsedPlanSections}
                  projectId={planVersion.projectId!}
              />
          </div>
          {!isSubmitEnabled && (
            <p className="text-xs text-muted-foreground mt-2">
                Please provide feedback or select an AI suggestion to enable submission.
            </p>
          )}
      </div>

      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Your Feedback</AlertDialogTitle>
              <AlertDialogDescription>
                Review the feedback and selected suggestions before submitting.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {getCombinedFeedbackDescriptionJsx()}
              </div>
            </ScrollArea>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmittingFeedback}>Cancel</AlertDialogCancel>
                {/* Replace AlertDialogAction with a standard Button to prevent auto-closing */}
                <Button
                  type="button" // Explicitly set type to prevent potential form submission issues if nested
                  onClick={handleSubmitFeedback} // Keep the direct handler call
                  disabled={isSubmittingFeedback}
                  className="flex items-center justify-center" // Keep existing styles
                >
                  {isSubmittingFeedback ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      {showSuccessAlert && (
        <Alert variant="default" className="mt-4 border-green-500 text-green-700 dark:border-green-600 dark:text-green-400"> {/* Changed variant to default, added styling */}
          <CheckCircle className="h-4 w-4 text-green-500" /> {/* Ensure icon color matches */}
          <AlertTitle className="text-green-800 dark:text-green-300">Feedback Submitted Successfully</AlertTitle> {/* Adjust title color */}
          <AlertDescription>Thank you for providing feedback. A new plan version has been generated.</AlertDescription>
        </Alert>
      )}
      {showErrorAlert && (
        <Alert variant="destructive" className="mt-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Feedback Submission Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface ConfirmationData {
  userWrittenFeedback: Record<string, string>;
  selectedSuggestionTexts: string[];
  selectedSuggestionIds: string[];
};
