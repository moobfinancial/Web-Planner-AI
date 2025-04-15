import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MessageSquare, Clock } from "lucide-react"

export function ContactOptions() {
  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "Email Us",
      description: "For general inquiries and support",
      contact: "support@webplanner.com",
      link: "mailto:support@webplanner.com",
    },
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "Call Us",
      description: "Mon-Fri, 9am-5pm EST",
      contact: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Live Chat",
      description: "Available 24/7 for quick questions",
      contact: "Start a chat",
      link: "#chat", // In a real app, this would trigger a chat widget
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Response Time",
      description: "We aim to respond within",
      contact: "24 hours",
      link: null, // Not a clickable link
    },
  ]

  return (
    <Card className="border-primary/20 bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Contact Options</CardTitle>
        <CardDescription>Choose the best way to reach our team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contactMethods.map((method, index) => (
            <div key={index} className="flex flex-col p-4 rounded-lg border border-primary/20 bg-secondary/30">
              <div className="flex items-center mb-3">
                {method.icon}
                <h3 className="ml-2 font-medium">{method.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
              {method.link ? (
                <a
                  href={method.link}
                  className="text-primary hover:text-primary/80 font-medium transition-colors mt-auto"
                >
                  {method.contact}
                </a>
              ) : (
                <span className="text-primary font-medium mt-auto">{method.contact}</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
