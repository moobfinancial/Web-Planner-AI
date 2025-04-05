import { VersionHistory } from "@/components/customer/version-history"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Version History</h2>
        <p className="text-muted-foreground">Track changes to your plans and account settings.</p>
      </div>

      <VersionHistory />
    </div>
  )
}

