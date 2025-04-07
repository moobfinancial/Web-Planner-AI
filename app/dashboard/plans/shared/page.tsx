'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Share2, Trash2, UserPlus, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PlanShareModal } from "@/components/dashboard/plan-share-modal"
import { useUser } from "@/hooks/use-user"
import { ShareRole } from '@prisma/client'

interface SharedUser {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  role: ShareRole;
  shareId: string;
}

interface SharedProject {
  id: string;
  projectName: string;
  ownerId: string;
  ownerName: string | null;
  ownerEmail?: string | null;
  isOwner: boolean;
  sharedWith: SharedUser[];
}

export default function SharedProjectsPage() {
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<SharedProject | null>(null)
  const { toast } = useToast()
  const { user } = useUser()

  const fetchSharedProjects = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch('/api/projects/shared');
      if (!response.ok) {
        throw new Error(`Failed to fetch shared projects: ${response.statusText}`);
      }
      const data: SharedProject[] = await response.json();
      setSharedProjects(data);
    } catch (error) {
      console.error('Error fetching shared projects:', error);
      toast({
        title: "Error Loading Projects",
        description: error instanceof Error ? error.message : "Could not load shared projects. Please try again.",
        variant: "destructive",
      });
      setSharedProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchSharedProjects();
  }, [fetchSharedProjects]);

  const handleShare = useCallback(async (projectId: string, email: string, role: ShareRole) => {
    try {
      const response = await fetch('/api/plans/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, userEmail: email, role }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to share project');
      }
      toast({
        title: "Success",
        description: result.message || "Project shared successfully",
      });
      setSelectedProject(null);
      await fetchSharedProjects();
    } catch (error) {
      console.error('Error sharing project:', error);
      toast({
        title: "Error Sharing",
        description: error instanceof Error ? error.message : "Failed to share project. Please try again.",
        variant: "destructive",
      });
    }
  }, [fetchSharedProjects, toast]);

  const handleUnshare = useCallback(async (shareId: string) => {
    if (!shareId) {
      console.error("Attempted to unshare without a valid shareId.");
      toast({ title: "Error", description: "Cannot remove share: Invalid ID.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/plans/share?shareId=${shareId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to remove share');
      }
      toast({
        title: "Success",
        description: result.message || "Access removed successfully",
      });
      setSelectedProject(null);
      await fetchSharedProjects();
    } catch (error) {
      console.error('Error removing share:', error);
      toast({
        title: "Error Removing Share",
        description: error instanceof Error ? error.message : "Failed to remove access. Please try again.",
        variant: "destructive",
      });
    }
  }, [fetchSharedProjects, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading shared projects...</span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-4 md:p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Shared Projects</CardTitle>
        <CardDescription>View and manage projects shared with you or by you.</CardDescription>
      </CardHeader>

      {sharedProjects.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          You currently have no projects shared with you, nor have you shared any projects.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sharedProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{project.projectName}</span>
                  {project.isOwner && (
                    <Button variant="ghost" size="icon" onClick={() => setSelectedProject(project)}>
                      <UserPlus className="h-5 w-5" />
                      <span className="sr-only">Share Project</span>
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Owned by: {project.isOwner ? 'You' : (project.ownerName || project.ownerEmail || 'Unknown Owner')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center">
                  <Users className="h-4 w-4 mr-1" /> Shared With:
                </h4>
                {project.sharedWith.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Not shared with anyone yet.</p>
                ) : (
                  <ul className="space-y-1 list-none p-0">
                    {project.sharedWith.map((share) => (
                      <li key={share.shareId} className="flex justify-between items-center text-sm">
                        <span className="truncate" title={share.email ?? undefined}>
                          {share.name || share.email || 'Unknown User'} ({share.role})
                        </span>
                        {(project.isOwner || share.id === user?.id) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleUnshare(share.shareId)}
                            title={`Remove ${share.name || share.email}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Remove Share</span>
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedProject && (
        <PlanShareModal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          projectId={selectedProject.id}
          projectName={selectedProject.projectName}
          currentShares={selectedProject.sharedWith.map(sw => ({
            userId: sw.id,
            email: sw.email ?? '',
            name: sw.name ?? undefined,
            role: sw.role,
            shareId: sw.shareId
          }))}
          onShare={(email, role) => handleShare(selectedProject.id, email, role)}
          onUnshare={(shareId) => handleUnshare(shareId)}
          isOwner={selectedProject.isOwner}
        />
      )}
    </ScrollArea>
  )
}
