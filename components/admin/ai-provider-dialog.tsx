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

interface AIProviderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: any | null
  onSave: (providerData: any) => void
}

export function AIProviderDialog({ open, onOpenChange, provider, onSave }: AIProviderDialogProps) {
  // Use correct state fields matching the AIProvider interface/schema
  const [providerData, setProviderData] = useState({
    name: "",
    apiKeyEnvVarName: "", // Changed from apiKey
    baseUrl: "", // Changed from endpoint
  })

  useEffect(() => {
    if (provider) {
      setProviderData({
        name: provider.name,
        apiKeyEnvVarName: provider.apiKeyEnvVarName || "", // Use correct field
        baseUrl: provider.baseUrl || "", // Use correct field
      })
    } else {
      setProviderData({
        name: "",
        apiKeyEnvVarName: "", // Use correct field
        baseUrl: "", // Use correct field
      })
    }
  }, [provider, open])

  const handleChange = (field: string, value: any) => {
    setProviderData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(providerData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{provider ? "Edit Provider" : "Add Provider"}</DialogTitle>
            <DialogDescription>
              {provider ? "Update AI provider configuration." : "Add a new AI provider to the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Provider Name
              </Label>
              <Input
                id="name"
                value={providerData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKeyEnvVarName" className="text-right">
                API Key Env Var
              </Label>
              <Input
                id="apiKeyEnvVarName"
                type="text" // Changed from password, as it's an env var name
                placeholder="e.g., OPENAI_API_KEY"
                value={providerData.apiKeyEnvVarName}
                onChange={(e) => handleChange("apiKeyEnvVarName", e.target.value)}
                className="col-span-3"
              />
              {/* Add helper text/tooltip about using env var names */}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="baseUrl" className="text-right">
                Base URL (Optional)
              </Label>
              <Input
                id="baseUrl"
                placeholder="e.g., https://api.openai.com/v1"
                value={providerData.baseUrl}
                onChange={(e) => handleChange("baseUrl", e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{provider ? "Save Changes" : "Add Provider"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
