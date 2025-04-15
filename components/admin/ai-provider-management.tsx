"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PlusCircle, Edit, RefreshCw, Key, Trash2, AlertCircle, Loader2 } from "lucide-react"
import { AIProviderDialog } from "@/components/admin/ai-provider-dialog"
import { AIModelDialog } from "@/components/admin/ai-model-dialog"
import { useToast } from "@/components/ui/use-toast" // Import useToast
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

interface AIModel {
  id: string;
  providerId: string;
  modelName: string;
  description?: string | null;
  inputCost?: number | null;
  outputCost?: number | null;
  contextWindow?: number | null;
}

interface AIProvider {
  id: string;
  name: string;
  apiKeyEnvVarName?: string | null;
  baseUrl?: string | null;
  models: AIModel[];
  createdAt: Date;
  updatedAt: Date;
}

export function AIProviderManagement() {
  const [providers, setProviders] = useState<AIProvider[]>([])
  const { toast } = useToast()
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null)
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false)
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<any>(null)
  const [currentModel, setCurrentModel] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for Provider Delete Confirmation
  const [isProviderDeleteDialogOpen, setIsProviderDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<AIProvider | null>(null);

  // State for Model Delete Confirmation
  const [isModelDeleteDialogOpen, setIsModelDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<(AIModel & { providerId: string }) | null>(null);

  const fetchProviders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/ai-providers');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data: AIProvider[] = await response.json();
      setProviders(data);
      if (data.length > 0 && !activeProviderId) {
        setActiveProviderId(data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch providers:", err);
      setError(err.message || "Failed to load AI providers.");
      toast({
        title: "Error Loading Providers",
        description: err.message || "Could not fetch AI providers from the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const selectedProvider = providers.find((p) => p.id === activeProviderId)

  const handleAddProvider = () => {
    setCurrentProvider(null)
    setIsProviderDialogOpen(true)
  }

  const handleEditProvider = (provider: AIProvider) => {
    setCurrentProvider(provider)
    setIsProviderDialogOpen(true)
  }

  const handleSaveProvider = async (providerData: Partial<AIProvider>) => {
    // Client-side validation & logging
    console.log("Saving provider with data:", providerData);
    if (!providerData.name || providerData.name.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Provider Name cannot be empty.",
        variant: "destructive",
      });
      return; // Stop execution if validation fails
    }
    // Add more checks later if needed (e.g., baseUrl format)

    const isUpdating = !!currentProvider;
    const url = isUpdating ? `/api/admin/ai-providers/${currentProvider.id}` : '/api/admin/ai-providers';
    const method = isUpdating ? 'PUT' : 'POST';

    // Prepare data for API: Convert empty optional strings to null
    const dataToSend = {
      ...providerData,
      apiKeyEnvVarName: providerData.apiKeyEnvVarName?.trim() === "" ? null : providerData.apiKeyEnvVarName,
      baseUrl: providerData.baseUrl?.trim() === "" ? null : providerData.baseUrl,
    };
    console.log("Data being sent to API:", dataToSend); // Log corrected data

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend), // Send the corrected data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast({
        title: `Provider ${isUpdating ? 'Updated' : 'Created'}`,
        description: `Provider "${providerData.name || currentProvider?.name}" saved successfully.`,
      });

      await fetchProviders(); // Refresh the list

      // If creating, switch tab to the new provider
      if (!isUpdating) {
        const newProvider = await response.json(); // Get the full provider data including ID
        if (newProvider && newProvider.id) {
             setActiveProviderId(newProvider.id);
        }
      }

    } catch (err: any) {
      console.error(`Failed to ${isUpdating ? 'update' : 'create'} provider:`, err);
      toast({
        title: `Error ${isUpdating ? 'Updating' : 'Creating'} Provider`,
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProviderDialogOpen(false);
    }
  }

  const handleDeleteProviderClick = (provider: AIProvider) => {
    setProviderToDelete(provider);
    setIsProviderDeleteDialogOpen(true);
  };

  const confirmDeleteProvider = async () => {
    if (!providerToDelete) return;

    try {
      const response = await fetch(`/api/admin/ai-providers/${providerToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete provider');
      }

      // Remove provider from local state
      setProviders((prev) => prev.filter((p) => p.id !== providerToDelete.id));
      toast({
        title: "Success",
        description: `Provider "${providerToDelete.name}" deleted successfully.`,
      });

    } catch (err: any) {
      console.error("Error deleting provider:", err);
      toast({
        title: "Error",
        description: err.message || "Could not delete provider.",
        variant: "destructive",
      });
    } finally {
      setProviderToDelete(null);
      setIsProviderDeleteDialogOpen(false);
    }
  };

  const handleAddModel = () => {
    setCurrentModel(null)
    setIsModelDialogOpen(true)
  }

  const handleEditModel = (model: AIModel) => {
    setCurrentModel(model)
    setIsModelDialogOpen(true)
  }

  const handleSaveModel = async (modelData: Partial<AIModel>) => {
    if (!selectedProvider) {
      toast({
        title: "Error Saving Model",
        description: "No provider selected.",
        variant: "destructive",
      });
      return;
    }

    const isUpdating = !!currentModel;
    const url = isUpdating
      ? `/api/admin/ai-providers/${selectedProvider.id}/models/${currentModel.id}`
      : `/api/admin/ai-providers/${selectedProvider.id}/models`;
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        // Ensure providerId is included when creating, but not necessarily updating
        body: JSON.stringify(isUpdating ? modelData : { ...modelData, providerId: selectedProvider.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast({
        title: `Model ${isUpdating ? 'Updated' : 'Created'}`,
        description: `Model "${modelData.modelName || currentModel?.modelName}" for provider "${selectedProvider.name}" saved successfully.`,
      });

      await fetchProviders(); // Refresh the list (providers contain models)

    } catch (err: any) {
      console.error(`Failed to ${isUpdating ? 'update' : 'create'} model:`, err);
      toast({
        title: `Error ${isUpdating ? 'Updating' : 'Creating'} Model`,
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsModelDialogOpen(false);
    }
  }

  const handleDeleteModelClick = (model: AIModel, providerId: string) => {
    setModelToDelete({ ...model, providerId }); // Store model and its provider ID
    setIsModelDeleteDialogOpen(true);
  };

  const confirmDeleteModel = async () => {
    if (!modelToDelete) return;

    try {
      const response = await fetch(`/api/admin/ai-providers/${modelToDelete.providerId}/models/${modelToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete model');
      }

      // Remove model from the correct provider in local state
      setProviders((prevProviders) =>
        prevProviders.map((provider) => {
          if (provider.id === modelToDelete.providerId) {
            return {
              ...provider,
              models: provider.models.filter((m) => m.id !== modelToDelete.id),
            };
          }
          return provider;
        })
      );
      toast({
        title: "Success",
        description: `Model "${modelToDelete.modelName}" deleted successfully.`,
      });

    } catch (err: any) {
      console.error("Error deleting model:", err);
      toast({
        title: "Error",
        description: err.message || "Could not delete model.",
        variant: "destructive",
      });
    } finally {
      setModelToDelete(null);
      setIsModelDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Render Dialogs UNCONDITIONALLY here, outside the main content flow */}
      <AIProviderDialog
        open={isProviderDialogOpen}
        onOpenChange={setIsProviderDialogOpen}
        onSave={handleSaveProvider}
        provider={currentProvider}
      />
      <AIModelDialog
        open={isModelDialogOpen}
        onOpenChange={setIsModelDialogOpen}
        onSave={handleSaveModel}
        model={currentModel}
        providerName={selectedProvider?.name || ""}
      />

      {/* Provider Delete Confirmation Dialog */}
      <AlertDialog open={isProviderDeleteDialogOpen} onOpenChange={setIsProviderDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the provider
              <strong className="px-1">{providerToDelete?.name}</strong>
              and all of its associated models. Proceed with caution.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProviderToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProvider} className="bg-red-600 hover:bg-red-700">
              Yes, delete provider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Model Delete Confirmation Dialog */}
      <AlertDialog open={isModelDeleteDialogOpen} onOpenChange={setIsModelDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the model
              <strong className="px-1">{modelToDelete?.modelName}</strong>
              from the provider. Consider any prompts that might be using this model.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setModelToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteModel} className="bg-red-600 hover:bg-red-700">
              Yes, delete model
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main content area wrapper */}
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4">
          <h1 className="font-semibold text-lg md:text-xl">AI Provider Management</h1>
          <p className="text-muted-foreground text-sm">
            Configure and manage the AI providers and models used by the system.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Loading providers...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <Card className="border-destructive">
            <CardHeader className="flex flex-row items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Error Loading Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button onClick={fetchProviders} variant="destructive" size="sm" className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs Content - Render only when not loading and no error */}
        {!isLoading && !error && (
          <Tabs value={activeProviderId || ""} onValueChange={setActiveProviderId} className="flex-1">
            <div className="flex items-center">
              <TabsList>
                {providers.map((provider) => (
                  <TabsTrigger key={provider.id} value={provider.id}>
                    {provider.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <Button onClick={fetchProviders} variant="outline" size="sm" className="h-7 gap-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Refresh
                  </span>
                </Button>
                <Button onClick={handleAddProvider} size="sm" className="h-7 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Provider
                  </span>
                </Button>
              </div>
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
                            value={provider.apiKeyEnvVarName ?? ''}
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
                        <Input id={`${provider.id}-endpoint`} value={provider.baseUrl ?? ''} readOnly />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t px-6 py-4">
                    <Button variant="outline" onClick={() => handleEditProvider(provider)} className="mr-2">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Provider
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Test Connection
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteProviderClick(provider)} 
                      disabled={providers.length <= 1}
                      title={providers.length <= 1 ? "Cannot delete the last provider" : "Delete Provider"}
                      className="ml-auto" // Push to the right
                      >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Provider
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
                      <Button onClick={handleAddModel} disabled={provider.apiKeyEnvVarName === undefined}>
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
                                <td className="p-3 font-medium">{model.modelName}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={true}
                                      onCheckedChange={() => console.log("TODO: Implement toggle model status")}
                                      id={`${model.id}-status`}
                                      disabled={provider.apiKeyEnvVarName === undefined}
                                    />
                                    <Label htmlFor={`${model.id}-status`}>
                                      Active
                                    </Label>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center">
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Default</Badge>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditModel(model)}>
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Edit Model</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteModelClick(model, provider.id)} title="Delete Model">
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                      <span className="sr-only">Delete Model</span>
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
        )}
      </main>
    </div>
  )
}
