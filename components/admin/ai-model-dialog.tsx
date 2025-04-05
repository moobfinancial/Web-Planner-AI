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
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

interface AIModelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  model: any | null
  onSave: (modelData: any) => void
}

export function AIModelDialog({ open, onOpenChange, model, onSave }: AIModelDialogProps) {
  const [modelData, setModelData] = useState({
    name: "",
    id: "",
    status: "active",
    isDefault: false,
  })

  useEffect(() => {
    if (model) {
      setModelData({
        name: model.name,
        id: model.id,
        status: model.status,
        isDefault: model.isDefault,
      })
    } else {
      setModelData({
        name: "",
        id: "",
        status: "active",
        isDefault: false,
      })
    }
  }, [model, open])

  const handleChange = (field: string, value: any) => {
    setModelData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(modelData)
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
              <Label htmlFor="name" className="text-right">
                Model Name
              </Label>
              <Input
                id="name"
                value={modelData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">
                Model ID
              </Label>
              <Input
                id="id"
                value={modelData.id}
                onChange={(e) => handleChange("id", e.target.value)}
                className="col-span-3"
                required
                disabled={!!model}
                placeholder={model ? undefined : "e.g., gpt-4, claude-3-opus"}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="flex items-center gap-2 col-span-3">
                <Switch
                  id="status"
                  checked={modelData.status === "active"}
                  onCheckedChange={(checked) => handleChange("status", checked ? "active" : "inactive")}
                />
                <Label htmlFor="status">{modelData.status === "active" ? "Active" : "Inactive"}</Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isDefault" className="text-right">
                Default Model
              </Label>
              <div className="flex items-center gap-2 col-span-3">
                <Checkbox
                  id="isDefault"
                  checked={modelData.isDefault}
                  onCheckedChange={(checked) => handleChange("isDefault", !!checked)}
                  disabled={modelData.status !== "active"}
                />
                <Label htmlFor="isDefault">Set as default model for this provider</Label>
              </div>
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

