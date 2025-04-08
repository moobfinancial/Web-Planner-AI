import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; // Use the centralized auth options
// Import enums directly, and Prisma namespace for JsonNull
import { PrismaClient, PromptStatus, PromptCategory, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// GET handler to fetch all prompts (optionally filtered)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  // Cast directly using the imported enums
  const category = searchParams.get('category') as PromptCategory | null;
  const status = searchParams.get('status') as PromptStatus | null;
  const includeArchived = searchParams.get('includeArchived') === 'true'; // Keep as boolean

  try {
    // Use the imported enum for the default status
    let whereClause: Prisma.PromptWhereInput = { status: PromptStatus.ACTIVE };
    // Correctly use the boolean flag
    if (includeArchived) {
      // If includeArchived is true, fetch all prompts (ACTIVE and ARCHIVED)
      whereClause = {}; // Remove status filter
    } else if (status) {
      // If a specific status is provided (and not includeArchived)
      whereClause = { status: status }; // Use the status variable
    }

    const prompts = await prisma.prompt.findMany({
      where: {
        ...(category && { category: category as PromptCategory }), // Cast category string to enum type
        ...whereClause, // Apply the determined status filter
      },
      include: { // Include related model and its provider
        model: {
          include: {
            provider: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc', // Order by creation time or name
      },
    });
    return NextResponse.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

// POST handler to create a new prompt
export async function POST(request: Request) {
  // Define schema inside the handler
  const createPromptSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().nullable(), // Allow null
    category: z.nativeEnum(PromptCategory), // Use imported enum
    template: z.string().min(1, "Template is required"), // Keep required
    // Ensure variables is an array of strings, and default to empty array if missing
    variables: z.array(z.string()).optional().default([]),
    status: z.nativeEnum(PromptStatus).optional().default(PromptStatus.ACTIVE), // Use imported enum
    modelId: z.string().cuid().optional().nullable(), // Allow null or valid CUID
  });

  // Define type inside the handler
  type CreatePromptData = z.infer<typeof createPromptSchema>;

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const json = await request.json();
    const validatedData = createPromptSchema.safeParse(json);

    if (!validatedData.success) {
      console.error("Prompt creation validation failed:", validatedData.error.errors);
      return NextResponse.json({ error: 'Invalid input data', details: validatedData.error.flatten().fieldErrors }, { status: 400 });
    }

    // Explicitly type the validated data using the inferred type
    const { name, category, description, template, variables, status, modelId: rawModelId } = validatedData.data as CreatePromptData;

    // Ensure modelId is explicitly null if empty string or null is passed
    const modelId: string | null = rawModelId === "" || rawModelId === null ? null : rawModelId;
    // Use nullish coalescing for safety, although Zod should handle defaults/optionals
    const safeDescription = description ?? null;
    const safeVariables = variables ?? []; // Zod's .default([]) covers undefined, ?? [] covers null

    // Check for existing prompt with the same name and category (using findFirst for efficiency)
    const existingPrompt = await prisma.prompt.findFirst({
      where: {
        name: name,
        category: category, // Filter by category directly in the query
      },
      select: { id: true } // Only need to know if it exists
    });

    if (existingPrompt) {
      return NextResponse.json({ error: `A prompt with the name "${name}" already exists in the "${category}" category.` }, { status: 409 }); // Conflict
    }

    const newPrompt = await prisma.prompt.create({
      data: {
        name,
        category,
        description: safeDescription, // Use safe version
        template,
        // Use Prisma.JsonNull if the array is empty
        variables: safeVariables.length > 0 ? safeVariables : Prisma.JsonNull, // Use safe version
        status,
        modelId: modelId,
      },
    });

    console.log(`Prompt "${newPrompt.name}" created by:`, session.user.email);
    return NextResponse.json(newPrompt, { status: 201 });

  } catch (error: any) {
    console.error("Error creating prompt:", error);
    // Keep specific P2002 check if needed, although findFirst check should prevent it
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // This might indicate a race condition if the findFirst check didn't catch it
      return NextResponse.json({ error: 'A prompt with this name was created just now in this category.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}
