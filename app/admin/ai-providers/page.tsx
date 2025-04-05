import { AIProviderManagement } from "@/components/admin/ai-provider-management"

export default function AIProvidersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Provider Management</h2>
        <p className="text-muted-foreground">Configure AI providers, API keys, and model settings.</p>
      </div>

      <AIProviderManagement />
    </div>
  )
}

