import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/client';
import { performDeepResearch, generateInitialPlan } from '@/lib/ai-service';
import { PlanContent, ResearchData } from '@/lib/types';
import { PlanType } from '@prisma/client'; // Import PlanType enum
import { revalidatePath } from 'next/cache'; // Import revalidatePath

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Destructure fields from request body
    const { title: projectName, description: projectDescription, codeEditor, targetAudience, keyGoals } = await request.json();

    // Validate required fields
    if (!projectName || !projectDescription || !codeEditor || !targetAudience || !keyGoals) {
      return NextResponse.json({ message: 'Project Name, Description, Code Editor, Target Audience, and Key Goals are required' }, { status: 400 });
    }

    console.log(`Initiating project for user ${session.user.id}: ${projectName}`);

    // TODO: Potentially pass targetAudience and keyGoals to AI services if they can utilize them
    // 1. Perform Deep Research (using projectDescription)
    const researchData: ResearchData | null = await performDeepResearch(projectDescription);
    if (!researchData) {
      console.error("Failed to perform deep research.");
      return NextResponse.json({ message: 'AI research failed. Please try again.' }, { status: 500 });
    }
    console.log("Research data obtained.");

    // 2. Generate Initial Plan (using projectDescription and researchData)
    // generateInitialPlan returns a PlanContent object or null
    const initialPlanContent: PlanContent | null = await generateInitialPlan(projectDescription, researchData);
    if (!initialPlanContent || !initialPlanContent.planText) { // Check both the object and its planText property
      console.error("Failed to generate initial plan content.");
      return NextResponse.json({ message: 'AI plan generation failed or returned empty content. Please try again.' }, { status: 500 });
    }
    console.log("Initial plan content generated.");

    // 3. Save Project and Initial Plan (Version 1) to DB
    const researchDataJson = researchData as any; // Cast for Prisma Json type

    const newProject = await prisma.project.create({
      data: {
        projectName: projectName,
        projectDescription: projectDescription,
        codeEditor: codeEditor,
        targetAudience: targetAudience,
        keyGoals: keyGoals,
        userId: session.user.id,
        // Create the first Plan (version) simultaneously
        plans: {
          create: {
            planType: PlanType.INITIAL,
            versionNumber: 1,
            // Store the entire PlanContent object as a JSON string
            planContent: JSON.stringify(initialPlanContent),
            researchData: researchDataJson, // Save research data with the first plan
            // prompts: null, // Explicitly set if needed, otherwise defaults based on schema
            // triggeringFeedbackText: null, // Explicitly set if needed
          },
        },
      },
      include: {
        plans: true, // Include the created initial plan in the response
      },
    });

    console.log(`Project ${newProject.id} and initial plan created successfully.`);

    // Log activity for project creation
    try {
        await prisma.activity.create({
            data: {
                type: "PROJECT_CREATED", // Use string literal
                userId: session.user.id,
                projectId: newProject.id,
                details: `Created project "${newProject.projectName}" (ID: ${newProject.id})`,
                // No planId here as it's project creation itself
            },
        });
        console.log(`[POST /initiate] Activity logged for PROJECT_CREATED: ${newProject.id}`);
    } catch (activityError) {
        console.error(`[POST /initiate] Failed to log PROJECT_CREATED activity for project ${newProject.id}:`, activityError);
        // Non-critical error
    }

    // Revalidate dashboard path
    revalidatePath('/dashboard');
    console.log(`[POST /initiate] Revalidated /dashboard path.`);

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error('Error initiating plan:', error);
    // Type guard for error message
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: 'Failed to initiate plan', error: errorMessage }, { status: 500 });
  }
}
