import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import authOptions
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod schema for validating the request body when updating a provider
// Allow partial updates, so all fields are optional
const AIProviderUpdateSchema = z.object({
  name: z.string().min(1, 'Provider name cannot be empty').optional(),
  apiKeyEnvVarName: z.string().optional().nullable(),
  baseUrl: z.string().url('Invalid URL format').optional().nullable(),
}).partial(); // Makes all fields optional

interface RouteParams {
  params: { providerId: string };
}

// GET handler to fetch a single AI Provider by ID
export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { providerId } = params;

  // Ensure user is an admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    console.warn(`Unauthorized attempt to fetch AI provider ${providerId}:`, session?.user?.email);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const provider = await prisma.aIProvider.findUnique({
      where: { id: providerId },
      include: {
        models: true, // Include associated models
      },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error(`Error fetching AI provider ${providerId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch AI provider' }, { status: 500 });
  }
}

// PUT handler to update an existing AI Provider by ID
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { providerId } = params;

  // Ensure user is an admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    console.warn(`Unauthorized attempt to update AI provider ${providerId}:`, session?.user?.email);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = AIProviderUpdateSchema.parse(body);

    // Check if the provider exists
    const existingProvider = await prisma.aIProvider.findUnique({
      where: { id: providerId },
    });

    if (!existingProvider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // If name is being updated, check for conflicts (excluding the current provider)
    if (validatedData.name && validatedData.name !== existingProvider.name) {
      const conflictProvider = await prisma.aIProvider.findFirst({
        where: {
          name: validatedData.name,
          id: { not: providerId }, // Exclude the current provider ID
        },
      });
      if (conflictProvider) {
        return NextResponse.json({ error: `Provider with name "${validatedData.name}" already exists` }, { status: 409 });
      }
    }

    const updatedProvider = await prisma.aIProvider.update({
      where: { id: providerId },
      data: validatedData, // Only validated fields will be updated
    });

    console.log(`AI Provider "${updatedProvider.name}" (ID: ${providerId}) updated by:`, session.user.email);
    return NextResponse.json(updatedProvider);
  } catch (error) {
    console.error(`Error updating AI provider ${providerId}:`, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update AI provider' }, { status: 500 });
  }
}

// DELETE handler to delete an AI Provider by ID
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { providerId } = params;

  // Ensure user is an admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    console.warn(`Unauthorized attempt to delete AI provider ${providerId}:`, session?.user?.email);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Check if the provider exists before attempting deletion
    const provider = await prisma.aIProvider.findUnique({
        where: { id: providerId },
        include: { models: true } // Check if it has associated models
    });

    if (!provider) {
        return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Optional: Prevent deletion if provider has associated models?
    // Or handle cascading deletes in the schema (current schema uses onDelete: Cascade for AIModel -> AIProvider)
    // Let's assume cascade delete is intended for now.

    await prisma.aIProvider.delete({
      where: { id: providerId },
    });

    console.log(`AI Provider (ID: ${providerId}) deleted by:`, session.user.email);
    return NextResponse.json({ message: 'Provider deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting AI provider ${providerId}:`, error);
    // Handle potential Prisma errors, e.g., foreign key constraints if cascade isn't set up as expected
    return NextResponse.json({ error: 'Failed to delete AI provider' }, { status: 500 });
  }
}
