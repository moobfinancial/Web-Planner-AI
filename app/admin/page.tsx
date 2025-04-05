import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminMetricsCards } from "@/components/admin/admin-metrics-cards"
import { RecentActivityList } from "@/components/admin/recent-activity-list"
import { SystemStatusCards } from "@/components/admin/system-status-cards"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage users, AI providers, and system settings.</p>
      </div>

      <AdminMetricsCards />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions performed in the admin portal</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current status of system components</CardDescription>
          </CardHeader>
          <CardContent>
            <SystemStatusCards />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

