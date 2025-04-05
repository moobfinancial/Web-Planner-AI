"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Save, Upload, User, Calendar, Shield, Check, X, Clock } from "lucide-react"

// Define props for the component
interface CustomerProfileProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    // Add other relevant user fields from session/db if needed
    // role?: "USER" | "ADMIN";
    // createdAt?: string; // Consider formatting if needed
  };
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading: boolean;
  // Add props for saving other fields later if needed
  // onSaveProfile: (data: any) => Promise<void>;
  // isSaving: boolean;
}

// Helper function to generate initials
const getInitials = (name?: string | null) => {
    if (!name) return "";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || "";
    return (names[0][0]?.toUpperCase() || "") + (names[names.length - 1][0]?.toUpperCase() || "");
};

export function CustomerProfile({ user, onFileChange, isUploading }: CustomerProfileProps) {
  const { toast } = useToast() // Keep toast for potential future use (e.g., saving other fields)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Remove Mock State --- 
  // const [isSaving, setIsSaving] = useState(false) // Will add back if saving other fields
  // const [profileData, setProfileData] = useState({...}) // Remove mock data

  const initials = getInitials(user.name);

  // --- Remove Mock Handlers --- 
  // const handleChange = (...) => {...}
  // const handleFileChange = (...) => {...}
  // const handleSaveProfile = (...) => {...}

  const handleProfileImageClick = () => {
    fileInputRef.current?.click()
  }

  // --- Use Props for User Data and Upload State --- 
  const profileImageUrl = user.image;
  const firstName = user.name?.split(' ')[0] || "";
  const lastName = user.name?.split(' ').slice(1).join(' ') || ""; // Simple split, might need refinement
  const email = user.email || "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and profile image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar
                  className="h-32 w-32 border-2 border-primary/30 cursor-pointer"
                  onClick={handleProfileImageClick}
                >
                  {/* Use image from props */}
                  <AvatarImage
                    src={profileImageUrl ?? undefined}
                    alt={user.name ?? "User"}
                  />
                  {/* Use initials from props */}
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Use isUploading prop */}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
                <div className="absolute bottom-0 right-0">
                  <Button
                    type="button"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                    onClick={handleProfileImageClick}
                    disabled={isUploading} // Use isUploading prop
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  {/* Hidden input uses onFileChange prop */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onFileChange} // Use onFileChange prop
                    disabled={isUploading} // Use isUploading prop
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Click button to upload
                  <br />
                  PNG, JPG, GIF (max. 5MB)
                </p>
              </div>
            </div>

            <div className="flex-1 grid gap-4 md:grid-cols-2">
              {/* Display Name (read-only for now) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={user.name ?? ''}
                  readOnly
                  disabled
                />
              </div>
              {/* Display Email (read-only) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                />
              </div>
              {/* --- Remove other editable fields for now --- */}
              {/* 
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={profileData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={profileData.bio} onChange={(e) => handleChange("bio", e.target.value)} rows={4} />
              </div>
              */}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button /* onClick={handleSaveProfile} disabled={isSaving || isUploading} */ disabled={true}> 
            {/* {isSaving ? (...) : (...) } */}
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes (Disabled)
              </>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Your work and professional details (Display Only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value="N/A" readOnly disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" value="N/A" readOnly disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value="N/A" readOnly disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value="N/A" readOnly disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and status (Display Only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span className="font-medium">User ID:</span>
                <span className="text-muted-foreground break-all">{user.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">N/A</Badge>
                <span className="font-medium">Account Type</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">Member Since:</span>
                <span className="text-muted-foreground">N/A</span> 
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Last Login:</span>
                <span className="text-muted-foreground">N/A</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Active {/* Placeholder */}
                </Badge>
                <span className="font-medium">Account Status</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Placeholder logic */}
                <Check className="h-5 w-5 text-green-500" /> 
                <span className="font-medium">Email Verified:</span>
                <span className="text-muted-foreground">Yes {/* Placeholder */}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Placeholder logic */}
                <X className="h-5 w-5 text-red-500" />
                <span className="font-medium">Two-Factor Authentication:</span>
                <span className="text-muted-foreground">Disabled {/* Placeholder */}</span>
              </div>
               <div className="flex items-center gap-2">
                 <Button
                   variant="outline"
                   size="sm"
                   className="mt-2"
                   disabled={true}
                 >
                   <Shield className="h-4 w-4 mr-2" />
                   Enable 2FA (Disabled)
                 </Button>
               </div>
            </div>
          </div>
        </CardContent>
         <CardFooter className="flex justify-between border-t px-6 py-4">
           <Button variant="outline" disabled={true}>Reset Password (Disabled)</Button>
           {/* Secondary Save Button - Also disabled */}
           <Button disabled={true}>
             <Save className="mr-2 h-4 w-4" /> Save Account Settings (Disabled)
           </Button>
         </CardFooter>
       </Card>
      
     </div>
   )
 }
