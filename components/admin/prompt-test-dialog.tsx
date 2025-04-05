"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PromptTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: any | null
}

export function PromptTestDialog({ open, onOpenChange, prompt }: PromptTestDialogProps) {
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [filledPrompt, setFilledPrompt] = useState("")
  const [result, setResult] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("variables")

  useEffect(() => {
    if (prompt) {
      const initialVariables: Record<string, string> = {}
      prompt.variables.forEach((variable: string) => {
        initialVariables[variable] = ""
      })
      setVariables(initialVariables)
      setFilledPrompt("")
      setResult("")
    }
  }, [prompt, open])

  const handleVariableChange = (variable: string, value: string) => {
    setVariables((prev) => ({
      ...prev,
      [variable]: value,
    }))
  }

  const fillPrompt = () => {
    if (!prompt) return

    let filled = prompt.template
    Object.entries(variables).forEach(([variable, value]) => {
      filled = filled.replace(new RegExp(`\\{\\{${variable}\\}\\}`, "g"), value || `{{${variable}}}`)
    })

    setFilledPrompt(filled)
    setActiveTab("preview")
  }

  const testPrompt = async () => {
    if (!filledPrompt) {
      fillPrompt()
    }

    setIsGenerating(true)

    // Simulate AI response
    setTimeout(() => {
      setResult(`This is a simulated AI response based on your prompt. In a real implementation, this would call the selected AI provider's API with the filled prompt.

The response would contain generated content based on the prompt template and the variables you provided.

For example, if this was an "Executive Summary" prompt, you would see a professionally written executive summary here that incorporates all the details you specified in the variables.`)

      setIsGenerating(false)
      setActiveTab("result")
    }, 2000)
  }

  if (!prompt) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Test Prompt: {prompt.name}</DialogTitle>
          <DialogDescription>Fill in the variables to test how this prompt template works.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="space-y-4 py-4">
            <div className="space-y-4">
              {prompt.variables.map((variable: string) => (
                <div key={variable} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`var-${variable}`} className="text-right">
                    {variable}
                  </Label>
                  <Input
                    id={`var-${variable}`}
                    value={variables[variable] || ""}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                    className="col-span-3"
                    placeholder={`Value for ${variable}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={fillPrompt}>Preview Prompt</Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Filled Prompt</Label>
              <Textarea value={filledPrompt} readOnly className="min-h-32 font-mono text-sm" />
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setActiveTab("variables")} variant="outline">
                Edit Variables
              </Button>
              <Button onClick={testPrompt} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Test with AI"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="result" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>AI Response</Label>
              <div className="rounded-md border p-4 min-h-32 bg-muted/30">
                {result ? (
                  <div className="whitespace-pre-line">{result}</div>
                ) : (
                  <div className="text-muted-foreground text-center py-10">
                    No result generated yet. Click "Test with AI" to generate a response.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setActiveTab("preview")} variant="outline">
                Back to Preview
              </Button>
              <Button onClick={testPrompt} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Regenerate"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

