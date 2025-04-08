import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/components/hero-section"
import { FeatureSection } from "@/components/feature-section"
import { HowItWorks } from "@/components/how-it-works"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeatureSection />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
