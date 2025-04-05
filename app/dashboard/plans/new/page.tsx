"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
// Removed: import { generatePlan } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast" // Import useToast

export default function NewPlanPage() {
  const router = useRouter()
  const { toast } = useToast() // Initialize toast
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    codeEditor: "",
    targetAudience: "",
    keyGoals: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsGenerating(true)

    try {
      // Call the new API endpoint
      const response = await fetch('/api/plans/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.name,
          description: formData.description,
          codeEditor: formData.codeEditor,
          targetAudience: formData.targetAudience,
          keyGoals: formData.keyGoals
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to the newly created plan using the returned ID
        console.log("Plan created successfully:", result);
        toast({
          title: "Plan Generation Started",
          description: "Your new website plan is being generated.",
        });
        router.push(`/dashboard/plans/${result.id}`); // Use the ID from the response
      } else {
        // Handle error from API
        console.error("Failed to initiate plan:", result.message || 'Unknown error');
        toast({
          title: "Error",
          description: `Failed to start plan generation: ${result.message || 'Please try again.'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error initiating plan:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Error",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create New Website Plan</h2>
        <p className="text-muted-foreground">
          Describe your website idea and let our AI generate a comprehensive plan.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Website Details</CardTitle>
            <CardDescription>Provide the name and a detailed description of your website idea.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Website"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Website Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your website idea, including its purpose, target audience, and key features..."
                className="min-h-32"
                value={formData.description}
                onChange={handleChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                The more details you provide, the better the AI can understand your vision.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codeEditor">Preferred Code Editor</Label>
              <Input
                id="codeEditor"
                placeholder="VS Code, WebStorm, etc."
                value={formData.codeEditor}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea
                id="targetAudience"
                placeholder="Describe your target audience (age, interests, technical level, etc.)"
                className="min-h-24"
                value={formData.targetAudience}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyGoals">Key Goals</Label>
              <Textarea
                id="keyGoals"
                placeholder="What are the main objectives for this website?"
                className="min-h-24"
                value={formData.keyGoals}
                onChange={handleChange}
                required
              />
            </div>

          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? "Generating Plan..." : "Generate Plan"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
