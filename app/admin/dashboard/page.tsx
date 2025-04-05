'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, FileText, History, ArrowRight } from "lucide-react"

// Mock data - in a real app, this would come from a database
const recentActivity = [
  {
    type: "user",
    action: "created",
    name: "John Doe",
    role: "USER",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    type: "plan",
    action: "updated",
    planName: "E-commerce Website",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    type: "user",
    action: "updated",
    name: "Jane Smith",
    role: "USER",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your Resort Fresh administration
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">856</div>
            <p className="text-xs text-muted-foreground">
              +15.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Usage</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              +3.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">🟢</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between space-y-2"
                >
                  <div className="flex items-center">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.type === "user"
                            ? `${activity.name} ${activity.action} ${activity.role.toLowerCase()}`
                            : `${activity.planName} ${activity.action} plan`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/admin/users">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/ai-providers">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  AI Providers
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/prompts">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Prompt Templates
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/settings">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  System Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
