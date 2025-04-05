'use client'

import Link from "next/link"
import { LayoutDashboard, FileText, History, Settings, PlusCircle, User, LogOut } from "lucide-react"
import { cn, buttonVariants } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export function DashboardNav() {
  return (
    <nav className="grid gap-2 pl-6">
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "flex items-center justify-start gap-2 hover:text-futuristic-cyan hover:bg-futuristic-cyan/10",
        )}
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/dashboard/plans"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "flex items-center justify-start gap-2 hover:text-futuristic-cyan hover:bg-futuristic-cyan/10",
        )}
      >
        <FileText className="h-4 w-4" />
        My Plans
      </Link>
      <Link
        href="/dashboard/history"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "flex items-center justify-start gap-2 hover:text-futuristic-cyan hover:bg-futuristic-cyan/10",
        )}
      >
        <History className="h-4 w-4" />
        Version History
      </Link>
      <Link
        href="/dashboard/settings"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "flex items-center justify-start gap-2 hover:text-futuristic-cyan hover:bg-futuristic-cyan/10",
        )}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>
      <Link
        href="/dashboard/profile"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "flex items-center justify-start gap-2 hover:text-futuristic-cyan hover:bg-futuristic-cyan/10",
        )}
      >
        <User className="h-4 w-4" />
        Profile
      </Link>
      <Link
        href="/dashboard/history"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "flex items-center justify-start gap-2 hover:text-futuristic-cyan hover:bg-futuristic-cyan/10",
        )}
      >
        <History className="h-4 w-4" />
        Version History
      </Link>
      <Link
        href="/dashboard/plans/new"
        className={cn(buttonVariants({ variant: "default" }), "mt-4 flex items-center justify-start gap-2")}
      >
        <PlusCircle className="h-4 w-4" />
        New Plan
      </Link>
      <div className="mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  )
}
