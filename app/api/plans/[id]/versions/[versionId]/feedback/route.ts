import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/client';
import { z } from 'zod';

// Define the expected request body schema
const feedbackSchema = z.object({
  sectionIdentifier: z.string().min(1, "Section identifier is required."),
  originalText: z.string().min(1, "Original text is required."),
  userComment: z.string().min(1, "Feedback comment is required.").max(1000, "Comment must be 1000 characters or less."),
});

// Define the expected route parameters structure
interface RouteParams {
  params: {
    id: string;         // Renamed from projectId
    versionId: string;  // Renamed from planId
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { id: projectId, versionId: planId } = params; // Destructure with renaming

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!projectId || !planId) {
    // Updated error message to reflect parameter names used in the code
    return NextResponse.json({ message: 'Project ID (id) and Plan Version ID (versionId) are required in the URL' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = feedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.errors }, { status: 400 });
    }

    const { sectionIdentifier, originalText, userComment } = validation.data;

    // Verify the plan exists by its unique ID
    const plan = await prisma.plan.findUnique({
      where: {
        id: planId,
      },
    });

    // Check if the plan was found and if it belongs to the correct project
    if (!plan || plan.projectId !== projectId) {
      return NextResponse.json({ message: 'Plan version not found or does not belong to the specified project' }, { status: 404 });
    }

    // Create the feedback record
    const newFeedback = await prisma.feedback.create({
      data: {
        sectionIdentifier: sectionIdentifier,
        originalText: originalText,
        userComment: userComment,
        projectId: projectId, // Link to the overall project using the 'id' parameter
        planId: planId,       // Link to the specific plan version using the 'versionId' parameter
        userId: session.user.id,
      },
    });

    console.log(`Feedback created successfully for plan ${planId}, section ${sectionIdentifier} by user ${session.user.id}`);

    return NextResponse.json(newFeedback, { status: 201 });

  } catch (error) {
    console.error('Error creating feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: 'Failed to save feedback', error: errorMessage }, { status: 500 });
  }
}
