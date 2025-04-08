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

interface AIModelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  model: any | null
  onSave: (modelData: any) => void
}

export function AIModelDialog({ open, onOpenChange, model, onSave }: AIModelDialogProps) {
  // State matches the API schema (Zod schema in route.ts)
  const [modelData, setModelData] = useState({
    modelName: "",
    description: "",
    inputCost: "", // Store as string initially to handle empty input
    outputCost: "", // Store as string initially
    contextWindow: "", // Store as string initially
  })

  useEffect(() => {
    if (model) {
      // Pre-fill form for editing (convert numbers back to string for input)
      setModelData({
        modelName: model.modelName || "",
        description: model.description || "",
        inputCost: model.inputCost?.toString() || "",
        outputCost: model.outputCost?.toString() || "",
        contextWindow: model.contextWindow?.toString() || "",
      })
    } else {
      // Reset form for adding
      setModelData({
        modelName: "",
        description: "",
        inputCost: "",
        outputCost: "",
        contextWindow: "",
      })
    }
  }, [model, open])

  const handleChange = (field: keyof typeof modelData, value: string | boolean | number) => {
    // Basic handling for string inputs
    setModelData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare data for saving: convert cost/window strings to numbers or null
    const dataToSave = {
      modelName: modelData.modelName.trim(),
      description: modelData.description.trim() === "" ? null : modelData.description.trim(),
      inputCost: modelData.inputCost === "" ? null : parseFloat(modelData.inputCost),
      outputCost: modelData.outputCost === "" ? null : parseFloat(modelData.outputCost),
      contextWindow: modelData.contextWindow === "" ? null : parseInt(modelData.contextWindow, 10),
    };

    // Additional validation for numbers (check if parseFloat/parseInt resulted in NaN)
    if (dataToSave.inputCost !== null && isNaN(dataToSave.inputCost)) {
      console.error("Invalid input cost");
      // TODO: Show user error (e.g., toast)
      return;
    }
    if (dataToSave.outputCost !== null && isNaN(dataToSave.outputCost)) {
      console.error("Invalid output cost");
      // TODO: Show user error
      return;
    }
    if (dataToSave.contextWindow !== null && isNaN(dataToSave.contextWindow)) {
      console.error("Invalid context window");
      // TODO: Show user error
      return;
    }

    console.log("Model Dialog handleSubmit - dataToSave:", dataToSave); // Debug log

    onSave(dataToSave); // Send the processed data
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{model ? "Edit Model" : "Add Model"}</DialogTitle>
            <DialogDescription>
              {model ? "Update AI model configuration." : "Add a new AI model to this provider."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="modelName" className="text-right">
                Model Name
              </Label>
              <Input
                id="modelName"
                value={modelData.modelName}
                onChange={(e) => handleChange("modelName", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={modelData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="col-span-3"
                placeholder="(Optional) Describe the model's capabilities or use case."
                rows={3}
              />
            </div>
            {/* Input Cost */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inputCost" className="text-right">
                Input Cost
              </Label>
              <Input
                id="inputCost"
                type="number"
                step="any" // Allow decimals
                min="0"
                value={modelData.inputCost}
                onChange={(e) => handleChange("inputCost", e.target.value)}
                className="col-span-3"
                placeholder="(Optional) e.g., 0.001 (per 1k tokens)"
              />
            </div>
            {/* Output Cost */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="outputCost" className="text-right">
                Output Cost
              </Label>
              <Input
                id="outputCost"
                type="number"
                step="any"
                min="0"
                value={modelData.outputCost}
                onChange={(e) => handleChange("outputCost", e.target.value)}
                className="col-span-3"
                placeholder="(Optional) e.g., 0.003 (per 1k tokens)"
              />
            </div>
            {/* Context Window */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contextWindow" className="text-right">
                Context Window
              </Label>
              <Input
                id="contextWindow"
                type="number"
                step="1" // Integer
                min="1"
                value={modelData.contextWindow}
                onChange={(e) => handleChange("contextWindow", e.target.value)}
                className="col-span-3"
                placeholder="(Optional) e.g., 4096 (tokens)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{model ? "Save Changes" : "Add Model"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
