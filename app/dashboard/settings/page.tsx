"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Trash2, Save } from "lucide-react";
import { Project } from "@prisma/client"; // Import Project type
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CustomerSettings } from "@/components/customer/customer-settings"

// Interface for the project data fetched for the dropdown
interface ProjectSelectItem {
  id: string;
  projectName: string;
}

// Interface for the full project details (could be more specific)
interface ProjectDetails extends Project {}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<ProjectSelectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<ProjectDetails | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ProjectDetails>>({}); // Use Partial for edits
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch projects for the dropdown
  const fetchProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch("/api/user/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({ title: "Error", description: "Could not load your projects.", variant: "destructive" });
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProjects();
    }
  }, [fetchProjects, status]);

  // Fetch full project details when selection changes
  useEffect(() => {
    if (!selectedProjectId) {
      setSelectedProjectDetails(null);
      setEditFormData({});
      return;
    }

    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      setSelectedProjectDetails(null); // Clear previous details
      setEditFormData({});
      try {
        const response = await fetch(`/api/projects/${selectedProjectId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }
        const data: ProjectDetails = await response.json();
        setSelectedProjectDetails(data);
        // Initialize form data with fetched details
        setEditFormData({
          projectName: data.projectName,
          projectDescription: data.projectDescription || '',
          codeEditor: data.codeEditor || '',
          targetAudience: data.targetAudience || '',
          keyGoals: data.keyGoals || '',
        });
      } catch (error) {
        console.error("Error fetching project details:", error);
        toast({ title: "Error", description: "Could not load details for the selected project.", variant: "destructive" });
        setSelectedProjectId(""); // Deselect if details failed to load
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedProjectId]);

  // Handle input changes for the edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle saving changes
  const handleSaveChanges = async () => {
    if (!selectedProjectId || !editFormData.projectName) {
      toast({ title: "Error", description: "Project name cannot be empty.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        let errorMsg = "Failed to save changes.";
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || (errorData.errors?.[0]?.message) || errorMsg;
        } catch(_) {}
        throw new Error(errorMsg);
      }

      const updatedProject: ProjectDetails = await response.json();
      setSelectedProjectDetails(updatedProject); // Update local details
      // Update project name in the dropdown list
      setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, projectName: updatedProject.projectName } : p));
      toast({ title: "Success", description: "Project details updated." });

    } catch (error: any) {
      console.error("Error saving project details:", error);
      toast({ title: "Error", description: error.message || "Could not save changes.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!selectedProjectId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMsg = "Failed to delete project.";
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch(_) {}
        throw new Error(errorMsg);
      }

      toast({ title: "Success", description: "Project deleted successfully." });
      setSelectedProjectId(""); // Clear selection
      setSelectedProjectDetails(null); // Clear details form
      setEditFormData({});
      fetchProjects(); // Re-fetch projects list

    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({ title: "Error", description: error.message || "Could not delete project.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const selectedProjectName = projects.find(p => p.id === selectedProjectId)?.projectName || "";

  if (status === "loading") {
    return <div className="p-6"><Skeleton className="h-8 w-1/4 mb-4" /><Skeleton className="h-40 w-full" /></div>; // Basic loading skeleton
  }

  if (!session) {
    // router.push('/login'); // Or handle unauthorized access
    return <div className="p-6">Please log in to view settings.</div>; 
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* --- Project Selection and Deletion Card --- */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Projects</CardTitle>
          <CardDescription>Select a project to edit its details or delete it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingProjects ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select onValueChange={setSelectedProjectId} value={selectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!selectedProjectId || isDeleting}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Selected Project"}
          </Button>
        </CardContent>
      </Card>

      {/* --- Project Details Editing Card --- */}
      {selectedProjectId && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"> 
                <CardTitle>Edit Project Details</CardTitle>
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="cursor-help">
                                <Info className="h-4 w-4 text-muted-foreground" />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={5} className="max-w-xs z-50">
                        <p className="text-xs">
                            Editing these details updates the project's metadata only.
                            The generated plan content remains unchanged and can be refined
                            via feedback on the plan details page.
                        </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <CardDescription>Modify the details for "{selectedProjectName}".</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingDetails ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-1/3 mt-2" />
              </div>
            ) : selectedProjectDetails ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input
                            id="projectName"
                            name="projectName"
                            value={editFormData.projectName || ''}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="projectDescription">Project Description</Label>
                        <Textarea
                            id="projectDescription"
                            name="projectDescription"
                            value={editFormData.projectDescription || ''}
                            onChange={handleInputChange}
                            rows={4}
                            className="mt-1"
                        />
                    </div>
                    {/* Add other fields here if needed (e.g., targetAudience, keyGoals) */}
                    {/* Example: */}
                    {/* <div>
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Textarea id="targetAudience" name="targetAudience" value={editFormData.targetAudience || ''} onChange={handleInputChange} rows={3} className="mt-1"/>
                    </div> */}
                    {/* <div>
                        <Label htmlFor="keyGoals">Key Goals</Label>
                        <Textarea id="keyGoals" name="keyGoals" value={editFormData.keyGoals || ''} onChange={handleInputChange} rows={3} className="mt-1"/>
                    </div> */}
                    {/* <div>
                        <Label htmlFor="codeEditor">Preferred Code Editor</Label>
                        <Input id="codeEditor" name="codeEditor" value={editFormData.codeEditor || ''} onChange={handleInputChange} className="mt-1"/>
                    </div> */}

                    <Button type="submit" disabled={isSaving || isLoadingDetails}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">Could not load project details.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- Delete Confirmation Dialog --- */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              "<strong>{selectedProjectName}</strong>" and all associated data,
              including plan versions and feedback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, delete project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CustomerSettings />
    </div>
  );
}
