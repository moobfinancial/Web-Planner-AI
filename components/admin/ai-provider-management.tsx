"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PlusCircle, Edit, RefreshCw, Key } from "lucide-react"
import { AIProviderDialog } from "@/components/admin/ai-provider-dialog"
import { AIModelDialog } from "@/components/admin/ai-model-dialog"

// Mock data for AI providers
const mockProviders = [
  {
    id: "openai",
    name: "OpenAI",
    status: "active",
    apiKey: "sk-••••••••••••••••••••••••••••••",
    endpoint: "https://api.openai.com/v1",
    models: [
      { id: "gpt-4o", name: "GPT-4o", status: "active", isDefault: true },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", status: "active", isDefault: false },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", status: "active", isDefault: false },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    status: "active",
    apiKey: "sk-ant-••••••••••••••••••••••••••",
    endpoint: "https://api.anthropic.com",
    models: [
      { id: "claude-3-opus", name: "Claude 3 Opus", status: "active", isDefault: false },
      { id: "claude-3-sonnet", name: "Claude 3 Sonnet", status: "active", isDefault: false },
      { id: "claude-3-haiku", name: "Claude 3 Haiku", status: "active", isDefault: false },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    status: "inactive",
    apiKey: "",
    endpoint: "https://api.mistral.ai/v1",
    models: [
      { id: "mistral-large", name: "Mistral Large", status: "inactive", isDefault: false },
      { id: "mistral-medium", name: "Mistral Medium", status: "inactive", isDefault: false },
      { id: "mistral-small", name: "Mistral Small", status: "inactive", isDefault: false },
    ],
  },
]

export function AIProviderManagement() {
  const [providers, setProviders] = useState(mockProviders)
  const [activeProvider, setActiveProvider] = useState(providers[0].id)
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false)
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<any>(null)
  const [currentModel, setCurrentModel] = useState<any>(null)

  const selectedProvider = providers.find((p) => p.id === activeProvider)

  const handleAddProvider = () => {
    setCurrentProvider(null)
    setIsProviderDialogOpen(true)
  }

  const handleEditProvider = (provider: any) => {
    setCurrentProvider(provider)
    setIsProviderDialogOpen(true)
  }

  const handleSaveProvider = (providerData: any) => {
    if (currentProvider) {
      // Update existing provider
      setProviders(
        providers.map((provider) => (provider.id === currentProvider.id ? { ...provider, ...providerData } : provider)),
      )
    } else {
      // Create new provider
      const newProvider = {
        id: providerData.id || `provider-${Date.now()}`,
        ...providerData,
        models: [],
      }
      setProviders([...providers, newProvider])
      setActiveProvider(newProvider.id)
    }
    setIsProviderDialogOpen(false)
  }

  const handleToggleProviderStatus = (providerId: string) => {
    setProviders(
      providers.map((provider) =>
        provider.id === providerId
          ? {
              ...provider,
              status: provider.status === "active" ? "inactive" : "active",
              models: provider.models.map((model) => ({
                ...model,
                status: provider.status === "active" ? "inactive" : "active",
              })),
            }
          : provider,
      ),
    )
  }

  const handleAddModel = () => {
    setCurrentModel(null)
    setIsModelDialogOpen(true)
  }

  const handleEditModel = (model: any) => {
    setCurrentModel(model)
    setIsModelDialogOpen(true)
  }

  const handleSaveModel = (modelData: any) => {
    if (!selectedProvider) return

    if (currentModel) {
      // Update existing model
      setProviders(
        providers.map((provider) =>
          provider.id === selectedProvider.id
            ? {
                ...provider,
                models: provider.models.map((model) =>
                  model.id === currentModel.id ? { ...model, ...modelData } : model,
                ),
              }
            : provider,
        ),
      )
    } else {
      // Create new model
      const newModel = {
        id: modelData.id || `model-${Date.now()}`,
        ...modelData,
        status: selectedProvider.status === "active" ? "active" : "inactive",
      }

      setProviders(
        providers.map((provider) =>
          provider.id === selectedProvider.id ? { ...provider, models: [...provider.models, newModel] } : provider,
        ),
      )
    }
    setIsModelDialogOpen(false)
  }

  const handleSetDefaultModel = (modelId: string) => {
    setProviders(
      providers.map((provider) =>
        provider.id === selectedProvider?.id
          ? {
              ...provider,
              models: provider.models.map((model) => ({
                ...model,
                isDefault: model.id === modelId,
              })),
            }
          : provider,
      ),
    )
  }

  const handleToggleModelStatus = (modelId: string) => {
    setProviders(
      providers.map((provider) =>
        provider.id === selectedProvider?.id
          ? {
              ...provider,
              models: provider.models.map((model) =>
                model.id === modelId ? { ...model, status: model.status === "active" ? "inactive" : "active" } : model,
              ),
            }
          : provider,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeProvider} onValueChange={setActiveProvider}>
        <div className="flex items-center justify-between">
          <TabsList>
            {providers.map((provider) => (
              <TabsTrigger key={provider.id} value={provider.id} className="relative">
                {provider.name}
                {provider.status === "inactive" && (
                  <Badge variant="outline" className="ml-2 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    Inactive
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button onClick={handleAddProvider}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>

        {providers.map((provider) => (
          <TabsContent key={provider.id} value={provider.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{provider.name} Configuration</CardTitle>
                    <CardDescription>Manage API keys and endpoint settings</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={provider.status === "active"}
                      onCheckedChange={() => handleToggleProviderStatus(provider.id)}
                      id={`${provider.id}-status`}
                    />
                    <Label htmlFor={`${provider.id}-status`}>
                      {provider.status === "active" ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${provider.id}-api-key`}>API Key</Label>
                    <div className="flex">
                      <Input
                        id={`${provider.id}-api-key`}
                        type="password"
                        value={provider.apiKey}
                        readOnly
                        className="rounded-r-none"
                      />
                      <Button variant="outline" className="rounded-l-none border-l-0">
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${provider.id}-endpoint`}>API Endpoint</Label>
                    <Input id={`${provider.id}-endpoint`} value={provider.endpoint} readOnly />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleEditProvider(provider)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Configuration
                </Button>
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Models</CardTitle>
                    <CardDescription>Configure AI models for this provider</CardDescription>
                  </div>
                  <Button onClick={handleAddModel} disabled={provider.status !== "active"}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Model
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Model</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">Default</th>
                        <th className="p-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {provider.models.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-3 text-center text-muted-foreground">
                            No models configured.
                          </td>
                        </tr>
                      ) : (
                        provider.models.map((model) => (
                          <tr key={model.id} className="border-b">
                            <td className="p-3 font-medium">{model.name}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={model.status === "active"}
                                  onCheckedChange={() => handleToggleModelStatus(model.id)}
                                  id={`${model.id}-status`}
                                  disabled={provider.status !== "active"}
                                />
                                <Label htmlFor={`${model.id}-status`}>
                                  {model.status === "active" ? "Active" : "Inactive"}
                                </Label>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                {model.isDefault ? (
                                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Default</Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetDefaultModel(model.id)}
                                    disabled={model.status !== "active" || provider.status !== "active"}
                                  >
                                    Set as Default
                                  </Button>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditModel(model)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <AIProviderDialog
        open={isProviderDialogOpen}
        onOpenChange={setIsProviderDialogOpen}
        provider={currentProvider}
        onSave={handleSaveProvider}
      />

      <AIModelDialog
        open={isModelDialogOpen}
        onOpenChange={setIsModelDialogOpen}
        model={currentModel}
        onSave={handleSaveModel}
      />
    </div>
  )
}

