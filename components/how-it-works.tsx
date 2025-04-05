import type React from "react"
import { Lightbulb, Cpu, MessageSquare, RefreshCw, Check, Code } from "lucide-react"

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Circuit background */}
      <div className="absolute inset-0 circuit-bg"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-secondary/50 border border-primary/30 px-3 py-1 text-sm glow-text">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple Process, Powerful Results</h2>
            <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our streamlined workflow makes website planning accessible to everyone, regardless of technical expertise.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2">
          <StepCard
            icon={<Lightbulb className="h-8 w-8 text-primary" />}
            step="1"
            title="Describe Your Idea"
            description="Start by providing a simple text description of your website idea, including its purpose, target audience, and key features."
          />
          <StepCard
            icon={<Cpu className="h-8 w-8 text-primary" />}
            step="2"
            title="AI Generates Plan"
            description="Our AI engine analyzes your description and automatically generates a comprehensive website plan with all necessary components."
          />
          <StepCard
            icon={<MessageSquare className="h-8 w-8 text-primary" />}
            step="3"
            title="Provide Feedback"
            description="Review the AI-generated plan and provide feedback, suggesting changes, additions, or alternative approaches."
          />
          <StepCard
            icon={<RefreshCw className="h-8 w-8 text-primary" />}
            step="4"
            title="Refine Iteratively"
            description="The AI incorporates your feedback to generate refined versions of the plan, building upon previous iterations."
          />
          <StepCard
            icon={<Check className="h-8 w-8 text-primary" />}
            step="5"
            title="Finalize Plan"
            description="Continue the iterative process until you're satisfied with the plan, which now perfectly aligns with your vision."
          />
          <StepCard
            icon={<Code className="h-8 w-8 text-primary" />}
            step="6"
            title="Generate Prompts"
            description="Once finalized, the application automatically generates actionable prompts for AI code generation tools to implement your plan."
          />
        </div>
      </div>
    </section>
  )
}

function StepCard({
  icon,
  step,
  title,
  description,
}: { icon: React.ReactNode; step: string; title: string; description: string }) {
  return (
    <div className="futuristic-card group p-6 transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] dark:hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]">
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50 border border-primary/30 shadow-[0_0_10px_rgba(6,182,212,0.2)] dark:shadow-[0_0_10px_rgba(56,189,248,0.2)]">
          {icon}
        </div>
        <h3 className="text-xl font-bold group-hover:glow-text transition-all duration-300">{title}</h3>
        <p className="text-center text-foreground/70">{description}</p>
      </div>
      <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-secondary border border-primary/30 flex items-center justify-center text-xs font-bold text-primary z-10">
        {step}
      </div>
    </div>
  )
}

