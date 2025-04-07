import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma'; // Standardized import path
// Import both AI functions needed
import { generateOneShotPrompt_new, refineOneShotPrompt } from '@/lib/ai-service';
import { Plan, Project } from '@prisma/client'; // Import Prisma types
import { ResearchData, ImplementationPrompts } from '@/lib/types'; // Import custom JSON types from lib/types
import { revalidateDashboardPaths } from '@/app/actions/revalidation'; // Import revalidation function

interface RouteParams {
  params: {
    id: string; // This is the Project ID
  };
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  // Extract codeEditor preference from query params if provided, otherwise default or fetch later
  const url = new URL(request.url);
  const preferredCodeEditor = url.searchParams.get('codeEditor') || 'vscode'; // Default to vscode or fetch from project

  const session = await getServerSession(authOptions);
  const projectId = params.id;

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
  }

  try {
    // 1. Fetch the Project details first (including codeEditor preference)
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            userId: true,
            codeEditor: true, // Fetch preferred code editor
            // Add other fields needed for context if necessary
        }
    });

    if (!project) {
        return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Basic authorization check
    if (project.userId !== session.user.id) {
      // TODO: Add check for shared plans/permissions later
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Determine the code editor to use
    const codeEditor = project.codeEditor || preferredCodeEditor; // Use project setting or default/query param

    // 2. Fetch the latest plan version for this project, including fields needed for generation
    const latestPlan = await prisma.plan.findFirst({
      where: { projectId: projectId },
      orderBy: { versionNumber: 'desc' },
      // Explicitly select fields needed, including the problematic one
      select: {
        id: true,
        planContent: true,
        researchData: true,
        prompts: true,
        // oneShotPrompt: true, // Removed from select to bypass persistent TS error
        // Add other Plan fields if needed by generateOneShotPrompt_new
        projectId: true, // Needed for context potentially
        versionNumber: true, // Good for logging/context
        // Select necessary project fields directly if not passing the whole plan object
        // project: { select: { codeEditor: true } } // Example if needed separately
      },
    });

    if (!latestPlan) {
      //   id: true,
      //   planContent: true,
      //   researchData: true,
      //   prompts: true,
      //   oneShotPrompt: true, // Fetch existing prompt
      //   // Add other Plan fields if needed by generateOneShotPrompt_new
      return NextResponse.json({ message: 'No plan versions found for this project' }, { status: 400 });
    }

    // 3. Return the One-Shot Prompt if it already exists
    // Workaround: Use type assertion 'as any' due to persistent type errors
    if ((latestPlan as any).oneShotPrompt) {
      console.log(`Returning existing One-Shot Prompt for plan ${latestPlan.id}`);
      return NextResponse.json({ oneShotPrompt: (latestPlan as any).oneShotPrompt }, { status: 200 });
    }

    // 4. If it doesn't exist, generate it
    console.log(`Generating new One-Shot Prompt for plan ${latestPlan.id}`);

    // Prepare data for the generation function
    // TODO: Define how databaseInfo and userProfile are obtained
    const databaseInfo = { type: "PostgreSQL", details: "Schema details TBD" }; // Placeholder
    const userProfile = { preference: "TypeScript", experience: "Intermediate" }; // Placeholder

    // Pass the specific fields required by the updated function signature
    const generatedPrompt = await generateOneShotPrompt_new(
      latestPlan.planContent,
      latestPlan.researchData as ResearchData | null, // Cast JsonValue to expected type
      latestPlan.prompts as ImplementationPrompts | null, // Cast JsonValue to expected type
      codeEditor,
      databaseInfo, // Placeholder
      userProfile   // Placeholder
    );

    if (!generatedPrompt) {
      console.error(`Failed to generate One-Shot Prompt for plan ${latestPlan.id}`);
      return NextResponse.json({ message: 'Failed to generate One-Shot Prompt using AI service' }, { status: 500 });
    }

    // 5. Save the newly generated prompt to the database
    // Workaround: Use type assertion 'as any' for the data object
    await prisma.plan.update({
      where: { id: latestPlan.id },
      data: { oneShotPrompt: generatedPrompt } as any,
    });
    console.log(`Saved newly generated One-Shot Prompt for plan ${latestPlan.id}`);

    // --- Add Activity Log ---
    try {
        await prisma.activity.create({
            data: {
                type: 'ONESHOT_GENERATED',
                userId: session.user.id,
                projectId: projectId,
                planId: latestPlan.id, // Log against the specific plan version
                details: `Generated One-Shot Prompt for project ${projectId}, plan version ${latestPlan.versionNumber || 'N/A'}`
            }
        });
        // Revalidate paths after logging - Pass only Plan ID
        await revalidateDashboardPaths(latestPlan.id);
    } catch (activityError) {
        console.error("Failed to log ONESHOT_GENERATED activity:", activityError);
        // Don't fail the request, but log the error
    }
    // --- End Activity Log ---

    // 6. Return the newly generated prompt
    return NextResponse.json({ oneShotPrompt: generatedPrompt }, { status: 200 });

  } catch (error) {
    console.error(`Error in GET /api/plans/${projectId}/one-shot-prompt:`, error); // Fixed backtick
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT handler for refining the One-Shot Prompt
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  const session = await getServerSession(authOptions);
  const projectId = params.id;

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { userFeedback, codeEditor } = body;

    if (!userFeedback || typeof userFeedback !== 'string') {
      return NextResponse.json({ message: 'User feedback is required' }, { status: 400 });
    }
    // codeEditor is optional for refinement, could default or fetch if needed
    const targetCodeEditor = codeEditor || 'vscode'; // Default if not provided

    // 1. Fetch the latest plan version, specifically needing the existing oneShotPrompt
    const latestPlan = await prisma.plan.findFirst({
      where: { projectId: projectId },
      orderBy: { versionNumber: 'desc' },
      select: {
        id: true,
        projectId: true, // Select projectId for auth check
        // oneShotPrompt: true, // Removed from select due to TS errors
      },
    });

    if (!latestPlan) {
      return NextResponse.json({ message: 'No plan versions found for this project' }, { status: 404 });
    }

    // Authorization check - Fetch project separately using projectId
    if (!latestPlan.projectId) {
       // Should not happen if data integrity is maintained
       return NextResponse.json({ message: 'Plan is not associated with a project.' }, { status: 500 });
    }
    const projectOwner = await prisma.project.findUnique({
        where: { id: latestPlan.projectId },
        select: { userId: true }
    });

    if (projectOwner?.userId !== session.user.id) {
       // TODO: Add check for shared plans/permissions later
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if the prompt to be refined actually exists
    const existingPrompt = (latestPlan as any).oneShotPrompt as string | null; // Use workaround if needed
    if (!existingPrompt) {
       return NextResponse.json({ message: 'Cannot refine: One-Shot Prompt has not been generated yet.' }, { status: 400 });
    }

    // 2. Call the AI service to refine the prompt
    console.log(`Refining One-Shot Prompt for plan ${latestPlan.id}`);
    // refineOneShotPrompt is now imported at the top

    const refinedPrompt = await refineOneShotPrompt(
      existingPrompt,
      userFeedback,
      targetCodeEditor
    );

    if (!refinedPrompt) {
      console.error(`Failed to refine One-Shot Prompt for plan ${latestPlan.id}`);
      return NextResponse.json({ message: 'Failed to refine One-Shot Prompt using AI service' }, { status: 500 });
    }

    // 3. Update the prompt in the database
    // Workaround: Use type assertion 'as any' if necessary
    await prisma.plan.update({
      where: { id: latestPlan.id },
      data: { oneShotPrompt: refinedPrompt } as any,
    });
    console.log(`Saved refined One-Shot Prompt for plan ${latestPlan.id}`);

    // --- Add Activity Log ---
     try {
        await prisma.activity.create({
            data: {
                type: 'ONESHOT_REFINED',
                userId: session.user.id,
                projectId: projectId,
                planId: latestPlan.id, // Log against the specific plan version
                details: `Refined One-Shot Prompt based on feedback for project ${projectId}, plan version ${latestPlan.id}` // Assuming versionNumber isn't selected here
            }
        });
        // Revalidate paths after logging - Pass only Plan ID
        await revalidateDashboardPaths(latestPlan.id);
    } catch (activityError) {
        console.error("Failed to log ONESHOT_REFINED activity:", activityError);
        // Don't fail the request, but log the error
    }
    // --- End Activity Log ---

    // 4. Return the refined prompt
    return NextResponse.json({ oneShotPrompt: refinedPrompt }, { status: 200 });

  } catch (error) {
     console.error(`Error in PUT /api/plans/${projectId}/one-shot-prompt:`, error);
     if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
