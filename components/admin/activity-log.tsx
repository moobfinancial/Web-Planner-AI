'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Role } from '@prisma/client'; // Import Role enum
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns'; // For formatting timestamps

// Define the structure of an activity log entry with user details
interface ActivityLog {
  id: string;
  type: string;
  details: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null; // User might be null for system activities?
}

interface ApiResponse {
  activities: ActivityLog[];
  totalActivities: number;
  totalPages: number;
  currentPage: number;
}

const ITEMS_PER_PAGE = 10;

export function ActivityLog(): JSX.Element {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | 'ALL'>('ALL'); // State for role filter

  const fetchActivities = useCallback(async (page: number, role: Role | 'ALL') => {
    setIsLoading(true);
    setError(null);
    try {
      // Construct URL with pagination and role filter
      const apiUrl = `/api/admin/activity?page=${page}&limit=${ITEMS_PER_PAGE}&role=${role}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();
      setActivities(data.activities);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activity logs.');
      setActivities([]); // Clear activities on error
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies here, fetch triggered manually or by effect

  useEffect(() => {
    // Fetch activities whenever page or role filter changes
    fetchActivities(currentPage, selectedRole);
  }, [fetchActivities, currentPage, selectedRole]);

  // Handler for changing the role filter
  const handleRoleChange = (value: string) => {
    // Type assertion needed as SelectItem value is string
    const newRole = value as Role | 'ALL';
    setSelectedRole(newRole);
    setCurrentPage(1); // Reset to page 1 when filter changes
    // fetchActivities(1, newRole); // Effect will trigger this automatically
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-4">Activity Log</h1>

      {/* Filter Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="role-filter">Filter by Role:</Label>
          <Select value={selectedRole} onValueChange={handleRoleChange}>
            <SelectTrigger id="role-filter" className="w-[180px]">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value={Role.ADMIN}>Admin</SelectItem>
              <SelectItem value={Role.USER}>User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Add more filters here (e.g., User search, Date range) */}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading activities...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        {format(new Date(activity.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        {activity.user ? `${activity.user.name || 'N/A'} (${activity.user.email || 'No Email'})` : 'System'}
                      </TableCell>
                      <TableCell>{activity.type}</TableCell>
                      <TableCell className="max-w-xs truncate">{activity.details}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No activity logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
