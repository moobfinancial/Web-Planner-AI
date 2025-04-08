import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import authOptions
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod schema for validating the request body when creating an AI model
const AIModelSchema = z.object({
  modelName: z.string().min(1, 'Model name is required'),
  description: z.string().optional().nullable(),
  inputCost: z.number().optional().nullable(),
  outputCost: z.number().optional().nullable(),
  contextWindow: z.number().int().positive().optional().nullable(),
});

interface RouteParams {
  params: { providerId: string };
}

// GET handler to fetch all AI Models for a specific Provider
export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { providerId } = params;

  // Ensure user is an admin
  if (session?.user?.role !== 'ADMIN') {
    console.warn(`Unauthorized attempt to fetch models for provider ${providerId}:`, session?.user?.email);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Check if the provider exists
    const providerExists = await prisma.aIProvider.findUnique({
      where: { id: providerId },
      select: { id: true }, // Only select id for existence check
    });

    if (!providerExists) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const models = await prisma.aIModel.findMany({
      where: {
        providerId: providerId,
      },
      orderBy: {
        modelName: 'asc',
      },
    });
    return NextResponse.json(models);
  } catch (error) {
    console.error(`Error fetching models for provider ${providerId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}

// POST handler to create a new AI Model for a specific Provider
export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { providerId } = params;

  // Ensure user is an admin
  if (session?.user?.role !== 'ADMIN') {
    console.warn(`Unauthorized attempt to create model for provider ${providerId}:`, session?.user?.email);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = AIModelSchema.parse(body);

    // Check if the provider exists
    const providerExists = await prisma.aIProvider.findUnique({
      where: { id: providerId },
      select: { id: true },
    });

    if (!providerExists) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Check if model with the same name already exists for this provider
    const existingModel = await prisma.aIModel.findUnique({
      where: {
        providerId_modelName: {
          providerId: providerId,
          modelName: validatedData.modelName,
        },
      },
    });

    if (existingModel) {
      return NextResponse.json({ error: `Model "${validatedData.modelName}" already exists for this provider` }, { status: 409 });
    }

    const newModel = await prisma.aIModel.create({
      data: {
        ...validatedData,
        providerId: providerId, // Associate with the correct provider
      },
    });

    console.log(`AI Model "${newModel.modelName}" created for provider ${providerId} by:`, session.user.email);
    return NextResponse.json(newModel, { status: 201 });
  } catch (error) {
    console.error(`Error creating model for provider ${providerId}:`, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 });
  }
}
