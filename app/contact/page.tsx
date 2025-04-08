import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ContactForm } from "@/components/contact/contact-form"
import { ContactOptions } from "@/components/contact/contact-options"
import { ContactFAQ } from "@/components/contact/contact-faq"
import { ContactMap } from "@/components/contact/contact-map"

export const metadata: Metadata = {
  title: "Contact Us | WebPlanner",
  description: "Get in touch with our team for support, sales inquiries, or partnership opportunities",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                <polyline points="7.5 19.79 7.5 14.6 3 12" />
                <polyline points="21 12 16.5 14.6 16.5 19.79" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span className="text-xl font-bold">WebPlanner</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#features"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link href="/contact" className="text-sm font-medium text-primary transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 circuit-bg"></div>
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Get in <span className="glow-text">Touch</span>
                </h1>
                <p className="max-w-[600px] mx-auto text-foreground/80 md:text-xl">
                  Have questions about WebPlanner? Our team is here to help you with anything you need.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactForm />
            <div className="space-y-12">
              <ContactOptions />
              <ContactMap />
            </div>
          </div>
        </div>

        <ContactFAQ />
      </main>

      <footer className="border-t border-primary/20 py-6 md:py-0 bg-secondary/30">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-foreground/70 md:text-left">
            2025 WebPlanner. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-foreground/70 hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-foreground/70 hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/admin/sign-in" className="text-sm text-foreground/70 hover:text-primary transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
