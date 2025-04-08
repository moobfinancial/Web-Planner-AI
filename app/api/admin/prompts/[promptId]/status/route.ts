import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { PrismaClient, PromptStatus } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

interface RouteParams {
  params: { promptId: string };
}

// Zod schema for validating the status update request body
const updateStatusSchema = z.object({
  status: z.nativeEnum(PromptStatus), // Expecting either ACTIVE or ARCHIVED
});

// PATCH handler to update the status of a specific prompt
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { promptId } = params;

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const json = await request.json();
    const validatedData = updateStatusSchema.safeParse(json);

    if (!validatedData.success) {
      console.error("Invalid status update data:", validatedData.error.errors);
      return NextResponse.json({ error: 'Invalid input data', details: validatedData.error.errors }, { status: 400 });
    }

    const { status } = validatedData.data;

    // Check if prompt exists before attempting update
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { id: true, name: true } // Select minimal fields for check
    });

    if (!existingPrompt) {
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Update the prompt status
    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        status: status,
      },
    });

    const actionVerb = status === PromptStatus.ARCHIVED ? 'archived' : 'activated';
    console.log(`Prompt "${existingPrompt.name}" (ID: ${promptId}) status updated to ${status} by: ${session.user.email}`);
    return NextResponse.json(updatedPrompt);

  } catch (error: any) {
    console.error(`Error updating status for prompt ${promptId}:`, error);
    // Handle potential Prisma errors if needed (e.g., P2025 Record not found, though checked above)
    return NextResponse.json({ error: 'Failed to update prompt status' }, { status: 500 });
  }
}
