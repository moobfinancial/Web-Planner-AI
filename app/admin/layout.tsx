'use server'

import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdminNav } from "@/components/admin/admin-nav"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the session
  const session = await getServerSession(authOptions)

  // Check if user has admin access
  const hasAccess = session?.user?.role === "ADMIN"

  if (!hasAccess) {
    redirect("/login?callbackUrl=/admin")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 relative">
        <div className="absolute inset-0 circuit-bg opacity-50"></div>
        <aside className="hidden w-64 border-r border-primary/20 md:block relative z-10">
          <div className="sticky top-16 overflow-y-auto py-6 pr-6">
            <AdminNav />
          </div>
        </aside>
        <main className="flex-1 p-6 relative z-10">{children}</main>
      </div>
    </div>
  )
}
