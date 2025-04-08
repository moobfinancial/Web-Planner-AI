"use client"

import { Check, X } from "lucide-react"

export function FeatureComparison() {
  const features = [
    {
      name: "AI-Generated Plans",
      free: "Basic (1/month)",
      pro: "Advanced (Unlimited)",
      enterprise: "Premium (Unlimited)"
    },
    {
      name: "PDF Export",
      free: true,
      pro: true,
      enterprise: true
    },
    {
      name: "Revision Rounds",
      free: "3 per plan",
      pro: "Unlimited",
      enterprise: "Unlimited"
    },
    {
      name: "Team Members",
      free: "1",
      pro: "Up to 3",
      enterprise: "Unlimited"
    },
    {
      name: "Custom Branding",
      free: false,
      pro: true,
      enterprise: true
    },
    {
      name: "Priority Support",
      free: false,
      pro: "24-48 hours",
      enterprise: "4-8 hours"
    },
    {
      name: "API Access",
      free: false,
      pro: false,
      enterprise: true
    },
    {
      name: "Custom Integrations",
      free: false,
      pro: false,
      enterprise: true
    },
    {
      name: "Dedicated Account Manager",
      free: false,
      pro: false,
      enterprise: true
    },
    {
      name: "Advanced Analytics",
      free: false,
      pro: true,
      enterprise: true
    },
    {
      name: "Concurrent Projects",
      free: "1",
      pro: "5",
      enterprise: "Unlimited"
    },
    {
      name: "Version History",
      free: "7 days",
      pro: "30 days",
      enterprise: "Unlimited"
    }
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features Comparison</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Compare our plans to find the perfect fit for your project needs
            </p>
          </div>
          
          <div className="w-full overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-6 font-medium">Features</th>
                  <th className="py-4 px-6 text-center font-medium">Free</th>
                  <th className="py-4 px-6 text-center font-medium">Pro</th>
                  <th className="py-4 px-6 text-center font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr 
                    key={index} 
                    className={index % 2 === 0 ? "bg-muted/50" : ""}
                  >
                    <td className="py-4 px-6 font-medium">{feature.name}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.free === "boolean" ? (
                        feature.free ? (
                          <Check className="mx-auto h-5 w-5 text-green-500" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-red-500" />
                        )
                      ) : (
                        feature.free
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.pro === "boolean" ? (
                        feature.pro ? (
                          <Check className="mx-auto h-5 w-5 text-green-500" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-red-500" />
                        )
                      ) : (
                        feature.pro
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.enterprise === "boolean" ? (
                        feature.enterprise ? (
                          <Check className="mx-auto h-5 w-5 text-green-500" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-red-500" />
                        )
                      ) : (
                        feature.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
