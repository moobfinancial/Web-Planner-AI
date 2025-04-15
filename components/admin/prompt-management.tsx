"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import axios from 'axios'; // Using axios for HTTP requests
import toast from 'react-hot-toast';
import { Prisma, Prompt, AIModel, PromptCategory, PromptStatus } from '@prisma/client'; // Import Prisma types
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, PlusCircle, Edit, Copy, Archive, Play, Loader2, ArchiveRestore } from "lucide-react"
import { PromptDialog } from "@/components/admin/prompt-dialog"
import { PromptTestDialog } from "@/components/admin/prompt-test-dialog"
import { Label } from "@/components/ui/label"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Switch } from "@/components/ui/switch"; // Import Switch
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

// Define the structure for a prompt including the optional nested model
interface FullAIModel extends Prisma.AIModel {
  provider: Prisma.AIProvider;
}

interface FullPrompt extends Prisma.Prompt {
  model?: FullAIModel | null; // Make model optional and potentially null
}

type PromptWithModel = FullPrompt;

// Define the structure for AIModel fetched for the dropdown
interface AIModel { // Structure for individual models nested within a provider
  id: string;
  providerId: string;
  modelName: string;
}

interface AIProvider {
  id: string;
  name: string;
  apiKeyEnvVarName?: string | null;
  baseUrl?: string | null;
  models: AIModel[]; // Array of models associated with this provider
}

type SimpleAIProvider = Pick<AIProvider, 'id' | 'name'> & {
  models: Pick<AIModel, 'id' | 'modelName'>[];
};

export function PromptManagement() {
  const [prompts, setPrompts] = useState<PromptWithModel[]>([]);
  const [aiProviders, setAiProviders] = useState<SimpleAIProvider[]>([]);
  const [promptCategories, setPromptCategories] = useState<PromptCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<PromptCategory | 'ALL'>('ALL'); // Default to 'ALL' or first category
  const [searchQuery, setSearchQuery] = useState("");
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<PromptWithModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false); // State for archive toggle

  const [newPromptData, setNewPromptData] = useState<Partial<Prompt>>({
    name: '',
    description: '',
    category: 'GENERAL', // Default category
    template: '',
    variables: [],
    status: 'ACTIVE', // Default status
    modelId: null,
  });
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]); // Models for the selected provider

  // State for archive confirmation dialog
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [promptToToggleArchive, setPromptToToggleArchive] = useState<PromptWithModel | null>(null);

  // Helper function to find provider/model names safely
  const getProviderAndModelNames = (prompt: PromptWithModel): { providerName: string; modelName: string } => {
    const providerName = prompt.model?.provider?.name || "-";
    const modelName = prompt.model?.modelName || "-";
    return { providerName, modelName };
  };

  // Fetch initial data (prompts and AI models)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // Construct prompts URL based on showArchived state
    const promptsUrl = `/api/admin/prompts${showArchived ? '?includeArchived=true' : ''}`;
    console.log("Fetching prompts from:", promptsUrl); // Debug log

    try {
      const [promptsResponse, providersResponse] = await Promise.all([
        axios.get<{ data: PromptWithModel[] }>(promptsUrl), // Use dynamic URL
        axios.get<{ data: SimpleAIProvider[] }>("/api/admin/ai-providers")
      ]);

      // Original logic had nested data objects, let's assume API returns data directly or adjust as needed
      const fetchedPrompts = promptsResponse.data || []; // Adjust if response is { data: [...] }
      const fetchedProviders = providersResponse.data || []; // Adjust if response is { data: [...] }

      console.log("Fetched Prompts:", fetchedPrompts); // Debug log
      setPrompts(fetchedPrompts);
      setAiProviders(fetchedProviders);

      // Extract unique categories
      const categories = Array.from(new Set(fetchedPrompts?.map(p => p.category) || [])) as PromptCategory[];
      categories.sort();
      setPromptCategories(categories);

      // Set active category if not set or no longer valid (optional refinement)
      if (activeCategory === 'ALL' && categories.length > 0) {
          // Keep 'ALL' or set a default like categories[0] if preferred
      } else if (!categories.includes(activeCategory as PromptCategory) && categories.length > 0) {
          setActiveCategory(categories[0]);
      } else if (categories.length === 0) {
          setActiveCategory('ALL'); // Fallback if no categories
      }


    } catch (err: any) { // Type error as any
      console.error("Failed to fetch data:", err);
      const errorMsg = err.response?.data?.error || "Failed to load prompts or AI models.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
    // Add showArchived as dependency
  }, [showArchived, activeCategory]); // Dependencies: re-fetch when showArchived or activeCategory changes

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Fetch data on mount and when fetchData changes

  // Memoize filtered prompts for performance
  const filteredPrompts = useMemo(() => {
      let filtered = prompts;

      // Filter by category if not 'ALL'
      if (activeCategory !== 'ALL') {
          filtered = filtered.filter(prompt => prompt.category === activeCategory);
      }

      // Filter by search query
      if (searchQuery) {
          filtered = filtered.filter(prompt =>
              prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (prompt.description && prompt.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
      }

      return filtered;
  }, [prompts, activeCategory, searchQuery]);


  const handleProviderChange = (providerId: string) => {
    setSelectedProviderId(providerId);
    // Find the selected provider and update available models
    const provider = aiProviders.find(p => p.id === providerId);
    setAvailableModels(provider ? provider.models : []);
    // Reset the selected model when provider changes
    setNewPromptData(prev => ({ ...prev, modelId: null }));
  };


  // Function to handle adding a new prompt
  const handleAddPrompt = async (dataFromDialog: Omit<PromptWithModel, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'model'> & { categoryId?: PromptCategory }) => { // Adjust param type
    setIsLoading(true);
    try {
      const payload = {
        name: dataFromDialog.name,
        description: dataFromDialog.description,
        template: dataFromDialog.template,
        variables: dataFromDialog.variables || [],
        category: activeCategory === 'ALL' ? PromptCategory.GENERAL : activeCategory, // Use active category or default
        status: PromptStatus.DRAFT, // Default new prompts to DRAFT
        modelId: dataFromDialog.modelId, // Pass modelId from dialog
      };

      // Validate category (should be handled by selection, but double-check)
      if (!payload.category || payload.category === 'ALL') {
         toast.error("Please select a valid category.");
         setIsLoading(false);
         return;
      }

      const response = await axios.post('/api/admin/prompts', payload);
      setPrompts(prev => [...prev, response.data]); // Add new prompt to state
      setIsPromptDialogOpen(false);
      toast.success('Prompt added successfully!');
      // Optionally reset form state if needed (though dialog unmount might handle it)
      // setNewPromptData(initialPromptState); // Reset local form state if it existed
    } catch (error: any) {
      console.error("Failed to add prompt:", error);
      const errorMessage = error.response?.data?.error || 'Failed to add prompt.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  // Function to handle editing an existing prompt
  const handleEditPrompt = async (dataFromDialog: Omit<PromptWithModel, 'createdAt' | 'updatedAt' | 'status' | 'model'> & { categoryId?: PromptCategory }) => { // Adjust param type
    if (!currentPrompt) return; // Should not happen if called correctly
    setIsLoading(true);
    try {
      // Construct payload ONLY with fields from the dialog data
      const payload = {
        name: dataFromDialog.name,
        description: dataFromDialog.description,
        template: dataFromDialog.template,
        variables: dataFromDialog.variables || [],
        // Category is NOT editable via this dialog in the simplified version
        modelId: dataFromDialog.modelId, // Pass modelId from dialog
      };

      // Filter out undefined values if necessary, though PUT should handle partial updates
       const definedPayload = Object.entries(payload).reduce((acc, [key, value]) => {
         if (value !== undefined) {
           acc[key as keyof typeof payload] = value;
         }
         return acc;
       }, {} as Partial<typeof payload>);


      const response = await axios.put(`/api/admin/prompts/${currentPrompt.id}`, definedPayload);
      // Update the specific prompt in the state
      setPrompts(prev => prev.map(p => p.id === currentPrompt.id ? { ...p, ...response.data } : p));
      setIsPromptDialogOpen(false);
      toast.success('Prompt updated successfully!');
    } catch (error: any) {
      console.error("Failed to update prompt:", error);
      const errorMessage = error.response?.data?.error || 'Failed to update prompt.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  // Simplified open dialog - just pass the prompt object
  const handleOpenDialog = (prompt: PromptWithModel | null = null) => {
    setCurrentPrompt(prompt); // Keep track of which prompt is being edited (or null if adding)
    // No need to pre-fill newPromptData here as the dialog manages its own state
    setIsPromptDialogOpen(true);
  };


  // --- Modify handleToggleArchive to open confirmation dialog ---
  const handleToggleArchive = async (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) {
      toast.error("Prompt not found.");
      return;
    }
    setPromptToToggleArchive(prompt); // Set the prompt to be toggled
    setIsArchiveConfirmOpen(true); // Open the confirmation dialog
  };

  // --- New function to perform archive/unarchive after confirmation ---
  const confirmToggleArchive = async () => {
    if (!promptToToggleArchive) return;

    const promptId = promptToToggleArchive.id;
    const currentStatus = promptToToggleArchive.status;
    const newStatus = currentStatus === PromptStatus.ARCHIVED ? PromptStatus.ACTIVE : PromptStatus.ARCHIVED;
    const actionVerb = newStatus === PromptStatus.ACTIVE ? 'unarchived' : 'archived';

    setIsLoading(true);
    try {
      // Call the specific archive/unarchive endpoint
      await axios.patch(`/api/admin/prompts/${promptId}/status`, { status: newStatus });

      // Update prompt status in local state
      setPrompts(prevPrompts =>
        prevPrompts.map(p =>
          p.id === promptId ? { ...p, status: newStatus } : p
        )
      );

      toast.success(`Prompt ${actionVerb} successfully!`);
    } catch (error: any) {
      console.error(`Failed to ${actionVerb} prompt:`, error);
      const errorMessage = error.response?.data?.error || `Failed to ${actionVerb} prompt.`;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setPromptToToggleArchive(null); // Reset the target prompt
      setIsArchiveConfirmOpen(false); // Close the dialog regardless of outcome
    }
  };


  const handleTestPrompt = (prompt: PromptWithModel) => {
      setCurrentPrompt(prompt);
      setIsTestDialogOpen(true);
  };


  // Helper to get status badge variant
  const getStatusVariant = (status: PromptStatus): "secondary" | "outline" | "destructive" => {
    switch (status) {
      case PromptStatus.ACTIVE:
        return "secondary"; // Or maybe "success" if you add custom variants
      case PromptStatus.DRAFT:
        return "outline";
      case PromptStatus.ARCHIVED:
        return "destructive"; // Using destructive to indicate non-active state
      default:
        return "secondary";
    }
  };


  // --- Render Logic ---
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prompt Management</h1>

      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-2">
           <Search className="h-5 w-5 text-muted-foreground" />
           <Input
             placeholder="Search prompts..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="max-w-sm"
           />
        </div>
         {/* Add the Show Archived toggle switch */}
         <div className="flex items-center space-x-2">
           <Switch
             id="show-archived"
             checked={showArchived}
             onCheckedChange={setShowArchived} // Directly set state on change
             aria-label="Show archived prompts"
           />
           <Label htmlFor="show-archived">Show Archived</Label>
         </div>
        <Button onClick={() => handleOpenDialog()}> <PlusCircle className="mr-2 h-4 w-4" /> Add New Prompt </Button>
      </div>

      <Tabs value={activeCategory || 'ALL'} onValueChange={(value) => setActiveCategory(value as PromptCategory | 'ALL')} className="w-full">
          <TabsList>
              <TabsTrigger value="ALL">All</TabsTrigger>
              {promptCategories.map(category => (
                  <TabsTrigger key={category} value={category}>
                      {category.replace(/_/g, ' ')} {/* Nicer display */}
                  </TabsTrigger>
              ))}
          </TabsList>

          {/* Combined content area */}
          <TabsContent value={activeCategory || 'ALL'} className="mt-4">
               {isLoading ? (
                 <div className="flex justify-center items-center h-64">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
               ) : filteredPrompts.length === 0 ? (
                 <p className="text-center text-muted-foreground mt-8">
                   No prompts found matching your criteria.
                 </p>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {filteredPrompts.map((prompt) => (
                     <Card key={prompt.id}>
                       <CardHeader>
                         <CardTitle className="flex justify-between items-start">
                           <span className="truncate flex-1 mr-2">{prompt.name}</span>
                           <Badge variant={getStatusVariant(prompt.status)} className="capitalize text-xs">
                             {prompt.status.toLowerCase()}
                           </Badge>
                         </CardTitle>
                         <CardDescription>
                           Category: {prompt.category.replace(/_/g, ' ')} <br />
                           {prompt.model?.provider?.name && prompt.model?.modelName ? (
                             <span>AI: {getProviderAndModelNames(prompt).providerName} / {getProviderAndModelNames(prompt).modelName}</span>
                           ) : (
                             <span>AI: Not Set</span>
                           )}
                         </CardDescription>
                       </CardHeader>
                       <CardContent>
                         <p className="text-sm text-muted-foreground line-clamp-3" title={prompt.description || ''}>
                           {prompt.description || <i>No description provided.</i>}
                         </p>
                         {/* Optionally display variables */}
                         {prompt.variables && prompt.variables.length > 0 && (
                             <div className="mt-2">
                                 <p className="text-xs font-semibold">Variables:</p>
                                 <div className="flex flex-wrap gap-1 mt-1">
                                     {prompt.variables.map(v => <Badge key={v} variant="outline" className="text-xs">{`{{${v}}}`}</Badge>)}
                                 </div>
                             </div>
                         )}
                       </CardContent>
                       <CardFooter className="flex justify-end gap-2">
                         <Button variant="outline" size="icon" onClick={() => handleTestPrompt(prompt)} title="Test Prompt">
                            <Play className="h-4 w-4" />
                         </Button>
                         <Button variant="outline" size="icon" onClick={() => handleOpenDialog(prompt)} title="Edit Prompt">
                           <Edit className="h-4 w-4" />
                         </Button>
                          {/* Replace Delete Button with Archive/Unarchive Button */}
                          <Button
                            variant={prompt.status === PromptStatus.ARCHIVED ? "secondary" : "outline"} // Style differently if archived
                            size="icon"
                            onClick={() => handleToggleArchive(prompt.id)} // Pass only ID
                            title={prompt.status === PromptStatus.ARCHIVED ? "Unarchive Prompt" : "Archive Prompt"}
                          >
                            {prompt.status === PromptStatus.ARCHIVED ? (
                              <ArchiveRestore className="h-4 w-4" /> // Icon for Unarchive
                            ) : (
                              <Archive className="h-4 w-4" /> // Icon for Archive
                            )}
                          </Button>
                       </CardFooter>
                     </Card>
                   ))}
                 </div>
               )}
             </TabsContent>
          {/* Remove separate TabsContent for each category if using 'ALL' approach */}
      </Tabs>


      {/* Prompt Dialog (Add/Edit) - Now passing props expected by the viewed prompt-dialog.tsx */}
      {isPromptDialogOpen && (
          <PromptDialog
              open={isPromptDialogOpen} // Pass open state
              onOpenChange={setIsPromptDialogOpen} // Pass function to close dialog
              prompt={currentPrompt} // Pass the full prompt object being edited, or null for new
              onSave={currentPrompt ? handleEditPrompt : handleAddPrompt} // Pass correct save handler
              categoryId={activeCategory === 'ALL' ? PromptCategory.GENERAL : activeCategory} // Pass the current category
              aiProviders={aiProviders} // Pass fetched aiProviders
          />
      )}


       {/* Prompt Test Dialog */}
      {isTestDialogOpen && currentPrompt && (
          <PromptTestDialog
              isOpen={isTestDialogOpen}
              onClose={() => setIsTestDialogOpen(false)}
              prompt={currentPrompt}
          />
      )}


      {/* Archive/Unarchive Confirmation Dialog */}
      <AlertDialog open={isArchiveConfirmOpen} onOpenChange={setIsArchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {promptToToggleArchive?.status === PromptStatus.ARCHIVED
                ? "Unarchive Prompt?"
                : "Archive Prompt?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {promptToToggleArchive?.status === PromptStatus.ARCHIVED
                ? `Are you sure you want to make the prompt "${promptToToggleArchive?.name}" active again?`
                : `Are you sure you want to archive the prompt "${promptToToggleArchive?.name}"? It will be hidden from the default view.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPromptToToggleArchive(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleArchive}>
              {promptToToggleArchive?.status === PromptStatus.ARCHIVED ? "Unarchive" : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
 
 
    </div>
  );
}
