import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for recent activity
const recentActivity = [
  {
    id: 1,
    user: {
      name: "Admin",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AD",
    },
    action: "Updated AI provider configuration",
    timestamp: "10 minutes ago",
  },
  {
    id: 2,
    user: {
      name: "Admin",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AD",
    },
    action: "Created new prompt template",
    timestamp: "2 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Admin",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AD",
    },
    action: "Modified user permissions",
    timestamp: "Yesterday",
  },
  {
    id: 4,
    user: {
      name: "Admin",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AD",
    },
    action: "Added new AI model",
    timestamp: "2 days ago",
  },
]

export function RecentActivityList() {
  return (
    <div className="space-y-4">
      {recentActivity.map((activity) => (
        <div key={activity.id} className="flex items-center gap-4">
          <Avatar className="h-8 w-8 border border-primary/30">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback className="bg-primary/10 text-primary">{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.action}</p>
            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

