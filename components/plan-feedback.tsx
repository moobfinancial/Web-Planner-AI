"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export function PlanFeedback() {
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    // Simulate feedback submission
    setTimeout(() => {
      setIsSubmitting(false)
      setFeedback("")
      // Show success message or redirect
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Provide Feedback</CardTitle>
          <CardDescription>Share your thoughts on the current plan to help refine it.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Textarea
              placeholder="What changes would you like to see in the next version of this plan? Be specific about what you like, what you don't like, and what you'd like to add or remove."
              className="min-h-32"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Previous Feedback</CardTitle>
          <CardDescription>History of feedback provided for this plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Feedback #2</p>
                <p className="text-sm text-muted-foreground">2 days ago</p>
              </div>
              <p className="mt-2 text-sm">
                The plan looks good overall, but I'd like to see more emphasis on mobile responsiveness and perhaps add
                a loyalty program feature to encourage repeat customers.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Feedback #1</p>
                <p className="text-sm text-muted-foreground">3 days ago</p>
              </div>
              <p className="mt-2 text-sm">
                I think we need to add more details about the shipping and return policies. Also, can we include
                integration with social media platforms for marketing purposes?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

