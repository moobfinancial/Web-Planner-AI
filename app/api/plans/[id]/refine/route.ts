import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/client';
import { generateRefinedPlan } from '@/lib/ai-service';
import { PlanContent, ResearchData } from '@/lib/types';
import { PlanType } from '@prisma/client'; // Import PlanType enum

interface RefineRequestBody {
  userWrittenFeedback: string;
  selectedSuggestionIds: string[];
}

// Define Params type for route segment parameter
interface RouteParams {
  params: {
    id: string; // This is the Project ID
  };
}

export async function PUT(request: Request, { params }: RouteParams) { // Destructure params
  const session = await getServerSession(authOptions);
  const projectId = params.id; // Use projectId

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
  }

  try {
    const { userWrittenFeedback, selectedSuggestionIds }: RefineRequestBody = await request.json();

    console.log(`Refining project ${projectId} for user ${session.user.id}`);

    // 1. Fetch the project for ownership check and description
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true, projectDescription: true },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Basic authorization check: ensure the user owns the project
    if (project.userId !== session.user.id) {
       // TODO: Add more sophisticated checks later if sharing/roles are involved
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch the latest plan version for this project
    const latestPlan = await prisma.plan.findFirst({
      where: { projectId: projectId },
      orderBy: { versionNumber: 'desc' },
    });

    if (!latestPlan || !latestPlan.planContent || !latestPlan.researchData) {
      return NextResponse.json({ message: 'Latest plan version or its data not found for this project' }, { status: 400 });
    }

    // 3. Parse previous plan content and research data safely
    let previousPlanContent: PlanContent;
    let researchData: ResearchData;

    try {
      // Parse Plan Content
      if (typeof latestPlan.planContent === 'string') {
        const parsedContent = JSON.parse(latestPlan.planContent);
        if (typeof parsedContent?.planText !== 'string' || !Array.isArray(parsedContent?.suggestions)) {
          throw new Error("Parsed latest planContent does not match expected PlanContent structure.");
        }
        previousPlanContent = parsedContent as PlanContent;
      } else {
         throw new Error("Latest plan content is not a string.");
      }

      // Parse Research Data (assuming it's stored correctly from initiate)
      // Note: researchData is Json? so Prisma might return object or null
      if (latestPlan.researchData && typeof latestPlan.researchData === 'object' && 'targetAudience' in latestPlan.researchData) {
         researchData = latestPlan.researchData as unknown as ResearchData; // Cast needed due to Json type
      } else if (typeof latestPlan.researchData === 'string') {
         const parsedResearch = JSON.parse(latestPlan.researchData);
          if (parsedResearch && typeof parsedResearch === 'object' && 'targetAudience' in parsedResearch) {
              researchData = parsedResearch as ResearchData;
          } else {
              throw new Error("Parsed researchData string does not match expected ResearchData structure.");
          }
      }
      else {
        throw new Error("Research data is missing or invalid.");
      }
    } catch (parseError) {
        console.error(`Error parsing data for project ${projectId}:`, parseError);
        const message = parseError instanceof Error ? parseError.message : "Failed to parse existing plan data.";
        return NextResponse.json({ message }, { status: 500 });
    }


    // 4. Generate Refined Plan using AI Service
    const refinedPlanContentResult: PlanContent | null = await generateRefinedPlan(
      project.projectDescription || '', // Use description from project
      previousPlanContent,
      userWrittenFeedback,
      selectedSuggestionIds,
      researchData
    );

    if (!refinedPlanContentResult) {
      console.error(`Failed to generate refined plan for project ${projectId}`);
      return NextResponse.json({ message: 'AI plan refinement failed. Please try again.' }, { status: 500 });
    }
    console.log(`Refined plan content generated for project ${projectId}.`);

    // 5. Create new Plan record (new version)
    const newVersionNumber = (latestPlan.versionNumber ?? 0) + 1; // Handle potential null

    const newPlanVersion = await prisma.plan.create({
        data: {
            projectId: projectId,
            planType: PlanType.REFINED, // Set type to REFINED
            versionNumber: newVersionNumber,
            planContent: JSON.stringify(refinedPlanContentResult), // Store full object as JSON string
            researchData: latestPlan.researchData, // Carry over research data from previous version
            triggeringFeedbackText: userWrittenFeedback || null, // Use correct field name
            // prompts: null, // Prompts generated separately
        }
    });

    console.log(`New plan version ${newPlanVersion.versionNumber} created for project ${projectId}.`);

    // Optionally: Update the project's updatedAt timestamp
    await prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() }
    });

    return NextResponse.json(newPlanVersion, { status: 200 }); // Return the newly created plan version

  } catch (error) {
    console.error(`Error refining project ${projectId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: 'Failed to refine plan', error: errorMessage }, { status: 500 });
  }
}
