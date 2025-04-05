"use client"

import type React from "react"

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
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface PromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: any | null
  onSave: (promptData: any) => void
  categoryId: string
}

export function PromptDialog({ open, onOpenChange, prompt, onSave, categoryId }: PromptDialogProps) {
  const [promptData, setPromptData] = useState({
    name: "",
    description: "",
    template: "",
    variables: [] as string[],
    newVariable: "",
  })

  useEffect(() => {
    if (prompt) {
      setPromptData({
        name: prompt.name,
        description: prompt.description,
        template: prompt.template,
        variables: [...prompt.variables],
        newVariable: "",
      })
    } else {
      setPromptData({
        name: "",
        description: "",
        template: "",
        variables: [],
        newVariable: "",
      })
    }
  }, [prompt, open])

  const handleChange = (field: string, value: any) => {
    setPromptData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddVariable = () => {
    if (!promptData.newVariable.trim()) return

    if (!promptData.variables.includes(promptData.newVariable)) {
      setPromptData((prev) => ({
        ...prev,
        variables: [...prev.variables, prev.newVariable],
        newVariable: "",
      }))
    }
  }

  const handleRemoveVariable = (variable: string) => {
    setPromptData((prev) => ({
      ...prev,
      variables: prev.variables.filter((v) => v !== variable),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const { newVariable, ...dataToSave } = promptData
    onSave({
      ...dataToSave,
      id: prompt?.id,
    })
  }

  const extractVariablesFromTemplate = () => {
    const regex = /\{\{([^}]+)\}\}/g
    const matches = [...promptData.template.matchAll(regex)]
    const extractedVariables = matches.map((match) => match[1].trim())

    // Add only new variables
    const newVariables = extractedVariables.filter((v) => !promptData.variables.includes(v))

    if (newVariables.length > 0) {
      setPromptData((prev) => ({
        ...prev,
        variables: [...prev.variables, ...newVariables],
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{prompt ? "Edit Prompt Template" : "Create Prompt Template"}</DialogTitle>
            <DialogDescription>
              {prompt
                ? "Update the prompt template and its variables."
                : "Create a new prompt template for generating content."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={promptData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={promptData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="template" className="text-right pt-2">
                Template
              </Label>
              <div className="col-span-3 space-y-2">
                <Textarea
                  id="template"
                  value={promptData.template}
                  onChange={(e) => handleChange("template", e.target.value)}
                  className="min-h-32"
                  required
                />
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={extractVariablesFromTemplate}>
                    Extract Variables
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use {"{{"}
                  <span>variable_name</span>
                  {"}}"} syntax for variables that will be replaced when the prompt is used.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="variables" className="text-right pt-2">
                Variables
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="newVariable"
                    value={promptData.newVariable}
                    onChange={(e) => handleChange("newVariable", e.target.value)}
                    placeholder="Add a variable"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddVariable()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddVariable} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {promptData.variables.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No variables added yet.</p>
                  ) : (
                    promptData.variables.map((variable) => (
                      <Badge
                        key={variable}
                        variant="outline"
                        className="bg-primary/10 border-primary/20 flex items-center gap-1"
                      >
                        {variable}
                        <button
                          type="button"
                          onClick={() => handleRemoveVariable(variable)}
                          className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{prompt ? "Save Changes" : "Create Prompt"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

