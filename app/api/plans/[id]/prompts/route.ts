import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/client';
import { generateImplementationPrompts } from '@/lib/ai-service';
import { PlanContent, ImplementationPrompts } from '@/lib/types';
import { Plan } from '@prisma/client';

// Define Params type for route segment parameter
interface RouteParams {
  params: {
    id: string; // This is the Project ID
  };
}

// Use NextRequest for accessing URL search params
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const projectId = params.id;
  const url = request.nextUrl; // Get the URL object
  const versionId = url.searchParams.get('versionId'); // Get versionId from query params

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
  }

  try {
    console.log(`Fetching prompts for project ${projectId}, user ${session.user.id}${versionId ? ', version ' + versionId : ', latest version'}`);

    // 1. Fetch the project for ownership check (always needed)
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

    // 2. Fetch the specific plan version if versionId is provided, otherwise fetch the latest
    let targetPlan: Plan | null = null;

    if (versionId) {
      targetPlan = await prisma.plan.findFirst({
        where: {
          id: versionId,
          projectId: projectId, // Ensure the version belongs to the project
        },
        select: { // Select only necessary fields
          id: true,
          prompts: true,
          planContent: true,
          versionNumber: true, // For logging
          oneShotPrompt: true // ** ADDED: Fetch oneShotPrompt **
        }
      });
      if (!targetPlan) {
        return NextResponse.json({ message: `Plan version ${versionId} not found for this project` }, { status: 404 });
      }
      console.log(`Found specific plan version ${versionId} for project ${projectId}`);
    } else {
      targetPlan = await prisma.plan.findFirst({
        where: { projectId: projectId },
        orderBy: { versionNumber: 'desc' },
        select: { // Select only necessary fields
          id: true,
          prompts: true,
          planContent: true,
          versionNumber: true, // For logging
          oneShotPrompt: true // ** ADDED: Fetch oneShotPrompt **
        }
      });
      if (!targetPlan) {
        return NextResponse.json({ message: 'No plan versions found for this project' }, { status: 400 });
      }
      console.log(`Found latest plan version ${targetPlan.id} (v${targetPlan.versionNumber}) for project ${projectId}`);
    }

    // 3. Check if prompts already exist on the target plan version (simple cache)
    let promptsData: ImplementationPrompts = {}; // Initialize as empty object
    let finalPrompts: ImplementationPrompts & { __oneShotPrompt__?: string | null } = {}; // Type for combined response

    if (targetPlan.prompts) {
      console.log(`Returning cached prompts for project ${projectId}, version ${targetPlan.id}`);
      // Ensure prompts are returned as an object if stored as JSON
      promptsData = typeof targetPlan.prompts === 'string'
        ? JSON.parse(targetPlan.prompts)
        : (targetPlan.prompts as ImplementationPrompts || {}); // Handle null/undefined prompts gracefully
      
      finalPrompts = { ...promptsData }; // Copy categorized prompts
      
    } else {
      console.log(`Generating new prompts for project ${projectId}, version ${targetPlan.id}`);
      // 4. If not cached, parse plan content and generate prompts
      let planContentParsed: PlanContent;
      try {
        if (typeof targetPlan.planContent === 'string') {
          planContentParsed = JSON.parse(targetPlan.planContent);
          if (typeof planContentParsed?.planText !== 'string') {
            throw new Error("Parsed plan content missing 'planText'.");
          }
        } else {
          throw new Error("Target plan content is not a string."); // Updated error message
        }
      } catch (parseError) {
        console.error(`Error parsing plan content for project ${projectId}, version ${targetPlan.id}:`, parseError);
        return NextResponse.json({ message: 'Failed to parse plan content for prompt generation.' }, { status: 500 });
      }

      console.log(`Generating new prompts for project ${projectId}, version ${targetPlan.id}`);
      const generatedPrompts: ImplementationPrompts | null = await generateImplementationPrompts(planContentParsed.planText);

      if (!generatedPrompts) {
        console.error(`Failed to generate prompts for project ${projectId}, version ${targetPlan.id}`);
        return NextResponse.json({ message: 'AI prompt generation failed. Please try again.' }, { status: 500 });
      }

      promptsData = generatedPrompts; // Store generated categorized prompts
      finalPrompts = { ...promptsData }; // Copy categorized prompts

      // 5. Save generated prompts back to the Plan record
      await prisma.plan.update({
        where: { id: targetPlan.id }, // Update the specific Plan record
        // Only save the categorized prompts, not the combined object with one-shot
        data: { prompts: promptsData as any }, 
      });
      console.log(`Saved generated categorized prompts for project ${projectId}, version ${targetPlan.id}`);
    }
    
    // ** ADDED: Include oneShotPrompt in the response **
    if (targetPlan.oneShotPrompt) {
      finalPrompts.__oneShotPrompt__ = targetPlan.oneShotPrompt;
    }

    return NextResponse.json(finalPrompts, { status: 200 });

  } catch (error) {
    console.error(`Error fetching/generating prompts for project ${projectId}${versionId ? ' version ' + versionId : ''}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: 'Failed to fetch prompts', error: errorMessage }, { status: 500 });
  }
}
