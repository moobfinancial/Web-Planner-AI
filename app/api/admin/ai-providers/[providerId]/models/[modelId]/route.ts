import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import authOptions
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod schema for validating the request body when updating an AI model
// Allow partial updates
const AIModelUpdateSchema = z.object({
  modelName: z.string().min(1, 'Model name cannot be empty').optional(),
  description: z.string().optional().nullable(),
  inputCost: z.number().optional().nullable(),
  outputCost: z.number().optional().nullable(),
  contextWindow: z.number().int().positive().optional().nullable(),
}).partial(); // Makes all fields optional

interface RouteParams {
  params: { providerId: string; modelId: string };
}

// GET handler to fetch a single AI Model by ID
export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { providerId, modelId } = params;

  // Ensure user is an admin
  if (session?.user?.role !== 'ADMIN') {
    console.warn(`Unauthorized attempt to fetch model ${modelId} for provider ${providerId}:`, session?.user?.email);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const model = await prisma.aIModel.findUnique({
      where: {
        id: modelId,
        providerId: providerId, // Ensure model belongs to the correct provider
      },
    });

    if (!model) {
      return NextResponse.json({ error: 'Model not found for this provider' }, { status: 404 });
    }

    return NextResponse.json(model);
  } catch (error) {
    console.error(`Error fetching model ${modelId} for provider ${providerId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 });
  }
}

// PUT handler to update an existing AI Model by ID
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { providerId, modelId } = params;

  // Ensure user is an admin
  if (session?.user?.role !== 'ADMIN') {
    console.warn(`Unauthorized attempt to update model ${modelId} for provider ${providerId}:`, session?.user?.email);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = AIModelUpdateSchema.parse(body);

    // Check if the model exists for the given provider
    const existingModel = await prisma.aIModel.findUnique({
      where: {
        id: modelId,
        providerId: providerId,
      },
    });

    if (!existingModel) {
      return NextResponse.json({ error: 'Model not found for this provider' }, { status: 404 });
    }

    // If modelName is being updated, check for conflicts within the same provider
    if (validatedData.modelName && validatedData.modelName !== existingModel.modelName) {
      const conflictModel = await prisma.aIModel.findFirst({
        where: {
          providerId: providerId,
          modelName: validatedData.modelName,
          id: { not: modelId }, // Exclude the current model ID
        },
      });
      if (conflictModel) {
        return NextResponse.json({ error: `Model "${validatedData.modelName}" already exists for this provider` }, { status: 409 });
      }
    }

    const updatedModel = await prisma.aIModel.update({
      where: {
        id: modelId,
        // providerId: providerId // Technically redundant due to primary key lookup but good for clarity?
      },
      data: validatedData,
    });

    console.log(`AI Model "${updatedModel.modelName}" (ID: ${modelId}) updated for provider ${providerId} by:`, session.user.email);
    return NextResponse.json(updatedModel);
  } catch (error) {
    console.error(`Error updating model ${modelId} for provider ${providerId}:`, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update model' }, { status: 500 });
  }
}

// DELETE handler to delete an AI Model by ID
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { providerId, modelId } = params;

  // Ensure user is an admin
  if (session?.user?.role !== 'ADMIN') {
    console.warn(`Unauthorized attempt to delete model ${modelId} for provider ${providerId}:`, session?.user?.email);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Check if the model exists for the given provider before deleting
    const model = await prisma.aIModel.findUnique({
        where: { 
            id: modelId,
            providerId: providerId,
        }
    });

    if (!model) {
        return NextResponse.json({ error: 'Model not found for this provider' }, { status: 404 });
    }

    // Consider implications: If a Prompt uses this model as default, the relation will be set to null (onDelete: SetNull)
    await prisma.aIModel.delete({
      where: {
        id: modelId,
        // providerId: providerId // Redundant again
      },
    });

    console.log(`AI Model (ID: ${modelId}) deleted for provider ${providerId} by:`, session.user.email);
    return NextResponse.json({ message: 'Model deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting model ${modelId} for provider ${providerId}:`, error);
    // Handle potential Prisma errors
    return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 });
  }
}
