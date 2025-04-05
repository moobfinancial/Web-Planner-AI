import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/client';
import { ProjectStatus } from '@prisma/client'; // Import the enum

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { id: projectId } = params;

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
  }

  let newStatus: ProjectStatus;
  try {
    const body = await request.json();
    newStatus = body.status;
    // Basic validation: Check if the provided status is a valid ProjectStatus enum value
    if (!Object.values(ProjectStatus).includes(newStatus)) {
        return NextResponse.json({ message: 'Invalid status value provided' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  try {
    // 1. Verify ownership (and that project exists)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true, projectName: true },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      // Optional: Allow admins? For now, only owners.
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // 2. Update the project status
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: newStatus,
      },
    });

    // 3. Log the status change activity *after* successful update
    await prisma.activity.create({
      data: {
        type: 'PROJECT_STATUS_CHANGED',
        userId: session.user.id,
        projectId: projectId,
        metadata: {
          projectName: project.projectName,
          newStatus: newStatus,
        }
      }
    });

    console.log(`Project ${projectId} status updated to ${newStatus} by user ${session.user.id}.`);
    return NextResponse.json(updatedProject);

  } catch (error) {
    console.error(`Error updating status for project ${projectId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    // Avoid Prisma error codes in user-facing messages if possible
    let statusCode = 500;
    if ((error as any)?.code === 'P2025') { // Prisma code for record not found during update
        statusCode = 404;
        errorMessage = 'Project not found during status update attempt.';
    }

    return NextResponse.json({ message: 'Failed to update project status', error: errorMessage }, { status: statusCode });
  }
}
