'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PlanShareModal } from "@/components/dashboard/plan-share-modal"
import { useUser } from "@/hooks/use-user"
import { prisma } from "@/prisma/client"

export default function SharedPlansPage() {
  const [sharedPlans, setSharedPlans] = useState<Array<{
    id: string
    title: string
    ownerId: string
    ownerName: string
    sharedUsers: Array<{
      id: string
      name: string
      email: string
      role: 'VIEWER' | 'EDITOR' | 'ADMIN'
    }>
  }>>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useUser()

  useEffect(() => {
    const fetchSharedPlans = async () => {
      try {
        const plans = await prisma.plan.findMany({
          where: {
            OR: [
              { ownerId: user?.id },
              {
                sharedWith: {
                  some: {
                    userId: user?.id
                  }
                }
              }
            ]
          },
          include: {
            owner: {
              select: {
                id: true,
                name: true
              }
            },
            sharedWith: {
              select: {
                id: true,
                role: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        })

        setSharedPlans(plans.map(plan => ({
          id: plan.id,
          title: plan.title,
          ownerId: plan.ownerId,
          ownerName: plan.owner?.name || 'Unknown',
          sharedUsers: plan.sharedWith.map(share => ({
            id: share.user.id,
            name: share.user.name,
            email: share.user.email,
            role: share.role
          }))
        })))
      } catch (error) {
        console.error('Error fetching shared plans:', error)
        toast({
          title: "Error",
          description: "Failed to load shared plans"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSharedPlans()
  }, [user?.id])

  const handleShare = async (planId: string, email: string, role: 'VIEWER' | 'EDITOR' | 'ADMIN') => {
    try {
      await prisma.planShare.create({
        data: {
          planId,
          userId: (await prisma.user.findFirst({
            where: { email: email.toLowerCase() }
          }))?.id || '',
          role,
          permissions: {
            create: [
              { permission: 'VIEW' },
              { permission: 'COMMENT' }
            ]
          }
        }
      })

      toast({
        title: "Success",
        description: "Plan shared successfully"
      })

      // Refresh the shared plans list
      const plans = await prisma.plan.findMany({
        where: {
          OR: [
            { ownerId: user?.id },
            {
              sharedWith: {
                some: {
                  userId: user?.id
                }
              }
            }
          ]
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true
            }
          },
          sharedWith: {
            select: {
              id: true,
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })

      setSharedPlans(plans.map(plan => ({
        id: plan.id,
        title: plan.title,
        ownerId: plan.ownerId,
        ownerName: plan.owner?.name || 'Unknown',
        sharedUsers: plan.sharedWith.map(share => ({
          id: share.user.id,
          name: share.user.name,
          email: share.user.email,
          role: share.role
        }))
      })))
    } catch (error) {
      console.error('Error sharing plan:', error)
      toast({
        title: "Error",
        description: "Failed to share plan"
      })
    }
  }

  const handleUnshare = async (planId: string, userId: string) => {
    try {
      await prisma.planShare.delete({
        where: {
          planId_userId: {
            planId,
            userId
          }
        }
      })

      toast({
        title: "Success",
        description: "Access removed successfully"
      })

      // Refresh the shared plans list
      const plans = await prisma.plan.findMany({
        where: {
          OR: [
            { ownerId: user?.id },
            {
              sharedWith: {
                some: {
                  userId: user?.id
                }
              }
            }
          ]
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true
            }
          },
          sharedWith: {
            select: {
              id: true,
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })

      setSharedPlans(plans.map(plan => ({
        id: plan.id,
        title: plan.title,
        ownerId: plan.ownerId,
        ownerName: plan.owner?.name || 'Unknown',
        sharedUsers: plan.sharedWith.map(share => ({
          id: share.user.id,
          name: share.user.name,
          email: share.user.email,
          role: share.role
        }))
      })))
    } catch (error) {
      console.error('Error removing share:', error)
      toast({
        title: "Error",
        description: "Failed to remove access"
      })
    }
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Shared Plans</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          sharedPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>
                  Owned by {plan.ownerName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Shared With</Label>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {plan.sharedUsers.map((user) => (
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
                              onClick={() => handleUnshare(plan.id, user.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <PlanShareModal
                    planId={plan.id}
                    sharedUsers={plan.sharedUsers}
                    onShare={handleShare}
                    onUnshare={handleUnshare}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
