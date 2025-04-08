"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react'; // Import the spinner icon

// Type received from the UserManagement component (full User or null)
type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  image?: string | null;
  emailVerified?: Date | null;
};

// Type for the form data managed within the dialog
type UserFormData = {
  id?: string; // Present when editing
  name: string | null; // Revert to non-optional, allow null
  email: string | null; // Revert to non-optional, allow null
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE'; // Added status field
  password?: string; // Only needed for creation
};

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserFormData) => Promise<void>; // Use UserFormData for saving
  initialData: User | null; // Accept full User object or null for new user
}

export function UserDialog({ isOpen, onClose, onSave, initialData }: UserDialogProps): JSX.Element {
  const { toast } = useToast();

  // Initialize form data based on initialData or defaults for new user
  const [formData, setFormData] = useState<UserFormData>(() => {
    const defaults: UserFormData = {
      name: '', // Default to empty string to avoid uncontrolled input warning
      email: '', // Default to empty string
      role: 'USER',
      status: 'ACTIVE',
      password: ''
    };
    if (initialData) {
      // Map User to UserFormData when editing
      return {
        id: initialData.id,
        name: initialData.name ?? '', // Ensure non-null string
        email: initialData.email ?? '', // Ensure non-null string
        role: initialData.role,
        status: initialData.status,
        password: '' // Password field is empty when editing
      };
    }
    return defaults; // Use defaults for new user
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (isOpen) {
      // Re-initialize form data when dialog opens or initialData changes
      const defaults: UserFormData = {
        name: '', 
        email: '', 
        role: 'USER', 
        status: 'ACTIVE', 
        password: '' 
      };
      if (initialData) {
        setFormData({
          id: initialData.id,
          name: initialData.name ?? '',
          email: initialData.email ?? '',
          role: initialData.role,
          status: initialData.status,
          password: '',
        });
      } else {
        setFormData(defaults);
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setIsSaving(true); // Start loading indicator

    // Basic validation (optional, can be enhanced)
    if (!formData.name || !formData.email) {
      setError('Name and Email are required.');
      setIsSaving(false);
      return;
    }
    if (!isEditing && !formData.password) {
      setError('Password is required for new users.');
      setIsSaving(false);
      return;
    }

    // Prepare data for saving
    const dataToSave: UserFormData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
    };
    if (!isEditing && formData.password) {
      dataToSave.password = formData.password; // Include password only when creating
    }
    if (isEditing && initialData?.id) {
      dataToSave.id = initialData.id; // Include id when editing
    }

    try {
      await onSave(dataToSave); // Call the save function passed via props
      // onClose(); // Keep dialog open on success? Or close? Let parent handle via onSave success.
    } catch (err) {
      // Error is likely handled in the parent component's onSave with toast
      // We might still want to set a local error state if needed
      console.error("Save failed in dialog:", err);
    } finally {
      setIsSaving(false); // Stop loading indicator regardless of success/failure
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the user\'s details and role.' : 'Enter the details for the new user.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Display Error */}
            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-100 border border-red-300 rounded">
                {error}
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name ?? ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email ?? ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange('role', value as UserFormData['role'])}
                required
               >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value as UserFormData['status'])}
                required
               >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Conditional Password Field for Creation */}
            {!isEditing && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="col-span-3"
                  required={!isEditing} // Required only when creating
                  minLength={8} // Basic password length requirement
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
