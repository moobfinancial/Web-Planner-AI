"use client";

import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress"; // Assuming Progress component exists
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

interface ProgressIndicatorProps {
  planId: string; // The ID of the specific Plan (version)
}

interface ProgressData {
  completed: number;
  total: number;
  lastUpdated: string | null; // Assuming ISO string format from JSON
}

export function ProgressIndicator({ planId }: ProgressIndicatorProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setIsLoading(false);
      setError("Plan ID is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchProgress = async () => {
      try {
        // ** MODIFIED: Added credentials: 'include' **
        const response = await fetch(`/api/plans/${planId}/build`, { credentials: 'include' }); // Use the GET endpoint
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to fetch progress: ${response.status} ${errorBody}`);
        }
        const data: ProgressData = await response.json();

        // Basic validation of received data
        if (typeof data.completed !== 'number' || typeof data.total !== 'number') {
            throw new Error('Invalid progress data received from API.');
        }

        setProgressData(data);
      } catch (fetchError) {
        console.error("Error fetching build progress:", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "An unknown error occurred.");
        setProgressData(null); // Reset data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [planId]); // Re-fetch if planId changes

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-10" />
      </div>
    );
  }

  if (error) {
    return <div className="text-xs text-red-500">Error loading progress: {error}</div>;
  }

  if (!progressData || progressData.total === 0) {
    // Handle case where progress hasn't been initialized or total is zero
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Build progress not started.</span>
        </div>
    );
  }

  const percentage = progressData.total > 0 ? Math.round((progressData.completed / progressData.total) * 100) : 0;

  return (
    <div className="flex w-full items-center gap-2 text-sm">
      <Progress value={percentage} className="flex-grow" aria-label={`Build progress: ${percentage}%`} />
      <span className="font-medium">{percentage}%</span>
      <span className="text-xs text-muted-foreground">({progressData.completed}/{progressData.total})</span>
    </div>
  );
}
