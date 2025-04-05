"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, PlusCircle, Edit, Copy, Archive, Play } from "lucide-react"
import { PromptDialog } from "@/components/admin/prompt-dialog"
import { PromptTestDialog } from "@/components/admin/prompt-test-dialog"

// Mock data for prompt templates
const mockPromptCategories = [
  {
    id: "plan-generation",
    name: "Plan Generation",
    description: "Prompts used for generating website plans",
    prompts: [
      {
        id: "executive-summary",
        name: "Executive Summary",
        description: "Generates the executive summary section of a website plan",
        template:
          "Generate a comprehensive executive summary for a {{type}} website focused on {{industry}}. The website's primary purpose is {{purpose}} and the target audience is {{audience}}.",
        variables: ["type", "industry", "purpose", "audience"],
        status: "active",
        lastUpdated: "2 days ago",
      },
      {
        id: "smart-goals",
        name: "SMART Goals",
        description: "Generates SMART goals for a website plan",
        template:
          "Generate 5 SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals for a {{type}} website in the {{industry}} industry. The website's primary purpose is {{purpose}}.",
        variables: ["type", "industry", "purpose"],
        status: "active",
        lastUpdated: "1 week ago",
      },
      {
        id: "features-list",
        name: "Features List",
        description: "Generates a list of features for a website plan",
        template:
          "Generate a comprehensive list of features for a {{type}} website in the {{industry}} industry. The website's primary purpose is {{purpose}} and the target audience is {{audience}}. Organize the features into logical modules.",
        variables: ["type", "industry", "purpose", "audience"],
        status: "archived",
        lastUpdated: "1 month ago",
      },
    ],
  },
  {
    id: "plan-refinement",
    name: "Plan Refinement",
    description: "Prompts used for refining existing website plans",
    prompts: [
      {
        id: "section-refinement",
        name: "Section Refinement",
        description: "Refines a specific section of a website plan based on feedback",
        template:
          "Refine the {{section}} section of the website plan based on the following feedback: {{feedback}}. The current content is: {{current_content}}.",
        variables: ["section", "feedback", "current_content"],
        status: "active",
        lastUpdated: "3 days ago",
      },
      {
        id: "add-section",
        name: "Add New Section",
        description: "Adds a new section to an existing website plan",
        template:
          "Create a new {{section_name}} section for a website plan. The website is a {{type}} website in the {{industry}} industry. The section should include {{requirements}}.",
        variables: ["section_name", "type", "industry", "requirements"],
        status: "active",
        lastUpdated: "5 days ago",
      },
    ],
  },
  {
    id: "development-prompts",
    name: "Development Prompts",
    description: "Prompts used for generating development instructions",
    prompts: [
      {
        id: "frontend-component",
        name: "Frontend Component",
        description: "Generates instructions for creating a frontend component",
        template:
          "Create a {{component_type}} component for a {{framework}} application. The component should {{functionality}} and have the following design requirements: {{design_requirements}}.",
        variables: ["component_type", "framework", "functionality", "design_requirements"],
        status: "active",
        lastUpdated: "1 week ago",
      },
      {
        id: "api-endpoint",
        name: "API Endpoint",
        description: "Generates instructions for creating an API endpoint",
        template:
          "Create an API endpoint for {{purpose}} in a {{framework}} application. The endpoint should accept {{request_params}} and return {{response_format}}. Include error handling for {{error_cases}}.",
        variables: ["purpose", "framework", "request_params", "response_format", "error_cases"],
        status: "active",
        lastUpdated: "2 weeks ago",
      },
    ],
  },
]

export function PromptManagement() {
  const [promptCategories, setPromptCategories] = useState(mockPromptCategories)
  const [activeCategory, setActiveCategory] = useState(promptCategories[0].id)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState<any>(null)

  const selectedCategory = promptCategories.find((c) => c.id === activeCategory)

  const filteredPrompts =
    selectedCategory?.prompts.filter(
      (prompt) =>
        prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []

  const handleAddPrompt = () => {
    setCurrentPrompt(null)
    setIsPromptDialogOpen(true)
  }

  const handleEditPrompt = (prompt: any) => {
    setCurrentPrompt(prompt)
    setIsPromptDialogOpen(true)
  }

  const handleTestPrompt = (prompt: any) => {
    setCurrentPrompt(prompt)
    setIsTestDialogOpen(true)
  }

  const handleSavePrompt = (promptData: any) => {
    if (!selectedCategory) return

    if (currentPrompt) {
      // Update existing prompt
      setPromptCategories((categories) =>
        categories.map((category) =>
          category.id === selectedCategory.id
            ? {
                ...category,
                prompts: category.prompts.map((prompt) =>
                  prompt.id === currentPrompt.id ? { ...prompt, ...promptData, lastUpdated: "Just now" } : prompt,
                ),
              }
            : category,
        ),
      )
    } else {
      // Create new prompt
      const newPrompt = {
        id: promptData.id || `prompt-${Date.now()}`,
        ...promptData,
        status: "active",
        lastUpdated: "Just now",
      }

      setPromptCategories((categories) =>
        categories.map((category) =>
          category.id === selectedCategory.id ? { ...category, prompts: [...category.prompts, newPrompt] } : category,
        ),
      )
    }
    setIsPromptDialogOpen(false)
  }

  const handleDuplicatePrompt = (prompt: any) => {
    if (!selectedCategory) return

    const duplicatedPrompt = {
      ...prompt,
      id: `${prompt.id}-copy-${Date.now()}`,
      name: `${prompt.name} (Copy)`,
      lastUpdated: "Just now",
    }

    setPromptCategories((categories) =>
      categories.map((category) =>
        category.id === selectedCategory.id
          ? { ...category, prompts: [...category.prompts, duplicatedPrompt] }
          : category,
      ),
    )
  }

  const handleArchivePrompt = (promptId: string) => {
    if (!selectedCategory) return

    setPromptCategories((categories) =>
      categories.map((category) =>
        category.id === selectedCategory.id
          ? {
              ...category,
              prompts: category.prompts.map((prompt) =>
                prompt.id === promptId
                  ? { ...prompt, status: prompt.status === "active" ? "archived" : "active", lastUpdated: "Just now" }
                  : prompt,
              ),
            }
          : category,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <div className="flex items-center justify-between">
          <TabsList>
            {promptCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {promptCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                  <Button onClick={handleAddPrompt}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Prompt
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search prompts..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {filteredPrompts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No prompts found. Add a new prompt to get started.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredPrompts.map((prompt) => (
                      <Card key={prompt.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{prompt.name}</CardTitle>
                            <Badge
                              variant={prompt.status === "active" ? "default" : "outline"}
                              className={
                                prompt.status === "active"
                                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                  : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                              }
                            >
                              {prompt.status === "active" ? "Active" : "Archived"}
                            </Badge>
                          </div>
                          <CardDescription>{prompt.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="bg-muted/50 p-2 rounded-md text-sm font-mono overflow-x-auto max-h-24">
                            {prompt.template}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {prompt.variables.map((variable: string) => (
                              <Badge key={variable} variant="outline" className="bg-primary/10 border-primary/20">
                                {`{{${variable}}}`}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <div className="text-xs text-muted-foreground">Updated {prompt.lastUpdated}</div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleTestPrompt(prompt)}
                              title="Test Prompt"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPrompt(prompt)}
                              title="Edit Prompt"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDuplicatePrompt(prompt)}
                              title="Duplicate Prompt"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleArchivePrompt(prompt.id)}
                              title={prompt.status === "active" ? "Archive Prompt" : "Restore Prompt"}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <PromptDialog
        open={isPromptDialogOpen}
        onOpenChange={setIsPromptDialogOpen}
        prompt={currentPrompt}
        onSave={handleSavePrompt}
        categoryId={activeCategory}
      />

      <PromptTestDialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen} prompt={currentPrompt} />
    </div>
  )
}

