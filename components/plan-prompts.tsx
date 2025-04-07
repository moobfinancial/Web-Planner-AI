"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ImplementationPrompts } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressIndicator } from "@/components/build-plan/ProgressIndicator";
import { Checkbox } from "@/components/ui/checkbox"; 
import { Label } from "@/components/ui/label"; 
import { Textarea } from "@/components/ui/textarea"; // Import Textarea component

// Define props
interface PlanPromptsProps {
  planId: string;
  currentVersionId?: string;
  codeEditor?: string;
}

// Using named export to match the import in app/dashboard/plans/[id]/page.tsx
export function PlanPrompts(props: PlanPromptsProps) {
  const { planId, currentVersionId, codeEditor } = props;
  const { toast } = useToast();
  
  // State for version ID
  const [internalCurrentVersionId, setInternalCurrentVersionId] = useState<string | undefined>(currentVersionId);

  // State for categorized prompts, loading, and error
  const [categorizedPrompts, setCategorizedPrompts] = useState<ImplementationPrompts | null>(null);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState<boolean>(false);
  const [errorPrompts, setErrorPrompts] = useState<string | null>(null);
  
  // State for One-Shot Prompt refinement
  const [oneShotFeedback, setOneShotFeedback] = useState<string>("");
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinementError, setRefinementError] = useState<string | null>(null);

  // State for task completion
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [isUpdatingProgress, setIsUpdatingProgress] = useState<boolean>(false); // Loading state for progress updates
  const [initialProgressLoaded, setInitialProgressLoaded] = useState<boolean>(false); // Track if initial progress loaded

  // Effect for handling version ID changes
  useEffect(() => {
    if (!currentVersionId && planId) {
      setInternalCurrentVersionId(planId);
    } else if (currentVersionId !== internalCurrentVersionId) {
      setInternalCurrentVersionId(currentVersionId);
    }
    // Reset task completion when version changes
    setCheckedTasks({});
    setInitialProgressLoaded(false); // Reset loading flag for new version
  }, [currentVersionId, planId]);

  // Effect for fetching categorized prompts
  useEffect(() => {
    const fetchCategorizedPrompts = async () => {
      if (!internalCurrentVersionId || !planId) { // Ensure planId is also available
        console.log("Skipping fetch: Missing versionId or planId");
        setCategorizedPrompts({}); // Reset or set to empty if needed
        return;
      }
      setIsLoadingPrompts(true);
      setErrorPrompts(null);
      console.log(`Fetching prompts for project ${planId}, version ${internalCurrentVersionId}`);
      try {
        // ** UPDATED: Use planId in the path and pass versionId as query param **
        const response = await fetch(`/api/plans/${planId}/prompts?versionId=${internalCurrentVersionId}&codeEditor=${codeEditor}`);
        console.log(response);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ImplementationPrompts = await response.json();
        setCategorizedPrompts(data);
      } catch (error) {
        console.error('Failed to fetch categorized prompts:', error);
        setErrorPrompts(error instanceof Error ? error.message : 'An unknown error occurred');
        setCategorizedPrompts(null);
      } finally {
        setIsLoadingPrompts(false);
      }
    };

    fetchCategorizedPrompts();
  }, [internalCurrentVersionId, planId, codeEditor]); // Add planId to dependency array

  // Effect for fetching initial build progress
  useEffect(() => {
    const fetchBuildProgress = async () => {
      if (!internalCurrentVersionId || initialProgressLoaded) return; // Only fetch if versionId exists and not already loaded

      console.log(`Fetching initial progress for version: ${internalCurrentVersionId}`);
      try {
        // ** MODIFIED: Added credentials: 'include' **
        const progressRes = await fetch(`/api/plans/${internalCurrentVersionId}/build`, { credentials: 'include' });
        if (!progressRes.ok) {
          // Don't throw critical error, maybe just log or show subtle indicator
          console.warn(`Failed to fetch initial build progress (${progressRes.status})`);
          return;
        }
        const progressData = await progressRes.json();
        console.log("Progress data received:", progressData);
        // Assuming progressData has a field like `completedTasks` (an array of strings/ids)
        // or `progress` (a Record<string, boolean>)
        if (progressData?.progress && typeof progressData.progress === 'object') {
            console.log("Setting initial checked tasks from progress object:", progressData.progress);
            setCheckedTasks({...progressData.progress});
        } else if (Array.isArray(progressData?.completedTasks)) {
             const initialChecked: Record<string, boolean> = {};
             progressData.completedTasks.forEach((taskIdentifier: string) => { 
                 initialChecked[taskIdentifier] = true; 
             });
             console.log("Setting initial checked tasks from array:", initialChecked);
             setCheckedTasks(initialChecked);
        } else {
            console.warn("Build progress data received in unexpected format:", progressData);
            setCheckedTasks({}); // Default to empty if format is wrong
        }
      } catch (fetchError) {
        console.error("Error fetching initial build progress:", fetchError);
         // Handle error appropriately, maybe set an error state
      } finally {
         setInitialProgressLoaded(true); // Mark as loaded (or attempted)
      }
    };

    fetchBuildProgress();
  }, [internalCurrentVersionId, initialProgressLoaded]); // Depend on versionId and loading flag

  // Handler for the Refine One-Shot Prompt button
  const handleRefineOneShotPrompt = async () => {
    if (!planId || !oneShotFeedback.trim() || !categorizedPrompts?.__oneShotPrompt__) {
      toast({ 
        title: "Cannot Refine", 
        description: "Missing project ID, feedback, or existing prompt.", 
        variant: "destructive" 
      });
      return;
    }

    setIsRefining(true);
    setRefinementError(null);

    try {
      // Use the PUT endpoint with Project ID
      const response = await fetch(`/api/plans/${planId}/one-shot-prompt`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userFeedback: oneShotFeedback,
          codeEditor: codeEditor || 'vscode' // Pass code editor preference
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: await response.text() };
        }
        throw new Error(errorData.message || `Failed to refine prompt (${response.status})`);
      }

      const data = await response.json();
      
      // Update the categorizedPrompts state with the new one-shot prompt
      setCategorizedPrompts(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          __oneShotPrompt__: data.oneShotPrompt
        };
      });
      
      setOneShotFeedback(""); // Clear feedback input
      toast({ title: "Prompt Refined", description: "One-Shot Prompt updated successfully." });

    } catch (refineError) {
      console.error("Error refining One-Shot Prompt:", refineError);
      const message = refineError instanceof Error ? refineError.message : "An unknown error occurred.";
      setRefinementError(`Refinement failed: ${message}`);
      toast({ title: "Refinement Failed", description: message, variant: "destructive" });
    } finally {
      setIsRefining(false);
    }
  };

  // Handler for checkbox changes - Updates state and calls API
  const handleCheckboxChange = async (taskIdentifier: string, category: string, isChecked: boolean) => {
      console.log(`Checkbox changed: ${taskIdentifier} (${category}) to ${isChecked}`);
      const newCheckedTasks = {...checkedTasks, [taskIdentifier]: isChecked};
      setCheckedTasks(newCheckedTasks);
      setIsUpdatingProgress(true);

      // console.log(`Task "${taskIdentifier}" (Category: ${category}) checked: ${isChecked}. PlanVersion ID: ${internalCurrentVersionId}`);

      if (!internalCurrentVersionId) {
          toast({ title: "Error", description: "Cannot save progress: Plan version ID is missing.", variant: "destructive" });
          setIsUpdatingProgress(false);
          // Revert state? Optional, depends on desired UX
          // setCheckedTasks(checkedTasks);
          return;
      }

      try {
          // Calculate completed and total tasks
          let totalTasks = 0;
          let completedTasks = 0;
          
          // Count all tasks and completed tasks across all categories
          if (categorizedPrompts) {
              Object.keys(categorizedPrompts)
                  .filter(cat => cat !== '__oneShotPrompt__') // Exclude one-shot prompt
                  .forEach(cat => {
                      const tasksInCategory = categorizedPrompts[cat] || [];
                      totalTasks += tasksInCategory.length;
                      
                      // Count completed tasks in this category
                      tasksInCategory.forEach((task, index) => {
                          const taskId = `${cat}-${task.title || index}`;
                          if (newCheckedTasks[taskId]) {
                              completedTasks++;
                          }
                      });
                  });
          }

          console.log(`Sending progress update: ${completedTasks}/${totalTasks} tasks, detailed progress:`, newCheckedTasks);
          const response = await fetch(`/api/plans/${internalCurrentVersionId}/build`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              // Send the format expected by the API
              body: JSON.stringify({ 
                  completedTasks,
                  totalTasks,
                  // Also include the detailed progress for future reference if needed
                  _detailedProgress: newCheckedTasks 
              }),
          });

          if (!response.ok) {
              let errorData;
              try {
                  errorData = await response.json();
              } catch {
                  errorData = { message: await response.text() };
              }
              throw new Error(errorData.message || `Failed to update progress (${response.status})`);
          }

          const result = await response.json();
          console.log("Progress update result:", result);
          // Optionally update progress indicator based on response if needed
          toast({ 
              description: `Progress updated: ${completedTasks}/${totalTasks} tasks completed (${
                  totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
              }%)` 
          });

      } catch (updateError) {
          console.error("Error updating build progress:", updateError);
          const message = updateError instanceof Error ? updateError.message : "An unknown error occurred.";
          toast({ title: "Update Failed", description: `Failed to save progress: ${message}`, variant: "destructive" });
          // Revert state on error
          setCheckedTasks(checkedTasks);
      } finally {
          setIsUpdatingProgress(false);
      }
  };

  // Using React.createElement instead of JSX
  return React.createElement('div', { className: 'space-y-6' },
    React.createElement(Card, { className: 'bg-background/50' },
      React.createElement(CardHeader, { className: 'pb-2' },
        React.createElement(CardTitle, { className: 'text-lg' }, "Build Plan & Prompts"),
        React.createElement(CardDescription, {}, "Track progress and use AI-generated prompts to implement your plan."),
        internalCurrentVersionId && React.createElement('div', { className: 'mt-2' },
          React.createElement(ProgressIndicator, { planId: internalCurrentVersionId })
        ),
        !internalCurrentVersionId && React.createElement('div', { className: 'text-sm text-muted-foreground mt-2' }, 
          "Build progress not started."
        )
      ),
      React.createElement(CardContent, {},
        React.createElement('p', { className: 'text-muted-foreground' }, 
          "This component is temporarily simplified during maintenance. Feature will be fully available soon."
        ),
        React.createElement('div', { className: 'mt-4 p-4 bg-muted/50 rounded border border-border' },
          React.createElement('p', { className: 'text-foreground' }, `Plan ID: ${planId}`),
          currentVersionId && React.createElement('p', { className: 'text-foreground' }, `Version ID: ${currentVersionId}`)
        ),
        isLoadingPrompts ? (
          // Loading State Skeleton
          React.createElement('div', { className: 'space-y-4 mt-4' },
            React.createElement(Skeleton, { className: "h-8 w-1/4" }),
            React.createElement(Skeleton, { className: "h-10 w-full" }),
            React.createElement(Skeleton, { className: "h-20 w-full" })
          )
        ) : errorPrompts ? (
          // Error State
          React.createElement('p', { className: 'text-red-500 mt-4' }, 
            `Error loading prompts: ${errorPrompts}`
          )
        ) : categorizedPrompts && Object.keys(categorizedPrompts).length > 0 ? (
          React.createElement(Tabs, { defaultValue: Object.keys(categorizedPrompts).find(key => key !== '__oneShotPrompt__') || (categorizedPrompts.__oneShotPrompt__ ? '__oneShotPrompt__' : '') , className: "w-full" },
            React.createElement(TabsList, { 
              className: "flex w-full flex-wrap gap-0.5"
            }, 
              categorizedPrompts.__oneShotPrompt__ && 
                React.createElement(TabsTrigger, { 
                  key: "__oneShotPrompt__", 
                  value: "__oneShotPrompt__",
                  className: "px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-1.5 flex-1"
                }, "One-shot"),
              Object.keys(categorizedPrompts)
                .filter(category => category !== '__oneShotPrompt__') 
                .sort() 
                .map((category) =>
                  React.createElement(TabsTrigger, { 
                    key: category, 
                    value: category,
                    className: "px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-1.5 flex-1"
                  }, 
                    category.charAt(0).toUpperCase() + category.slice(1)
                  )
                )
            ),
            categorizedPrompts.__oneShotPrompt__ && 
              React.createElement(TabsContent, { key: "__oneShotPrompt__", value: "__oneShotPrompt__" },
                React.createElement(Card, { className: 'bg-background/50' },
                  React.createElement(CardHeader, { className: 'pb-2' },
                    React.createElement(CardTitle, { className: 'text-lg' }, "One-shot Generation Prompt")
                  ),
                  React.createElement(CardContent, { className: 'space-y-4' },
                    React.createElement('div', { className: 'relative mt-2' },
                      React.createElement('pre', { className: 'p-4 rounded-md bg-muted overflow-x-auto text-sm whitespace-pre-wrap break-words text-foreground' }, 
                        React.createElement('code', { className: 'text-foreground' }, categorizedPrompts.__oneShotPrompt__)
                      ),
                      React.createElement(Button, {
                        variant: "ghost",
                        size: "icon",
                        className: "absolute top-2 right-2 h-7 w-7 sm:block",
                        onClick: () => {
                          navigator.clipboard.writeText(categorizedPrompts.__oneShotPrompt__ || '');
                          toast({ description: "One-shot prompt copied to clipboard!" });
                        }
                      },
                        React.createElement(Copy, { className: "h-4 w-4" })
                      )
                    ),
                    // Feedback section
                    React.createElement('div', { className: 'space-y-2 mt-4' },
                      React.createElement(Label, { htmlFor: 'one-shot-feedback', className: 'text-sm font-medium' }, "Feedback for Refinement"),
                      React.createElement(Textarea, {
                        id: 'one-shot-feedback',
                        placeholder: "Provide feedback to refine this prompt (e.g., add specific features, change focus, etc.)",
                        value: oneShotFeedback,
                        onChange: (e) => setOneShotFeedback(e.target.value),
                        className: 'min-h-[100px] w-full',
                        disabled: isRefining
                      }),
                      refinementError && React.createElement('p', { className: 'text-red-500 text-sm' }, refinementError),
                      React.createElement('div', { className: 'flex justify-end mt-2' },
                        React.createElement(Button, {
                          onClick: handleRefineOneShotPrompt,
                          disabled: isRefining || !oneShotFeedback.trim(),
                          className: 'ml-auto'
                        },
                          isRefining && React.createElement(Loader2, { className: 'mr-2 h-4 w-4 animate-spin' }),
                          "Refine Prompt"
                        )
                      )
                    )
                  )
                )
              ),
            Object.keys(categorizedPrompts)
              .filter(category => category !== '__oneShotPrompt__') 
              .sort() 
              .map((category) => 
                React.createElement(TabsContent, { key: category, value: category },
                  React.createElement('div', { className: 'space-y-4' },
                    (categorizedPrompts[category] || []).map((promptItem, index) => {
                      const taskIdentifier = `${category}-${promptItem.title || index}`;
                      return (
                        React.createElement(Card, { key: taskIdentifier, className: 'bg-background/50' },
                          React.createElement(CardHeader, { className: 'flex flex-row items-start sm:items-center space-x-3 pb-2 pt-4' }, // Modified for mobile
                            React.createElement(Checkbox, {
                              id: taskIdentifier,
                              checked: checkedTasks[taskIdentifier] || false,
                              onCheckedChange: (checked) => {
                                handleCheckboxChange(taskIdentifier, category, !!checked);
                              },
                              disabled: isUpdatingProgress || !initialProgressLoaded || !internalCurrentVersionId // Disable while loading/updating or if no versionId
                            }),
                            React.createElement(Label, { htmlFor: taskIdentifier, className: 'text-lg font-medium leading-tight sm:leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 break-words' }, promptItem.title)
                          ),
                          React.createElement(CardContent, { className: 'space-y-2 pl-8 sm:pl-11' }, // Adjusted indent for mobile
                            promptItem.description && React.createElement(CardDescription, {}, promptItem.description),
                            React.createElement('div', { className: 'relative mt-2' },
                              React.createElement('pre', { className: 'p-4 rounded-md bg-muted overflow-x-auto text-sm whitespace-pre-wrap break-words text-foreground' }, 
                                React.createElement('code', { className: 'text-foreground' }, promptItem.promptText)
                              ),
                              React.createElement(Button, {
                                variant: "ghost",
                                size: "icon",
                                className: "absolute top-2 right-2 h-7 w-7 sm:block",
                                onClick: () => {
                                  navigator.clipboard.writeText(promptItem.promptText);
                                  toast({ description: "Prompt copied to clipboard!" });
                                }
                              },
                                React.createElement(Copy, { className: "h-4 w-4" })
                              )
                            )
                          )
                        )
                      );
                    })
                  )
                )
              )
          )
        ) : (
          // Case where prompts are loaded but empty (excluding potential __oneShotPrompt__ which is handled above)
          React.createElement('p', { className: 'text-center text-muted-foreground mt-4 px-2' }, 
            "No implementation prompts found for this plan version."
          )
        )
      )
    )
  );
}

// Also include default export for flexibility
export default PlanPrompts;
