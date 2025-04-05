import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Monitor usage metrics and performance analytics.</p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}

