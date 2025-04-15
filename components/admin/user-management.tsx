"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, PlusCircle, MoreHorizontal, Edit, Trash, Shield, UserCog, Terminal } from "lucide-react"
import { UserDialog } from "@/components/admin/user-dialog"
import { Skeleton } from "@/components/ui/skeleton"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast"; 

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null; 
  image: string | null;
  role: 'USER' | 'ADMIN' | 'EDITOR'; 
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string; 
  updatedAt: string; 
  password?: string;
};

type UserFormData = {
  id?: string; // Optional: Present when editing
  name: string | null; // Changed to allow null
  email: string | null; // Changed to allow null
  role: 'USER' | 'ADMIN'; // EDITOR removed
  status: 'ACTIVE' | 'INACTIVE';
  password?: string; // Optional: Only needed for creation
};

export function UserManagement(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]) // State for the list of users
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null) // State for the user being edited or null for new user
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); 

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          if (response.status === 403) {
             throw new Error('Access Denied: You do not have permission to view users.');
          }
          const errorData = await response.json().catch(() => ({})); 
          throw new Error(errorData.error || `Failed to fetch users: ${response.statusText}`);
        }
        const data: User[] = await response.json();
        setUsers(data);
      } catch (err: any) {
        console.error("Error fetching admin users:", err);
        setError(err.message || 'An unexpected error occurred while fetching users.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []); 

  const filteredUsers = users.filter(
    (user) =>
      (user.status && user.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()), 
  )

  const handleCreateUser = () => {
    setCurrentUser(null) 
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: User): void => {
    setCurrentUser(user); // Set the full user object
    setIsDialogOpen(true)
  }

  const handleDeleteUser = async (userId: string, userEmail: string | null) => {
    if (!confirm(`Are you sure you want to delete the user ${userEmail || userId}? This action cannot be undone.`)) {
      return; 
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json(); 

      if (!response.ok) {
        throw new Error(result.error || `Failed to delete user: ${response.statusText}`);
      }

      setUsers(users.filter((user) => user.id !== userId));
      toast({
        title: "User Deleted",
        description: result.message || `User ${userEmail || userId} successfully deleted.`,
      });

    } catch (err: any) {
      console.error(`Error deleting user (ID: ${userId}):`, err);
      toast({
        title: "Error Deleting User",
        description: err.message || "An unexpected error occurred.", 
        variant: "destructive",
      });
    }
  }

  const handleSaveUser = async (userData: UserFormData) => {
    const isEditing = !!currentUser; 

    if (isEditing && currentUser) {
      try {
        const userId = currentUser.id;
        const { password, ...dataToUpdate } = userData;
        const payload: UserFormData = { ...dataToUpdate, status: dataToUpdate.status ?? 'ACTIVE' };

        const response = await fetch(`/api/admin/users?userId=${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Failed to update user: ${response.statusText}`);
        }

        setUsers(users.map((user) => (user.id === userId ? result : user)));
        setIsDialogOpen(false); 
        toast({
          title: "User Updated",
          description: `User ${result.email} has been successfully updated.`,
        });

      } catch (err: any) {
        console.error(`Error updating user (ID: ${currentUser.id}):`, err);
        toast({
          title: "Error Updating User",
          description: err.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } else {
      try {
        const payload: UserFormData = { ...userData, status: userData.status ?? 'ACTIVE' };

        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Failed to create user: ${response.statusText}`);
        }
        
        setUsers([result, ...users]); 
        setIsDialogOpen(false); 
        toast({
          title: "User Created",
          description: `User ${result.email} has been successfully created.`,
        });

      } catch (err: any) {
        console.error("Error creating user:", err);
        toast({
          title: "Error Creating User",
          description: err.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search users..." className="pl-8" disabled />
          </div>
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell> 
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Users</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, or role..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateUser}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>A list of registered users. Total: {filteredUsers.length}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead> 
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {users.length > 0 ? "No users match your search." : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'EDITOR' ? 'outline' : 'secondary'}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'ACTIVE' ? 'default' : 'outline'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right"> 
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User Info
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <UserCog className="mr-2 h-4 w-4" />
                          Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Shield className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 hover:bg-red-100 focus:bg-red-100 focus:text-red-700" onClick={() => handleDeleteUser(user.id, user.email)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isDialogOpen && (
        <UserDialog
          initialData={currentUser} // Pass the full User object or null
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  )
}
