"use client"; // Convert to Client Component

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ArrowRight, Calendar, Loader2 } from "lucide-react";
import { Project } from "@prisma/client"; // Import Project type if needed, or define inline

// Define the expected structure for fetched project data
interface FetchedProject {
  id: string;
  projectName: string;
  projectDescription: string | null;
  createdAt: string; // Dates will likely be strings from JSON
  updatedAt: string;
}

export default function PlansPage() {
  const [projects, setProjects] = useState<FetchedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/plans'); // Fetch from the new endpoint
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch plans (${response.status})`);
        }
        const data: FetchedProject[] = await response.json();
        setProjects(data);
      } catch (fetchError) {
        console.error("Error fetching projects:", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []); // Empty dependency array means run once on mount
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Plans</h2>
          <p className="text-muted-foreground">View and manage your website planning projects.</p>
        </div>
        <Link href="/dashboard/plans/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Plan
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading plans...</span>
        </div>
      )}

      {error && (
         <div className="text-red-500 p-4 border border-red-500 rounded">Error loading plans: {error}</div>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <div className="text-center text-muted-foreground p-10 border rounded-lg">
          You haven't created any plans yet.
          <Link href="/dashboard/plans/new" className="ml-2 text-primary hover:underline">
            Create your first plan!
          </Link>
        </div>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{project.projectName}</CardTitle>
                <CardDescription>{project.projectDescription || "No description provided."}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {/* Parse date string before formatting */}
                  <span>Updated {formatDate(new Date(project.updatedAt))}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/dashboard/plans/${project.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          ))}
        </div>
      )} {/* Close the conditional rendering block */}
    </div> // Close the main container div
  ); // Close the main return statement
} // Close the PlansPage component

// Define formatDate function outside the component
function formatDate(date: Date): string {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return "today"
  } else if (diffInDays === 1) {
    return "yesterday"
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
}
