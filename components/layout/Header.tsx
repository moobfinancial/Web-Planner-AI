import Link from "next/link"
import { getServerSession } from "next-auth/next"; // Import getServerSession
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { authOptions } from "@/lib/auth"; // Import authOptions
import { UserNav } from "../user-nav"; // Corrected import path and filename casing

export async function Header() {
  const session = await getServerSession(authOptions); // Use getServerSession with authOptions

  return (
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
            href="/#features" // Link to homepage section
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works" // Link to homepage section
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/subscription"
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Pricing
          </Link>
           {/* Add Dashboard link if logged in */}
           {session?.user && (
             <Link
               href="/dashboard"
               className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
             >
               Dashboard
             </Link>
           )}
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
