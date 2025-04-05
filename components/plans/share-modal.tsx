'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Share, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { PlanShare, ShareRole } from "@prisma/client"

interface ShareModalProps {
  planId: string
  planTitle: string
  initialShares?: PlanShare[]
  onShare?: (shares: PlanShare[]) => void
}

export function ShareModal({ planId, planTitle, initialShares = [], onShare }: ShareModalProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState<ShareRole>('VIEWER')
  const [shares, setShares] = useState<PlanShare[]>(initialShares)

  useEffect(() => {
    setShares(initialShares)
  }, [initialShares])

  const handleAddShare = async () => {
    if (!session?.user?.email || !searchQuery) return

    try {
      const response = await fetch('/api/plans/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userEmail: searchQuery,
          role: selectedRole,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to share plan')
      }

      const newShare = await response.json()
      setShares(prev => [...prev, newShare])
      setSearchQuery('')
      setSelectedRole('VIEWER')
      onShare?.(shares)
      toast({
        title: "Success",
        description: "Plan shared successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share plan",
        variant: "destructive",
      })
    }
  }

  const handleRemoveShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/plans/share/${shareId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove share')
      }

      setShares(prev => prev.filter(share => share.id !== shareId))
      onShare?.(shares)
      toast({
        title: "Success",
        description: "Share removed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove share",
        variant: "destructive",
      })
    }
  }

  const roleOptions = [
    { value: 'VIEWER', label: 'Viewer' },
    { value: 'EDITOR', label: 'Editor' },
    { value: 'ADMIN', label: 'Admin' },
  ]

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share {planTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Search users by email</Label>
            <Input
              id="email"
              placeholder="Enter email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ShareRole)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleAddShare}
            disabled={!searchQuery}
            className="w-full"
          >
            Add Share
          </Button>
          <div className="space-y-2">
            <Label>Shared with</Label>
            <div className="flex flex-wrap gap-2">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center rounded-md border bg-muted/50 p-2"
                >
                  <span className="mr-2">{share.user.email}</span>
                  <span className="mr-2">
                    {share.role.charAt(0) + share.role.slice(1).toLowerCase()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveShare(share.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
