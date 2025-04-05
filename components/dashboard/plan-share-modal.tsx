'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useUserSearch } from "@/hooks/use-user-search"

interface PlanShareModalProps {
  planId: string
  sharedUsers: Array<{
    id: string
    name: string
    email: string
    role: 'VIEWER' | 'EDITOR' | 'ADMIN'
  }>
  onShare: (email: string, role: 'VIEWER' | 'EDITOR' | 'ADMIN') => Promise<void>
  onUnshare: (userId: string) => Promise<void>
}

export function PlanShareModal({
  planId,
  sharedUsers,
  onShare,
  onUnshare
}: PlanShareModalProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<'VIEWER' | 'EDITOR' | 'ADMIN'>('VIEWER')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const { users, isLoading: isSearching } = useUserSearch(searchQuery)

  const filteredUsers = users.filter(user => 
    !sharedUsers.some(shared => shared.id === user.id)
  )

  const handleShare = async (email: string) => {
    setLoading(true)
    try {
      await onShare(email, selectedRole)
      toast({
        title: "Success",
        description: "Plan shared successfully"
      })
      setSearchQuery('')
      setSelectedRole('VIEWER')
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share plan"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnshare = async (userId: string) => {
    try {
      await onUnshare(userId)
      toast({
        title: "Success",
        description: "Access removed successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove access"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Share Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Plan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search users</Label>
            <Input
              id="search"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">Viewer</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Available Users</Label>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {isSearching ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <Button
                        key={user.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleShare(user.email)}
                        disabled={loading}
                      >
                        {user.name} ({user.email})
                      </Button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            <div>
              <Label>Shared Users</Label>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {sharedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({user.role})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnshare(user.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
