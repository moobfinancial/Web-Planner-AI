"use client"

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { CustomerProfile } from "@/components/customer/customer-profile"

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const [isUploading, setIsUploading] = useState(false);

  const user = session?.user;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid File Type", description: "Please select an image file.", variant: "destructive" });
        return;
    }
    if (file.size > 5 * 1024 * 1024) { 
        toast({ title: "File Too Large", description: "Maximum file size is 5MB.", variant: "destructive" });
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await fetch('/api/user/profile/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to upload image");
      }

      toast({ title: "Success", description: "Profile picture updated!" });
      // await updateSession(); // Update session to get new image URL - Causing 405 error, using reload as workaround
      window.location.reload(); // Reload the page to show the updated image

    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Upload Failed", description: error.message || "Could not upload image.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading") {
    return (
        <div className="space-y-6 p-4 md:p-6">
            <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" /> 
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center space-x-4 pt-4">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <Skeleton className="h-10 w-32" />
                </div>
                 <Skeleton className="h-10 w-full mt-4" />
                 <Skeleton className="h-10 w-full mt-2" />
            </div>
        </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return <p className="p-4 md:p-6">Please log in to view your profile.</p>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
      <p className="text-muted-foreground">Manage your personal information and account details.</p>
      
      <CustomerProfile 
        user={user} 
        onFileChange={handleFileChange} 
        isUploading={isUploading} 
      />
    </div>
  );
}
