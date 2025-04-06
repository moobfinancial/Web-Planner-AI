import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/client';
import { z } from 'zod';

interface RouteParams {
  params: { id: string };
}

// Define a schema for validating the PATCH request body
const projectUpdateSchema = z.object({
  projectName: z.string().min(1, "Project name cannot be empty.").optional(),
  projectDescription: z.string().optional(),
  codeEditor: z.string().optional(),
  targetAudience: z.string().optional(),
  keyGoals: z.string().optional(),
  // Add other editable fields from the Project model here if needed
});

// --- GET Handler: Fetch single project details ---
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;
    if (!projectId) {
      return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { 
        id: projectId,
        userId: session.user.id, // Ensure ownership
      },
      // Select all relevant fields you might want to display/edit
       include: { 
           plans: { 
               orderBy: { versionNumber: 'desc' },
               take: 1 // Optionally include latest plan version info
           }
       }
    });

    if (!project) {
      // Differentiate between not found and forbidden?
      // For simplicity, returning 404 if not found under the user's ownership.
      return NextResponse.json({ message: "Project not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });

  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// --- PATCH Handler: Update project details ---
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;
    if (!projectId) {
      return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }

    let updateData: z.infer<typeof projectUpdateSchema>;
    try {
      const body = await req.json();
      updateData = projectUpdateSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
         return NextResponse.json({ message: "Invalid request body", errors: error.errors }, { status: 400 });
      }
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    // 1. Verify ownership before updating
    const project = await prisma.project.findUnique({
      where: { 
        id: projectId,
        userId: session.user.id 
      },
      select: { id: true, projectName: true } // Select minimal fields needed
    });

    if (!project) {
      return NextResponse.json({ message: "Project not found or access denied" }, { status: 404 });
    }

    // 2. Update the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData, // Pass validated update data
    });

    // 3. Log the activity
    await prisma.activity.create({
      data: {
        type: "PROJECT_DETAILS_UPDATED",
        userId: session.user.id,
        projectId: projectId,
        metadata: { 
          projectName: updatedProject.projectName, // Log the possibly new name
          updatedFields: Object.keys(updateData) // Log which fields were updated
        }
      }
    });

    console.log(`Project ${projectId} details updated by user ${session.user.id}`);
    return NextResponse.json(updatedProject, { status: 200 });

  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// --- DELETE Handler ---
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { id: projectId } = params;

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
  }

  try {
    // 1. Verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true, projectName: true },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      // Optional: Allow admins to delete? For now, only owners.
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // 3. Log the delete activity *before* deleting
    await prisma.activity.create({
      data: {
        type: 'PROJECT_DELETED',
        userId: session.user.id,
        projectId: projectId,
        metadata: { projectName: project.projectName }, // Store project name for context
      },
    });

    // 2. Delete the project (cascades should handle related data based on schema)
    await prisma.project.delete({
      where: { id: projectId },
    });

    console.log(`Project ${projectId} deleted successfully by user ${session.user.id}.`);
    // Return 204 No Content which is standard for successful DELETE with no body
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error(`Error deleting project ${projectId}:`, error);
    let errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    // Avoid Prisma error codes in user-facing messages if possible
    let statusCode = 500;
    if ((error as any)?.code === 'P2025') { // Prisma code for record not found during delete
        statusCode = 404;
        errorMessage = 'Project not found during deletion attempt.';
    }

    return NextResponse.json({ message: 'Failed to delete project', error: errorMessage }, { status: statusCode });
  }
}
