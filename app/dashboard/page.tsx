import Link from "next/link"
import { unstable_noStore as noStore } from 'next/cache'; // Import noStore for granular control if needed, but dynamic export is preferred for the whole page
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, FileText, History, ArrowRight } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"
import { redirect } from "next/navigation"
import { Project, ProjectStatus } from "@prisma/client"

// Removed force-dynamic export; using revalidatePath in the API route instead
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

async function getDashboardData() {
  // noStore(); // Keep commented out unless specific need arises
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }
  
  const userId = session.user.id
  
  // Get all projects for the user
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      plans: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Get the latest plan for each project
      },
    },
  })
  
  // Calculate statistics
  const totalPlans = projects.length
  
  // Consider a project "active" if it was updated in the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const activePlans = projects.filter(p => p.updatedAt > thirtyDaysAgo).length
  
  // Use the status field to count completed plans
  const completedPlans = projects.filter(p => p.status === ProjectStatus.COMPLETED).length
  
  // Get recent plans (top 3)
  const recentPlans = projects.slice(0, 3).map(project => ({
    id: project.id,
    name: project.projectName, // Map projectName to name for UI consistency
    updatedAt: project.updatedAt,
  }))
  
  // Get recent activity directly from the Activity table
  const recentActivities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5, // Fetch the last 5 activities
    include: {
      project: { // Include project details if available
        select: { projectName: true }
      }
    }
  });

  console.log("[Dashboard Data] Fetched recent activities:", recentActivities); // Add logging here

  // Get month-over-month change for stats - Optimized
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  
  // Fetch projects relevant to the last month's stats in one query
  const projectsLastMonthStats = await prisma.project.findMany({
    where: {
      userId,
      OR: [
        { createdAt: { gte: lastMonth } },
        { updatedAt: { gte: lastMonth } },
      ],
    },
    select: {
      createdAt: true,
      updatedAt: true,
      status: true,
    },
  });

  // Calculate stats in memory
  let projectsCreatedLastMonth = 0;
  let projectsActiveLastMonth = 0;
  let projectsCompletedLastMonth = 0;

  for (const project of projectsLastMonthStats) {
    if (project.createdAt >= lastMonth) {
      projectsCreatedLastMonth++;
    }
    if (project.updatedAt >= lastMonth) {
      projectsActiveLastMonth++;
      if (project.status === ProjectStatus.COMPLETED) {
        projectsCompletedLastMonth++;
      }
    }
  }

  
  return {
    totalPlans,
    activePlans,
    completedPlans,
    recentPlans,
    // Pass the actual activities to the component
    recentActivity: recentActivities, // Use the fetched activities
    monthlyChanges: {                    
      total: projectsCreatedLastMonth,       
      active: projectsActiveLastMonth,      
      completed: projectsCompletedLastMonth,
    }                                   
  }
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData()
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your website planning projects.</p>
        </div>
        <Link href="/dashboard/plans/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Plan
          </Button>
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalPlans}</div>
            <p className="text-xs text-muted-foreground">+{dashboardData.monthlyChanges.total} from last month</p> 
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activePlans}</div>
            <p className="text-xs text-muted-foreground">+{dashboardData.monthlyChanges.active} from last month</p> 
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Plans</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.completedPlans}</div>
            <p className="text-xs text-muted-foreground">+{dashboardData.monthlyChanges.completed} from last month</p> 
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Plans</CardTitle>
              <CardDescription>Your most recently updated website plans.</CardDescription>
            </div>
            <Link href="/dashboard/plans">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentPlans.length > 0 ? (
                dashboardData.recentPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">Updated {formatDate(plan.updatedAt)}</p>
                    </div>
                    <Link href={`/dashboard/plans/${plan.id}`}>
                      <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No plans created yet. Create your first plan!</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent actions and updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id}>
                    {/* Conditional rendering based on activity type */}
                    {activity.type === 'PROJECT_CREATED' && (
                      <p className="text-sm text-muted-foreground">
                        You created project "<span className="font-medium">{activity.project?.projectName || activity.projectId}</span>" {formatDate(activity.createdAt)}.
                      </p>
                    )}
                    {activity.type === 'PLAN_VERSION_CREATED' && (
                      <p className="text-sm text-muted-foreground">
                        A new plan version was created for project "<span className="font-medium">{activity.project?.projectName || activity.projectId}</span>" {formatDate(activity.createdAt)}.
                      </p>
                    )}
                    {activity.type === 'PROJECT_STATUS_CHANGED' && (
                      <p className="text-sm text-muted-foreground">
                        {/* Check if metadata is an object before accessing properties */}
                        You changed the status of project "<span className="font-medium">{activity.project?.projectName || activity.projectId}</span>" to {(activity.metadata && typeof activity.metadata === 'object' && 'newStatus' in activity.metadata) ? (activity.metadata as any).newStatus : 'updated'} {formatDate(activity.createdAt)}.
                      </p>
                    )}
                     {activity.type === 'PROJECT_DELETED' && (
                      <p className="text-sm text-muted-foreground">
                        {/* Check if metadata is an object before accessing properties */}
                        You deleted project "<span className="font-medium">{(activity.metadata && typeof activity.metadata === 'object' && 'projectName' in activity.metadata) ? (activity.metadata as any).projectName : (activity.projectId ?? 'Unknown')}</span>" {formatDate(activity.createdAt)}.
                      </p>
                    )}
                    {/* Add more conditions for other activity types as needed */}
                    {/* Fallback for unknown or older types */}
                    {!['PROJECT_CREATED', 'PLAN_VERSION_CREATED', 'PROJECT_STATUS_CHANGED', 'PROJECT_DELETED'].includes(activity.type) && (
                      <p className="text-sm text-muted-foreground">
                         Activity: {activity.type} for project "{activity.project?.projectName || activity.projectId}" on {formatDate(activity.createdAt)}.
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return "today"
  } else if (diffInDays === 1) {
    return "yesterday"
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
}
