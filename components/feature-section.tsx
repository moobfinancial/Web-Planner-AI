import type React from "react"
import {
  BrainCircuit,
  GitFork,
  History,
  IterationCcw,
  LayoutPanelLeft,
  MessageSquareText,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react"

export function FeatureSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Circuit background */}
      <div className="absolute inset-0 circuit-bg"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-secondary/50 border border-primary/30 px-3 py-1 text-sm glow-text">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Everything You Need to Plan Your Website
            </h2>
            <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our AI-powered platform streamlines the website planning process, making it accessible to users of all
              technical backgrounds.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature cards */}
          <FeatureCard
            icon={<BrainCircuit className="h-12 w-12 text-primary animate-pulse-glow" />}
            title="AI-Powered Plan Generation"
            description="Transform simple text descriptions into comprehensive website plans with our advanced AI engine."
          />
          <FeatureCard
            icon={<IterationCcw className="h-12 w-12 text-primary animate-pulse-glow" />}
            title="Iterative Refinement"
            description="Provide feedback and watch as the AI intelligently incorporates your suggestions into refined plans."
          />
          <FeatureCard
            icon={<History className="h-12 w-12 text-primary animate-pulse-glow" />}
            title="Version Control"
            description="Track changes and revert to previous iterations with our comprehensive version history."
          />
          <FeatureCard
            icon={<MessageSquareText className="h-12 w-12 text-primary animate-pulse-glow" />}
            title="Prompt Generation"
            description="Automatically generate actionable prompts for AI code generation tools based on your finalized plan."
          />
          <FeatureCard
            icon={<Target className="h-12 w-12 text-primary animate-pulse-glow" />}
            title="SMART Goals"
            description="Define specific, measurable, achievable, relevant, and time-bound goals for your website project."
          />
          <FeatureCard
            icon={<Users className="h-12 w-12 text-primary animate-pulse-glow" />}
            title="Audience Profiling"
            description="Create detailed profiles of your target audience to ensure your website meets their needs."
          />
          <FeatureCard
            icon={<LayoutPanelLeft className="h-12 w-12 text-primary animate-pulse-glow" />}
            title="Architecture Planning"
            description="Develop a high-level overview of your website's structure, including pages, sections, and navigation."
          />
          <FeatureCard
            icon={<GitFork className="h-12 w-12 text-primary animate-pulse-glow" />}
            title="Diagram Generation"
            description="Visualize your website's architecture and user flows with automatically generated interactive diagrams."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-12 w-12 text-primary animate-pulse-glow" />}
            title="Security & Scaling"
            description="Identify basic security requirements and scaling considerations for your website project."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="futuristic-card group p-6 transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] dark:hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]">
      <div className="relative z-10 flex flex-col items-center space-y-2">
        {icon}
        <h3 className="text-xl font-bold group-hover:glow-text transition-all duration-300">{title}</h3>
        <p className="text-center text-foreground/70">{description}</p>
      </div>
    </div>
  )
}

