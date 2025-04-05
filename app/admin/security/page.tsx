import { SecurityManagement } from "@/components/admin/security-management"

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
        <p className="text-muted-foreground">Configure security settings and access controls.</p>
      </div>

      <SecurityManagement />
    </div>
  )
}

