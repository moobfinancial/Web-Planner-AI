import { PromptManagement } from "@/components/admin/prompt-management"

export default function PromptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Prompt Template Management</h2>
        <p className="text-muted-foreground">Create and manage prompt templates used for plan generation.</p>
      </div>

      <PromptManagement />
    </div>
  )
}

