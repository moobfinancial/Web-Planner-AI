"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdminUserNav } from "@/components/admin/admin-user-nav"
import { Shield } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-primary/20 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">WebPlanner Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" target="_blank">
            <Button variant="outline" size="sm">
              View Site
            </Button>
          </Link>
          <ThemeToggle />
          <AdminUserNav />
        </div>
      </div>
    </header>
  )
}

