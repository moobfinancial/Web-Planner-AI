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

interface AIProviderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: any | null
  onSave: (providerData: any) => void
}

export function AIProviderDialog({ open, onOpenChange, provider, onSave }: AIProviderDialogProps) {
  const [providerData, setProviderData] = useState({
    name: "",
    apiKey: "",
    endpoint: "",
    status: "active",
  })

  useEffect(() => {
    if (provider) {
      setProviderData({
        name: provider.name,
        apiKey: provider.apiKey,
        endpoint: provider.endpoint,
        status: provider.status,
      })
    } else {
      setProviderData({
        name: "",
        apiKey: "",
        endpoint: "",
        status: "active",
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
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={providerData.apiKey}
                onChange={(e) => handleChange("apiKey", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endpoint" className="text-right">
                API Endpoint
              </Label>
              <Input
                id="endpoint"
                value={providerData.endpoint}
                onChange={(e) => handleChange("endpoint", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="flex items-center gap-2 col-span-3">
                <Switch
                  id="status"
                  checked={providerData.status === "active"}
                  onCheckedChange={(checked) => handleChange("status", checked ? "active" : "inactive")}
                />
                <Label htmlFor="status">{providerData.status === "active" ? "Active" : "Inactive"}</Label>
              </div>
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

