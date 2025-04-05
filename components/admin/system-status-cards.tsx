import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"

// Mock data for system status
const systemStatus = [
  {
    id: 1,
    name: "API Services",
    status: "operational",
    uptime: "99.98%",
  },
  {
    id: 2,
    name: "Database",
    status: "operational",
    uptime: "99.99%",
  },
  {
    id: 3,
    name: "OpenAI Integration",
    status: "operational",
    uptime: "99.95%",
  },
  {
    id: 4,
    name: "Anthropic Integration",
    status: "degraded",
    uptime: "98.72%",
  },
]

export function SystemStatusCards() {
  return (
    <div className="space-y-4">
      {systemStatus.map((service) => (
        <div key={service.id} className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            {service.status === "operational" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : service.status === "degraded" ? (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">{service.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                service.status === "operational" ? "default" : service.status === "degraded" ? "outline" : "destructive"
              }
              className={service.status === "operational" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}
            >
              {service.status === "operational" ? "Operational" : service.status === "degraded" ? "Degraded" : "Down"}
            </Badge>
            <span className="text-xs text-muted-foreground">{service.uptime}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

