import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Globe } from "lucide-react"

export function ContactMap() {
  return (
    <Card className="border-primary/20 bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Our Location</CardTitle>
        <CardDescription>Visit our headquarters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video w-full rounded-lg overflow-hidden border border-primary/20 bg-secondary/30">
          {/* In a real application, you would embed a Google Map or similar here */}
          <div className="w-full h-full flex items-center justify-center bg-secondary/50 relative">
            <div className="absolute inset-0 circuit-bg opacity-30"></div>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Globe className="h-12 w-12 text-primary/50 mb-2" />
              <span className="text-sm text-muted-foreground">Interactive map would be displayed here</span>
            </div>
          </div>
        </div>
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-medium">WebPlanner Headquarters</h3>
            <address className="not-italic text-sm text-muted-foreground">
              123 Innovation Drive
              <br />
              Suite 400
              <br />
              San Francisco, CA 94103
              <br />
              United States
            </address>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
