"use client"

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"
import Link from "next/link"

// Helper function to generate initials
const getInitials = (name?: string | null) => {
    if (!name) return "";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || "";
    return (names[0][0]?.toUpperCase() || "") + (names[names.length - 1][0]?.toUpperCase() || "");
};

export function UserNav() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = getInitials(user?.name);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' }); // Redirect to home page after sign out
  };

  if (!user) {
    // Optionally return a Login button or null if session is loading/not authenticated
    // For now, returning null to avoid layout shifts during loading
    return null; 
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 border border-futuristic-cyan/30">
            {/* Use user image from session if available */}
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
            {/* Fallback with dynamically generated initials */}
            <AvatarFallback className="bg-futuristic-navy/50 text-futuristic-cyan">
                {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name ?? "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email ?? "No email"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href="/dashboard/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
