import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'; 
import { prisma } from '@/prisma/client'; 
import { v2 as cloudinary } from 'cloudinary';
import type { Session } from 'next-auth'; 

// Configure Cloudinary 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    let session: Session | null = null; 

    try {
        session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const formData = await req.formData();
        const file = formData.get("profileImage") as File | null;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        // Validate file type and size (optional but recommended)
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            return NextResponse.json({ message: "File size exceeds 5MB limit" }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResult = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "webplanner_profiles", // Optional: organize uploads
                    public_id: `user_${userId}_profile`, // Use user ID for a unique, stable public_id
                    overwrite: true,
                    format: 'jpg', // Force format for consistency
                    transformation: [
                        { width: 200, height: 200, crop: "fill", gravity: "face" }, // Resize and crop
                    ]
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        const imageUrl = uploadResult.secure_url;

        // Update user profile in database
        await prisma.user.update({
            where: { id: userId },
            data: { image: imageUrl },
        });

        // Log activity directly using prisma
        try {
          await prisma.activity.create({
            data: {
              type: 'PROFILE_IMAGE_UPDATED', // Define a specific type
              userId: userId,
              metadata: { 
                newImageUrl: imageUrl // Log relevant info
              }
            }
          });
          console.log(`Activity logged: User ${userId} updated profile image.`);
        } catch (logError) {
           console.error("Failed to log profile image update activity:", logError);
        }

        console.log(`User ${userId} updated profile image to: ${imageUrl}`);

        return NextResponse.json({ message: "Profile image updated successfully", imageUrl });

    } catch (error: any) {
        console.error("Error uploading profile image:", error);
        // Log error activity directly using prisma
        try {
            const userIdForErrorLog = session?.user?.id || 'unknown'; // Attempt to get userId
            await prisma.activity.create({
                data: {
                    type: 'PROFILE_IMAGE_UPDATE_ERROR',
                    userId: userIdForErrorLog,
                    metadata: { 
                        errorMessage: error.message,
                    }
                }
            });
             console.error(`Activity logged: Error updating profile image for user ${userIdForErrorLog}.`);
        } catch (logError) {
            console.error("Failed to log profile image update ERROR activity:", logError);
        }
        return NextResponse.json({ message: "Error uploading profile image", error: error.message }, { status: 500 });
    }
}
