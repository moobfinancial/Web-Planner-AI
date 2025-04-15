"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Loader } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: any | null
  onSave: (promptData: any) => Promise<void>
  categoryId: string
  aiProviders: SimpleAIProvider[]
}

interface SimpleAIProvider {
  id: string
  name: string
  models: SimpleAIModel[]
}

interface SimpleAIModel {
  id: string
  modelName: string
}

export function PromptDialog({
  open,
  onOpenChange,
  prompt,
  onSave,
  categoryId,
  aiProviders,
}: PromptDialogProps) {
  const [promptData, setPromptData] = useState({
    name: "",
    description: "",
    template: "",
    variables: [] as string[],
    newVariable: "",
    providerId: "",
    modelId: "",
  })

  const [isVariableConfirmOpen, setIsVariableConfirmOpen] = useState(false)
  const [variableToRemove, setVariableToRemove] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)

  const availableModels = aiProviders.find((p) => p.id === promptData.providerId)?.models || []

  useEffect(() => {
    if (prompt) {
      setPromptData({
        name: prompt.name,
        description: prompt.description,
        template: prompt.template,
        variables: [...(prompt.variables || [])],
        newVariable: "",
        providerId: prompt.model?.providerId || "",
        modelId: prompt.modelId || "",
      })
    } else {
      const defaultProviderId = aiProviders.length > 0 ? aiProviders[0].id : ""
      const defaultModels = defaultProviderId ? aiProviders[0].models : []
      const defaultModelId = defaultModels.length > 0 ? defaultModels[0].id : ""

      setPromptData({
        name: "",
        description: "",
        template: "",
        variables: [],
        newVariable: "",
        providerId: defaultProviderId,
        modelId: defaultModelId,
      })
    }
  }, [prompt, open, aiProviders])

  const handleChange = (field: string, value: any) => {
    setPromptData((prev) => {
      const newState = { ...prev, [field]: value }
      if (field === "providerId") {
        const newProvider = aiProviders.find((p) => p.id === value)
        const newModels = newProvider?.models || []
        newState.modelId = newModels.length > 0 ? newModels[0].id : ""
      }
      return newState
    })
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
    setVariableToRemove(variable)
    setIsVariableConfirmOpen(true)
  }

  const confirmRemoveVariable = () => {
    if (!variableToRemove) return

    setPromptData((prev) => ({
      ...prev,
      variables: prev.variables.filter((v) => v !== variableToRemove),
    }))

    setVariableToRemove(null)
    setIsVariableConfirmOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { newVariable, providerId, ...restData } = promptData
    const dataToSave: any = {
      ...restData,
      id: prompt?.id,
      categoryId: categoryId,
    }

    if (promptData.providerId && promptData.modelId) {
      dataToSave.modelId = promptData.modelId
    } else {
      dataToSave.modelId = null
    }

    setIsSaving(true)
    try {
      await onSave(dataToSave)
    } catch (error) {
      console.error("Error during onSave call:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const extractVariablesFromTemplate = () => {
    const regex = /\{\{([^}]+)\}\}/g
    const matches = [...promptData.template.matchAll(regex)]
    const extractedVariables = matches.map((match) => match[1].trim())

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
                        <span
                          className="cursor-pointer text-primary/50 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveVariable(variable)
                          }}
                          title="Remove variable from list"
                        >
                          <X className="h-3 w-3" />
                        </span>
                        {variable}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="providerId" className="text-right">
                AI Provider
              </Label>
              <Select
                value={promptData.providerId}
                onValueChange={(value) => handleChange("providerId", value)}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select AI Provider" />
                </SelectTrigger>
                <SelectContent>
                  {aiProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {promptData.providerId && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modelId" className="text-right">
                  AI Model
                </Label>
                <Select
                  value={promptData.modelId}
                  onValueChange={(value) => handleChange("modelId", value)}
                  required
                  disabled={!promptData.providerId || availableModels.length === 0}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select AI Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.length > 0 ? (
                      availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.modelName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No models available for this provider
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                prompt ? "Save Changes" : "Create Prompt"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <AlertDialog open={isVariableConfirmOpen} onOpenChange={setIsVariableConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Variable?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the variable "{variableToRemove}" from this list?
              <br />
              <br />
              **Important:** Removing it here only affects this list. You must also manually remove the corresponding{" "}
              <code>{`{{"${variableToRemove}"}}`}</code> placeholder from the template text above to avoid errors when the prompt is used.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVariableToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveVariable} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Remove from List
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
