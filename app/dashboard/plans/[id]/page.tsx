"use client"

import React from "react"
import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlanDetails } from "@/components/plan-details"
import { PlanVersions } from "@/components/plan-versions"
import { PlanPrompts } from "@/components/plan-prompts"
import { Plan, ProjectStatus } from "@prisma/client" 
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"; 
import { Badge } from "@/components/ui/badge"; 
import { CheckCircle2 } from 'lucide-react'; 

interface PlanVersionWithStatus extends Plan {
  projectStatus?: ProjectStatus;
  projectName?: string;
}

// Modified to handle both Promise and direct object params
function PlanPageContent({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Safely extract projectId, handling both Promise and direct object cases
  const projectId = useMemo(() => {
    if (params instanceof Promise) {
      try {
        return React.use(params).id;
      } catch (e) {
        console.error("Error unwrapping params promise:", e);
        return "";
      }
    } 
    return params.id;
  }, [params]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedVersionId = searchParams.get("version");

  const [activeTab, setActiveTab] = useState("details");
  const [planTitle, setPlanTitle] = useState<string>("Loading Plan...");
  const [currentPlanVersion, setCurrentPlanVersion] = useState<PlanVersionWithStatus | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(requestedVersionId);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[Effect Triggered] projectId: ${projectId}, requestedVersionId: ${requestedVersionId}`); // Log effect trigger

    const fetchPlanData = async () => {
      if (!projectId) {
        console.log("[Effect] No projectId, returning.");
        return;
      }
      setIsLoading(true);
      console.log(`[Effect] Starting fetch. Requested version: ${requestedVersionId}`); // Log fetch start
      setError(null);
      setCurrentPlanVersion(null);

      try {
        let versionToLoad: PlanVersionWithStatus | null = null;
        let versionIdToFetch: string | null = requestedVersionId;

        if (!versionIdToFetch) {
            const response = await fetch(`/api/plans/${projectId}/versions`, { credentials: 'include' }); 
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch versions`);
            }
            const versions = await response.json() as { id: string, versionNumber: number | null, createdAt: string }[]; // Allow null versionNumber
            if (versions && versions.length > 0) {
                // Filter out versions with null versionNumber before sorting
                // Sort by createdAt date if versionNumber is null
                versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                versionIdToFetch = versions[0].id;
                console.log(`[Effect] No requestedVersionId, found latest version: ${versionIdToFetch}`);
            } else {
                throw new Error("Project has no plan versions.");
            }
        }

        if (versionIdToFetch) {
            console.log(`[Effect] Fetching content for versionId: ${versionIdToFetch}`); // Log specific version fetch
            const versionResponse = await fetch(`/api/plans/${projectId}/versions/${versionIdToFetch}`, { credentials: 'include' });
            if (!versionResponse.ok) {
                const errorData = await versionResponse.json();
                throw new Error(errorData.message || `Failed to fetch version content`);
            }
            versionToLoad = await versionResponse.json() as PlanVersionWithStatus;
            console.log(`[Effect] Fetched content for version ${versionToLoad.id}, versionNumber: ${versionToLoad.versionNumber}`);
            setCurrentVersionId(versionToLoad.id);
        } else {
             console.error("[Effect] Could not determine versionIdToFetch.");
             throw new Error("Could not determine which version to load.");
        }

        console.log(`[Effect] Setting currentPlanVersion state with version ID: ${versionToLoad?.id}`);
        setCurrentPlanVersion(versionToLoad);
        setPlanTitle(versionToLoad?.projectName || `Project ${projectId}`);

      } catch (fetchError) {
        console.error('Error fetching plan data:', fetchError);
        const message = fetchError instanceof Error ? fetchError.message : "An unexpected error occurred.";
        setError(message);
        setCurrentVersionId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanData();
  }, [projectId, requestedVersionId]); 

  const handleMarkComplete = async () => {
    if (!projectId || !currentPlanVersion || currentPlanVersion.projectStatus === ProjectStatus.COMPLETED) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: ProjectStatus.COMPLETED }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to update status.";
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const updatedProject = await response.json();
      setCurrentPlanVersion(prev => prev ? { ...prev, projectStatus: updatedProject.status } : null);
      toast({ title: "Success", description: "Project marked as complete." });

    } catch (error: any) {
      console.error('Error marking project as complete:', error);
      toast({ title: "Error", description: error.message || "Failed to update status.", variant: "destructive" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRefinement = (newVersionId: string) => {
      router.push(`/dashboard/plans/${projectId}?version=${newVersionId}`);
  }

  const isCompleted = currentPlanVersion?.projectStatus === ProjectStatus.COMPLETED;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </>
          ) : error ? (
             <h2 className="text-2xl font-bold tracking-tight text-red-600">Error Loading Plan</h2>
          ) : (
            <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    {planTitle || `Project ${projectId}`} 
                    {isCompleted && <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Completed</Badge>}
                </h2>
                <p className="text-muted-foreground">
                  Project ID: {projectId} 
                  {currentPlanVersion?.versionNumber ? ` • Viewing Version ${currentPlanVersion.versionNumber}` : ''} 
                </p>
            </div>
          )}
        </div>

        {!isLoading && !error && currentPlanVersion && (
            <div>
                <Button 
                    onClick={handleMarkComplete}
                    disabled={isUpdatingStatus || isCompleted}
                    size="sm"
                >
                    {isUpdatingStatus ? (
                        "Updating..."
                    ) : isCompleted ? (
                        <><CheckCircle2 className="mr-2 h-4 w-4" /> Completed</>
                    ) : (
                        <><CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Complete</>
                    )}
                </Button>
            </div>
        )}
      </div>

      {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
      ) : error ? (
          <div className="text-red-600 p-4 border border-red-200 rounded-md">
              <p><strong>Error:</strong> {error}</p>
              <p className="mt-2 text-sm">Could not load plan details. Please try again later or check the project ID.</p>
          </div>
      ) : currentPlanVersion ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Plan Details</TabsTrigger>
            <TabsTrigger value="prompts">Implementation Prompts</TabsTrigger>
            <TabsTrigger value="versions">Version History</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <PlanDetails 
                planId={projectId} 
                initialPlanVersion={currentPlanVersion} 
                onRefinementSuccess={handleRefinement} 
            />
          </TabsContent>
          <TabsContent value="prompts">
            <PlanPrompts 
                planId={projectId} 
                currentVersionId={currentVersionId} 
            />
          </TabsContent>
          <TabsContent value="versions">
            <PlanVersions 
                planId={projectId} 
                currentVersionId={currentVersionId} 
            />
          </TabsContent>
        </Tabs>
      ) : (
         <div className="text-muted-foreground p-4 border border-dashed rounded-md">
              <p>No plan version data available for this project.</p>
          </div>
      )}
    </div>
  );
}

export default function PlanPageWrapper({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  return (
    <Suspense fallback={<div>Loading plan details...</div>}> 
      <PlanPageContent params={params} />
    </Suspense>
  );
}
