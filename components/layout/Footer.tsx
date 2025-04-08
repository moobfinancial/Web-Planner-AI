import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-primary/20 py-6 md:py-0 bg-secondary/30 mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-foreground/70 md:text-left">
          {new Date().getFullYear()} WebPlanner AI. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 md:gap-6 text-sm">
            <Link href="/about" className="text-foreground/70 hover:text-primary transition-colors">About</Link>
            <Link href="/pricing" className="text-foreground/70 hover:text-primary transition-colors">Pricing</Link>
            <Link href="/contact" className="text-foreground/70 hover:text-primary transition-colors">Contact</Link>
            <Link href="/terms" className="text-foreground/70 hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="text-foreground/70 hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
