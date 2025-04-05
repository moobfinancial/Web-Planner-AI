import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/client';
import { generateImplementationPrompts } from '@/lib/ai-service';
import { PlanContent, ImplementationPrompts } from '@/lib/types';

// Define Params type for route segment parameter
interface RouteParams {
  params: {
    id: string; // This is the Project ID
  };
}

export async function GET(request: Request, { params }: RouteParams) { // Destructure params
  const session = await getServerSession(authOptions);
  const projectId = params.id; // Use projectId

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
  }

  try {
    console.log(`Fetching prompts for project ${projectId}, user ${session.user.id}`);

    // 1. Fetch the project for ownership check
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Basic authorization check
    if (project.userId !== session.user.id) {
      // TODO: Add sharing checks later if needed
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch the latest plan version for this project
    const latestPlan = await prisma.plan.findFirst({
      where: { projectId: projectId },
      orderBy: { versionNumber: 'desc' },
    });

    if (!latestPlan) {
      return NextResponse.json({ message: 'No plan versions found for this project' }, { status: 400 });
    }

    // 3. Check if prompts already exist on the latest plan version (simple cache)
    if (latestPlan.prompts) {
      console.log(`Returning cached prompts for project ${projectId}, version ${latestPlan.versionNumber}`);
      // Ensure prompts are returned as an object if stored as JSON
      const promptsData = typeof latestPlan.prompts === 'string'
        ? JSON.parse(latestPlan.prompts)
        : latestPlan.prompts;
      return NextResponse.json(promptsData as ImplementationPrompts, { status: 200 });
    }

    // 4. If not cached, parse plan content and generate prompts
    let planContentParsed: PlanContent;
    try {
        if (typeof latestPlan.planContent === 'string') {
            planContentParsed = JSON.parse(latestPlan.planContent);
             if (typeof planContentParsed?.planText !== 'string') {
                 throw new Error("Parsed plan content missing 'planText'.");
             }
        } else {
            throw new Error("Latest plan content is not a string.");
        }
    } catch (parseError) {
        console.error(`Error parsing plan content for project ${projectId}, version ${latestPlan.versionNumber}:`, parseError);
        return NextResponse.json({ message: 'Failed to parse plan content for prompt generation.' }, { status: 500 });
    }


    console.log(`Generating new prompts for project ${projectId}, version ${latestPlan.versionNumber}`);
    const generatedPrompts: ImplementationPrompts | null = await generateImplementationPrompts(planContentParsed.planText);

    if (!generatedPrompts) {
        console.error(`Failed to generate prompts for project ${projectId}`);
        return NextResponse.json({ message: 'AI prompt generation failed. Please try again.' }, { status: 500 });
    }

    // 5. Save generated prompts back to the Plan record
    await prisma.plan.update({
        where: { id: latestPlan.id }, // Update the specific Plan record
        data: { prompts: generatedPrompts as any }, // Store prompts (Prisma handles JSON conversion)
    });
    console.log(`Saved generated prompts for project ${projectId}, version ${latestPlan.versionNumber}`);

    return NextResponse.json(generatedPrompts, { status: 200 });

  } catch (error) {
    console.error(`Error fetching prompts for project ${projectId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: 'Failed to fetch prompts', error: errorMessage }, { status: 500 });
  }
}
