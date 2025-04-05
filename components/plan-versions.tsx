"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowLeft, ArrowRight } from "lucide-react"
import { PlanVersion } from "@prisma/client" // Import Prisma type

// Define the expected structure of the fetched version data (subset of PlanVersion)
interface VersionSummary {
  id: string;
  version: number;
  createdAt: string; // Dates are often strings in JSON
}

// Define props
interface PlanVersionsProps {
  planId: string;
  currentVersionId?: string; // Optional: To highlight the currently viewed version
}

export function PlanVersions({ planId, currentVersionId }: PlanVersionsProps) {
  const router = useRouter();
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      if (!planId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/plans/${planId}/versions`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch versions (${response.status})`);
        }
        const data: VersionSummary[] = await response.json();
        setVersions(data);
      } catch (fetchError) {
        console.error("Error fetching versions:", fetchError);
        const message = fetchError instanceof Error ? fetchError.message : "An unexpected error occurred.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [planId]); // Refetch if planId changes

  const handleViewVersion = (versionId: string) => {
    // Navigate to the same plan page but add/update the version query parameter
    router.push(`/dashboard/plans/${planId}?version=${versionId}`);
    // The parent page ([id]/page.tsx) needs to read this query param
    // and fetch/pass the correct initialPlanVersion to PlanDetails
  };

  // Render Loading/Error States
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent>Loading versions...</CardContent> {/* Add Skeleton later */}
      </Card>
    );
  }

  if (error) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">Error loading versions: {error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>Track changes and view previous versions of your plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4"> {/* Reduced spacing */}
            {versions.length === 0 ? (
              <p>No versions found for this plan.</p>
            ) : (
              versions.map((version, index) => {
                const isCurrent = version.id === currentVersionId; // Check if this is the currently viewed version
                const isLatest = index === 0; // Assuming descending order from API

                return (
                  <div key={version.id} className="rounded-lg border p-3"> {/* Reduced padding */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Version {version.version}</p>
                        {isLatest && <Badge variant="secondary">Latest</Badge>}
                        {isCurrent && <Badge variant="outline">Viewing</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{formatDate(new Date(version.createdAt))}</p>
                      </div>
                    </div>

                    {/* Removed Changes section for simplicity - fetch full version content on View */}

                    <div className="mt-3 flex flex-wrap items-center gap-2"> {/* Reduced margin */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewVersion(version.id)}
                        disabled={isCurrent} // Disable view if already viewing
                      >
                        View
                      </Button>
                      {!isLatest && (
                        <Button variant="outline" size="sm" disabled> {/* Keep disabled for now */}
                          Restore
                        </Button>
                      )}
                      {!isLatest && (
                        <Button variant="outline" size="sm" disabled> {/* Keep disabled for now */}
                          <ArrowLeft className="mr-1 h-3 w-3" />
                          <ArrowRight className="ml-1 h-3 w-3" />
                          Compare with Latest
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
