"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner"; // Assuming sonner is used for toasts
import { Loader2 } from "lucide-react"; // For loading spinner

// Define the schema for the form using Zod
const formSchema = z.object({
  projectName: z.string().min(1, "Project Name is required."),
  projectDescription: z.string().min(10, "Description must be at least 10 characters.").max(500, "Description must be 500 characters or less."),
  codeEditor: z.string().min(1, "Please select a code editor preference."),
  targetAudience: z.string().min(10, "Target Audience description must be at least 10 characters.").max(500, "Target Audience must be 500 characters or less."),
  keyGoals: z.string().min(10, "Key Goals description must be at least 10 characters.").max(500, "Key Goals must be 500 characters or less."),
});

type FormData = z.infer<typeof formSchema>;

const codeEditorOptions = [
  "None",
  "Cursor.ai",
  "GitHub Copilot",
  "Windsurf",
  "Bolt.new",
  "Lovable",
];

export function PlanCreationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      projectDescription: "",
      codeEditor: "",
      targetAudience: "",
      keyGoals: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/plans/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: values.projectName,
          projectDescription: values.projectDescription,
          codeEditor: values.codeEditor,
          targetAudience: values.targetAudience,
          keyGoals: values.keyGoals
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newProject = await response.json();
      toast.success("Project initiated successfully!");
      // Redirect to the newly created project/plan page
      // Assuming the response contains the new project ID
      router.push(`/dashboard/plans/${newProject.id}`);
      router.refresh(); // Refresh server components if needed

    } catch (error) {
      console.error("Failed to initiate project:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to initiate project: ${message}`);
      setIsLoading(false); // Ensure loading state is reset on error
    }
    // Do not reset loading state here if redirecting on success
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Project Name */}
        <FormField
          control={form.control}
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g., My Awesome SaaS" {...field} />
              </FormControl>
              <FormDescription>
                Give your project a clear and concise name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Description */}
        <FormField
          control={form.control}
          name="projectDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Description <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the main purpose and features of your website or application..."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a detailed description. This will be used by the AI to generate the initial plan. (Min 10 chars, Max 500 chars)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Code Editor */}
        <FormField
          control={form.control}
          name="codeEditor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred AI Code Editor <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred AI code editor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {codeEditorOptions.map((editor) => (
                    <SelectItem key={editor} value={editor}>
                      {editor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the AI-assisted code editor you primarily use (if any).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target Audience */}
        <FormField
          control={form.control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the primary users of this project. Who are they? What are their needs?"
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Help the AI understand who this project is for. (Min 10 chars, Max 500 chars)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Key Goals */}
        <FormField
          control={form.control}
          name="keyGoals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Goals <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List the main objectives and success metrics for this project. What should it achieve?"
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                What are the most important outcomes for this project? (Min 10 chars, Max 500 chars)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initiating Plan...
            </>
          ) : (
            "Initiate Plan"
          )}
        </Button>
      </form>
    </Form>
  );
}
