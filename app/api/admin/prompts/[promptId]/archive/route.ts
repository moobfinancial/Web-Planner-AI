// app/api/admin/prompts/[promptId]/archive/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed
import { PrismaClient, PromptStatus, Role } from '@prisma/client'; // Import Role

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { promptId: string } }
) {
  const session = await getServerSession(authOptions);

  // 1. Authorization Check
  if (!session?.user || session.user.role !== Role.ADMIN) { // Use Role.ADMIN
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const promptId = params.promptId;

  if (!promptId) {
    return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
  }

  try {
    // 2. Find the current prompt
    const currentPrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });

    if (!currentPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // 3. Determine the new status (Toggle)
    const newStatus =
      currentPrompt.status === PromptStatus.ARCHIVED
        ? PromptStatus.ACTIVE // Unarchive goes back to Active
        : PromptStatus.ARCHIVED; // Archive Active or Draft prompts

    // 4. Update the prompt status
    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        status: newStatus,
      },
       include: { model: true }, // Include related model for consistency
    });

    console.log(`Prompt ${promptId} status changed to ${newStatus} by user ${session.user.id}`);
    return NextResponse.json(updatedPrompt, { status: 200 });

  } catch (error) {
    console.error(`Error updating prompt ${promptId} status:`, error);
    // Log Prisma-specific errors if needed
    if (error instanceof Error && 'code' in error) {
         // Handle known Prisma error codes if necessary
         console.error('Prisma Error Code:', (error as any).code);
    }
    return NextResponse.json({ error: 'Failed to update prompt status' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
