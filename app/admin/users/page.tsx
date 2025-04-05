import { UserManagement } from "@/components/admin/user-management"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Create, edit, and manage user accounts and permissions.</p>
      </div>

      <UserManagement />
    </div>
  )
}

