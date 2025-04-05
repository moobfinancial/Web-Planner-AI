"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn, buttonVariants } from "@/lib/utils"
import { LayoutDashboard, Users, Cpu, MessageSquare, Settings, ShieldAlert, BarChart } from "lucide-react"

export function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "User Management",
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "AI Providers",
      href: "/admin/ai-providers",
      icon: <Cpu className="h-4 w-4" />,
    },
    {
      title: "Prompt Templates",
      href: "/admin/prompts",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart className="h-4 w-4" />,
    },
    {
      title: "Security",
      href: "/admin/security",
      icon: <ShieldAlert className="h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ]

  return (
    <nav className="grid gap-2 pl-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex items-center justify-start gap-2 hover:text-primary hover:bg-primary/10",
            pathname === item.href && "bg-primary/10 text-primary",
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
