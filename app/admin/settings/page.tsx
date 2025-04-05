import { SettingsManagement } from "@/components/admin/settings-management"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Configure application settings and preferences.</p>
      </div>

      <SettingsManagement />
    </div>
  )
}

