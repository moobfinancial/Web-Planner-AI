import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
// Ensure correct imports: PrismaClient, Prisma namespace, and specific Enums
import { PrismaClient, Prisma, PromptCategory, PromptStatus } from '@prisma/client';
import type { Prompt } from '@prisma/client'; // Keep model type import if needed
import { z } from 'zod';

const prisma = new PrismaClient();

interface RouteParams {
  params: { promptId: string };
}

// Zod schema for updating a prompt (all fields optional)
const updatePromptSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(PromptCategory).optional(), // Correct: Use directly imported enum
  template: z.string().optional(),
  status: z.nativeEnum(PromptStatus).optional(), // Correct: Use directly imported enum
  modelId: z.string().optional().nullable(), // Allow string, null, or undefined
  variables: z.array(z.string()).optional().nullable(), // Allow array, null, or undefined
}).partial(); // Makes all fields optional

// Define type for validated update data using Zod infer
type UpdatePromptData = z.infer<typeof updatePromptSchema>; // Type inferred from schema

// GET handler to fetch a single prompt by ID
export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { promptId } = params;

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      // Select necessary fields if needed later, otherwise include might not be required
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error(`Error fetching prompt ${promptId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 });
  }
}

// PUT handler to update an existing prompt by ID
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { promptId } = params;

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const json = await request.json();
    console.log("--- PUT /api/admin/prompts/[promptId] ---");
    console.log("Received raw JSON:", JSON.stringify(json, null, 2));

    const validatedData = updatePromptSchema.safeParse(json);

    if (!validatedData.success) {
      console.error("Validation Error:", validatedData.error.flatten());
      return NextResponse.json({ error: 'Invalid input data', details: validatedData.error.flatten().fieldErrors }, { status: 400 });
    }

    const dataToUpdate = validatedData.data as UpdatePromptData;
    console.log("Validated dataToUpdate:", JSON.stringify(dataToUpdate, null, 2));

    // Fetch the current prompt to check for unique constraint if name/category changes
    // Select the fields needed for the check
    const currentPrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { name: true, category: true } // Select only needed fields
    });

    if (!currentPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check for uniqueness if name or category is being changed
    const checkName = dataToUpdate.name ?? currentPrompt.name;
    const checkCategory = dataToUpdate.category ?? currentPrompt.category;

    if (dataToUpdate.name || dataToUpdate.category) {
      // Use findFirst with explicit fields for uniqueness check
      const existingPrompt = await prisma.prompt.findFirst({
        where: {
          category: checkCategory,
          name: checkName,
          id: { not: promptId } // Exclude the current prompt itself
        },
      });
      if (existingPrompt) {
        return NextResponse.json({ error: `A prompt with the name "${checkName}" already exists in the "${checkCategory}" category.` }, { status: 409 });
      }
    }

    // Prepare the data payload carefully for Prisma update, ensuring correct types
    const updatePayload: Prisma.PromptUpdateInput = {}; // Correct: Use Prisma namespace for the type
    if (dataToUpdate.name !== undefined) updatePayload.name = dataToUpdate.name;
    if (dataToUpdate.description !== undefined) updatePayload.description = dataToUpdate.description;
    if (dataToUpdate.category !== undefined) updatePayload.category = dataToUpdate.category;
    if (dataToUpdate.template !== undefined) updatePayload.template = dataToUpdate.template;
    if (dataToUpdate.status !== undefined) updatePayload.status = dataToUpdate.status;
    // Handle modelId carefully: allow setting to null or undefined
    // Prisma handles undefined as 'do not update', and null as 'set to null'
    if ('modelId' in dataToUpdate) { // Check if the key exists, even if value is null/undefined
        updatePayload.modelId = dataToUpdate.modelId === "" || dataToUpdate.modelId === undefined ? null : dataToUpdate.modelId;
    }

    // Handle variables: Use JsonNull if array is null, undefined, or empty
    if (dataToUpdate.variables !== undefined) {
        const safeVariables = Array.isArray(dataToUpdate.variables) ? dataToUpdate.variables : [];
        updatePayload.variables = safeVariables.length > 0 ? safeVariables : Prisma.DbNull; // Correct: Use Prisma.DbNull
    }

    // Check if there's anything actually to update
    if (Object.keys(updatePayload).length === 0) {
      console.log("No fields to update.");
      return NextResponse.json(currentPrompt); // Or return 204 status
    }

    console.log("Prisma updatePayload:", JSON.stringify(updatePayload, null, 2));

    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: updatePayload,
      include: { // Include related model and its provider in the response
        model: {
          include: {
            provider: true,
          }
        }
      },
    });

    console.log(`Prompt "${updatedPrompt.name}" (ID: ${promptId}) updated successfully by:`, session.user.email);
    return NextResponse.json(updatedPrompt);

  } catch (error: any) {
    console.error(`--- ERROR updating prompt ${promptId}: ---`, error);
    // Log specific Prisma error details if available
    if (error instanceof Prisma.PrismaClientKnownRequestError) { // Correct: Use Prisma namespace for the error class
      console.error("Prisma Error Code:", error.code);
      console.error("Prisma Error Meta:", error.meta);
      console.error("Prisma Error Message:", error.message);
      if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
      }
      // Handle other potential Prisma errors like unique constraints if needed
      if (error.code === 'P2002') {
         // This should be caught by the check above, but handle just in case
         return NextResponse.json({ error: 'Update violates unique constraint (name/category)' }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}

// DELETE handler to delete a prompt by ID
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { promptId } = params;

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Check if prompt exists before deleting
    const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    await prisma.prompt.delete({
      where: { id: promptId },
    });

    console.log(`Prompt "${prompt.name}" (ID: ${promptId}) deleted by:`, session.user.email);
    return NextResponse.json({ message: 'Prompt deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting prompt ${promptId}:`, error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}
