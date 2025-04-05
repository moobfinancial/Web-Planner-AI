import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
      {/* Animated circuit background */}
      <div className="absolute inset-0 circuit-bg"></div>

      {/* Glowing accent */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                <span className="glow-text">AI-Powered</span> Website Planning Made Simple
              </h1>
              <p className="max-w-[600px] text-foreground/80 md:text-xl">
                Transform your website ideas into comprehensive plans with AI assistance. Generate detailed website
                specifications, refine them iteratively, and create actionable development prompts.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full">
                  Get Started
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full h-[400px] overflow-hidden rounded-lg border border-primary/30 bg-secondary/20 backdrop-blur-sm p-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] dark:shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              <div className="absolute inset-0 circuit-bg"></div>
              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
                <div className="rounded-lg border border-primary/30 bg-secondary/40 p-4 shadow-sm backdrop-blur-sm">
                  <h3 className="text-lg font-semibold">Website Plan Generator</h3>
                  <p className="text-sm text-foreground/70">
                    Describe your website idea and let AI create a detailed plan
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-md">
                  <div className="rounded-lg border border-primary/20 bg-secondary/30 p-4 shadow-sm backdrop-blur-sm">
                    <div className="h-2 w-24 rounded-full bg-primary/30 animate-pulse"></div>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-secondary/30 p-4 shadow-sm backdrop-blur-sm">
                    <div className="h-2 w-32 rounded-full bg-primary/30 animate-pulse"></div>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-secondary/30 p-4 shadow-sm backdrop-blur-sm">
                    <div className="h-2 w-40 rounded-full bg-primary/30 animate-pulse"></div>
                  </div>
                </div>
                <div className="rounded-lg border border-primary/30 bg-secondary/40 p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-sm font-medium">Plan Generated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

