"use client"

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, MessageSquarePlus } from "lucide-react"; // Icons

// Schema for the feedback form inside the dialog
const feedbackFormSchema = z.object({
  userComment: z.string().min(1, "Feedback comment cannot be empty.").max(1000, "Comment must be 1000 characters or less."),
});

type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

interface FeedbackDialogTriggerProps {
  sectionIdentifier: string;
  originalText: string | null | undefined; // Allow null/undefined
  cardTitle: string; // Title for the card displaying the original text
  projectId: string;
  planId: string; // This is the specific Plan (version) ID
}

export function FeedbackDialogTrigger({
  sectionIdentifier,
  originalText,
  cardTitle,
  projectId,
  planId,
}: FeedbackDialogTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      userComment: "",
    },
  });

  // Handle feedback submission
  async function onSubmit(values: FeedbackFormData) {
    if (!originalText) {
        toast.error("Cannot submit feedback for empty content.");
        return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/plans/${projectId}/versions/${planId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionIdentifier,
          originalText, // Send the original text context
          userComment: values.userComment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      toast.success("Feedback submitted successfully!");
      form.reset(); // Reset form fields
      setIsOpen(false); // Close the dialog

    } catch (error) {
      console.error("Failed to submit feedback:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to submit feedback: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Render nothing if originalText is empty/null/undefined
  if (!originalText) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display original text - handle potential long text */}
        <div className="prose prose-sm dark:prose-invert max-w-none max-h-60 overflow-y-auto p-4 border rounded bg-muted/40">
           <pre className="whitespace-pre-wrap break-words">{originalText}</pre>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Provide Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Provide Feedback on: {cardTitle}</DialogTitle>
              <DialogDescription>
                Review the original text below and provide your feedback or suggestions in the comment box.
              </DialogDescription>
            </DialogHeader>

            {/* Display original text within dialog */}
            <div className="mt-4 max-h-40 overflow-y-auto rounded border bg-muted p-3 text-sm">
               <pre className="whitespace-pre-wrap break-words">{originalText}</pre>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="userComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Feedback / Comments <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your feedback here..."
                          className="resize-y min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                     <Button type="button" variant="outline" disabled={isSubmitting}>
                       Cancel
                     </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
