"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download } from "lucide-react";
import copy from "clipboard-copy"; // Ensure installed: npm install clipboard-copy
import { useToast } from "@/components/ui/use-toast";
import { ImplementationPrompts } from "@/lib/types"; // Import shared type

// Define props
interface PlanPromptsProps {
  planId: string;
  currentVersionId?: string;
}

interface PromptItem {
  title: string;
  promptText: string;
}

export function PlanPrompts({ planId }: PlanPromptsProps) {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<ImplementationPrompts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false); // For download button state

  useEffect(() => {
    const fetchPrompts = async () => {
      if (!planId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/plans/${planId}/prompts`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch prompts (${response.status})`);
        }
        const data: ImplementationPrompts = await response.json();
        setPrompts(data);
      } catch (fetchError) {
        console.error("Error fetching prompts:", fetchError);
        const message = fetchError instanceof Error ? fetchError.message : "An unexpected error occurred.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [planId]); // Refetch if planId changes

  const handleCopyToClipboard = (promptText: string) => {
    copy(promptText)
      .then(() => {
        toast({ title: "Copied!", description: "Prompt copied to clipboard." });
      })
      .catch((copyError: unknown) => { // Added type 'unknown'
        console.error("Failed to copy to clipboard:", copyError);
        // Optionally check if copyError is an Error instance for better message
        const message = copyError instanceof Error ? copyError.message : "Unknown error";
        toast({ title: "Copy Failed", description: `Could not copy prompt: ${message}`, variant: "destructive" });
      });
  };

  const generateCombinedPromptText = (): string => {
    if (!prompts) return "";
    let combined = "";
    // Iterate over categories (frontend, backend, database, etc.)
    for (const category in prompts) {
        if (prompts[category] && prompts[category].length > 0) {
            combined += `--- ${category.toUpperCase()} ---\n\n`;
            prompts[category].forEach((p: PromptItem) => {
                combined += `## ${p.title}\n\n${p.promptText}\n\n`;
            });
        }
    }
    return combined.trim();
  };

  const downloadCombinedPrompt = () => {
    setIsExporting(true);
    try {
        const combinedText = generateCombinedPromptText();
        if (!combinedText) {
          toast({ title: "Nothing to Download", description: "No prompts were found.", variant: "destructive" });
          return; // Return early if no text
        }

        const filename = `plan-${planId}-prompts-${Date.now()}.txt`;
        const blob = new Blob([combinedText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Downloaded", description: "All prompts downloaded as a text file." });
    } catch (downloadError) {
        console.error("Failed to download combined prompt:", downloadError);
        const message = downloadError instanceof Error ? downloadError.message : "Unknown error";
        toast({ title: "Download Failed", description: `Could not download prompts: ${message}`, variant: "destructive" });
    } finally {
        setIsExporting(false);
    }
  };

  // Helper to render prompts for a category
  const renderPromptsForCategory = (categoryPrompts: PromptItem[] | undefined) => {
    if (!categoryPrompts || categoryPrompts.length === 0) {
      return <p className="text-muted-foreground">No prompts available for this category.</p>;
    }
    return categoryPrompts.map((prompt, index) => (
      <div key={`${prompt.title}-${index}`} className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <p className="font-medium">{prompt.title}</p>
          <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(prompt.promptText)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-sm whitespace-pre-wrap">{prompt.promptText}</p> {/* Use pre-wrap for formatting */}
      </div>
    ));
  };

  // Render Loading/Error States
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Development Prompts</CardTitle>
          </CardHeader>
          <CardContent>Loading prompts...</CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Development Prompts</CardTitle>
          </CardHeader>
          <CardContent className="text-red-500">Error loading prompts: {error}</CardContent>
        </Card>
      </div>
    );
  }

  if (!prompts || Object.keys(prompts).length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Development Prompts</CardTitle>
          </CardHeader>
          <CardContent>No prompts generated for this plan yet.</CardContent>
        </Card>
      </div>
    );
  }

  // Determine available categories for tabs
  const categories = Object.keys(prompts).filter(cat => prompts[cat]?.length > 0);
  const defaultTab = categories.length > 0 ? categories[0] : "frontend"; // Default to first available or 'frontend'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <div>
             <CardTitle>Development Prompts</CardTitle>
             <CardDescription>AI-generated prompts to help implement your plan.</CardDescription>
           </div>
           <Button
             variant="outline"
             size="sm"
             onClick={downloadCombinedPrompt}
             disabled={isExporting || categories.length === 0}
           >
             {isExporting ? "Generating..." : <><Download className="mr-2 h-4 w-4" /> Download All</>}
           </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
             <p className="text-muted-foreground mt-4">No prompts available.</p>
          ) : (
            <Tabs defaultValue={defaultTab} className="mt-4">
              <TabsList className={`grid w-full grid-cols-${categories.length}`}>
                {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat} className="capitalize">{cat}</TabsTrigger>
                ))}
              </TabsList>
              {categories.map(cat => (
                 <TabsContent key={cat} value={cat} className="mt-4 space-y-4">
                    {renderPromptsForCategory(prompts[cat])}
                 </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
