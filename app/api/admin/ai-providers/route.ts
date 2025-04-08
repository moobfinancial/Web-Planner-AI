import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import authOptions
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod schema for validating the request body when creating a provider
const AIProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  apiKeyEnvVarName: z.string().optional().nullable(), // Optional: Name of the env var for the API key
  baseUrl: z.string().url('Invalid URL format').optional().nullable(), // Optional: Base URL for the provider's API
});

// GET handler to fetch all AI Providers
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Ensure user is an admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    console.warn('Unauthorized attempt to fetch AI providers:', session?.user?.email);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const providers = await prisma.aIProvider.findMany({
      include: {
        models: true, // Include associated models
      },
      orderBy: {
        name: 'asc', // Order alphabetically by name
      },
    });
    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching AI providers:', error);
    return NextResponse.json({ error: 'Failed to fetch AI providers' }, { status: 500 });
  }
}

// POST handler to create a new AI Provider
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Ensure user is an admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    console.warn('Unauthorized attempt to create AI provider:', session?.user?.email);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = AIProviderSchema.parse(body);

    // Check if provider with the same name already exists
    const existingProvider = await prisma.aIProvider.findUnique({
      where: { name: validatedData.name },
    });

    if (existingProvider) {
      return NextResponse.json({ error: `Provider with name "${validatedData.name}" already exists` }, { status: 409 }); // 409 Conflict
    }

    const newProvider = await prisma.aIProvider.create({
      data: {
        name: validatedData.name,
        apiKeyEnvVarName: validatedData.apiKeyEnvVarName,
        baseUrl: validatedData.baseUrl,
      },
    });

    console.log(`AI Provider "${newProvider.name}" created by:`, session.user.email);
    return NextResponse.json(newProvider, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error creating AI provider:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create AI provider' }, { status: 500 });
  }
}
