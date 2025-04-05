import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from 'zod';
// Removed conflicting import: import { refineBodySchema } from './schema';
import { Plan } from '@prisma/client'; // Removed ActivityType import as 'type' is String
import { PlanContent, ResearchData } from '@/lib/types'; // Import necessary types
import { revalidatePath } from 'next/cache'; // Import revalidatePath

// Helper function to generate refined plan
async function generateRefinedPlan(
  previousPlan: Plan | null,
  userWrittenFeedback: Record<string, string>,
  projectId: string,
  selectedSuggestionIds: string[]
): Promise<string> { // Return type is string, as aiGenerateRefinedPlan returns string | null
  console.log('[API - generateRefinedPlan] Starting refinement process');

  if (!previousPlan || !previousPlan.planContent) {
    console.error('[API - generateRefinedPlan] Error: Previous plan or content is missing.');
    throw new Error("Previous plan content is required for refinement.");
  }

  let previousContentParsed: PlanContent;
  try {
    const parsed = JSON.parse(previousPlan.planContent);
    // Validate the parsed structure minimally
    if (typeof parsed === 'object' && parsed !== null && typeof parsed.planText === 'string') {
       previousContentParsed = parsed as PlanContent; // Assert type after basic check
       // Ensure suggestions array exists, default to empty if not
       previousContentParsed.suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
       console.log('[API - generateRefinedPlan] Previous content parsed and validated successfully.');
    } else {
      console.error('[API - generateRefinedPlan] Parsed previous plan content is not a valid PlanContent object:', parsed);
      throw new Error("Parsed previous plan content is invalid.");
    }
  } catch (error) {
    console.error('[API - generateRefinedPlan] Failed to parse or validate previous plan content:', error);
    throw new Error("Failed to parse previous plan content.");
  }

  console.log('[API - generateRefinedPlan] Fetching project data...');
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { projectDescription: true, keyGoals: true, targetAudience: true, codeEditor: true }
  });

  if (!project) {
    console.error(`[API - generateRefinedPlan] Error: Project not found for ID: ${projectId}`);
    throw new Error("Project not found.");
  }
  console.log('[API - generateRefinedPlan] Project data fetched successfully.');

  console.log('[API - generateRefinedPlan] Preparing feedback text...');
  const feedbackText = Object.entries(userWrittenFeedback)
    .filter(([, text]) => text.trim() !== '')
    .map(([section, text]) => `${section}: ${text}`)
    .join('\n');
  console.log('[API - generateRefinedPlan] Feedback text prepared.');

  let incorporatedSuggestionText = "";
  if (selectedSuggestionIds.length > 0) {
    console.log(`[API - generateRefinedPlan] Using provided selected suggestion IDs:`, selectedSuggestionIds);
    incorporatedSuggestionText = `Incorporate changes based on the selection of the following suggestions (identified by their internal IDs): ${selectedSuggestionIds.join(', ')}`;
  }

  console.log('[API - generateRefinedPlan] Preparing research data...');
  let researchDataParsed: ResearchData = { // Initialize with default ResearchData structure
    targetAudience: { description: "", onlineBehavior: "", needs: "" },
    competitorAnalysis: [],
    keywords: [],
    technologyTrends: [],
    apiIntegrations: [],
    uniqueValueProposition: "",
    monetizationStrategies: []
  };
  // Ensure researchData is a non-empty string before parsing
  if (previousPlan.researchData && typeof previousPlan.researchData === 'string' && previousPlan.researchData.trim().length > 0) {
    try {
      // Now we are sure previousPlan.researchData is a string
      const parsedResearch = JSON.parse(previousPlan.researchData);
      // Ensure parsedResearch is a non-null object before assigning
      if (typeof parsedResearch === 'object' && parsedResearch !== null) {
        // Further validation could be added here to check specific fields if needed
        researchDataParsed = parsedResearch as ResearchData; // Assign validated object
        console.log('[API - generateRefinedPlan] Parsed research data successfully.');
      } else {
        // Log if the parsed JSON is not an object (e.g., string, number, boolean)
        console.warn(`[API - generateRefinedPlan] Parsed research data is not an object (type: ${typeof parsedResearch}). Using default empty structure.`);
      }
    } catch (parseError) {
      // Log if JSON.parse fails
      console.warn('[API - generateRefinedPlan] Failed to parse plan.researchData string as JSON. Using default empty structure.', parseError);
    }
  } else {
      // Log why parsing was skipped
      console.log(`[API - generateRefinedPlan] Research data is missing, not a string, or empty. Using default empty structure. (Type: ${typeof previousPlan.researchData})`);
  }

  const targetAudienceDescription = project.targetAudience || "No target audience description available.";
  if (project.targetAudience) {
    console.log('[API - generateRefinedPlan] Using target audience description:', targetAudienceDescription);
  }

  console.log('[API - generateRefinedPlan] Research data prepared.');

  const combinedFeedback = `User Feedback:\n${feedbackText || "(No written feedback provided)"}\n${incorporatedSuggestionText}`;

  console.log('[API - generateRefinedPlan] Calling AI service (generateRefinedPlan)...');
  // Import the specific function needed
  const { generateRefinedPlan: aiGenerateRefinedPlan } = await import('@/lib/ai-service');
  const aiResponse = await aiGenerateRefinedPlan(
    project.projectDescription || "", // Pass project description
    previousContentParsed, // Pass the parsed content object
    combinedFeedback, // Pass combined written feedback and selected suggestions
    selectedSuggestionIds, // Pass just the IDs
    researchDataParsed // Pass parsed research data or object with raw data
  );
  console.log('[API - generateRefinedPlan] AI service call completed.');

  // The aiGenerateRefinedPlan function (from ai-service.ts) now returns a string | null.
  // We need to handle the case where it returns a valid string or null (indicating an error).
  console.log(`[API - generateRefinedPlan] Raw AI response received (type): ${typeof aiResponse}`);
  if (typeof aiResponse === 'string' && aiResponse.trim().length > 0) {
    console.log('[API - generateRefinedPlan] Received valid string response from AI service.');
    return aiResponse; // Return the string directly
  } else {
    // aiResponse is null or not a valid string
    console.error('[API - generateRefinedPlan] Error: Received null or invalid response from AI service:', aiResponse);
    throw new Error("Invalid response received from AI generation service.");
  }
}

// --- Type Definitions ---
interface GetContext {
  params: { id: string };
}

interface PostContext {
  params: { id: string };
}

// GET Handler: List versions for a specific plan
export async function GET(request: NextRequest, context: GetContext) {
  await Promise.resolve(); // Keep this if needed for timing or other reasons
  const session = await getServerSession(authOptions);
  const id = context.params.id;

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
  }

  try {
    console.log(`Fetching versions for project ${id}, user ${session.user.id}`);

    const project = await prisma.project.findUnique({
      where: { id: id },
      select: { userId: true },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    console.log(`session.user.id: ${session.user.id}, project.userId: ${project.userId}`);

    if (project.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const versions = await prisma.plan.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        versionNumber: true,
        createdAt: true,
        planType: true,
      },
    });

    console.log(`Found ${versions.length} versions for project ${id}`);
    return NextResponse.json(versions);

  } catch (error) {
    console.error(`Error fetching versions for project ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

// POST Handler: Create a new plan version based on feedback
export async function POST(request: NextRequest, context: PostContext) {
  await Promise.resolve(); // Keep this if needed
  const session = await getServerSession(authOptions);
  const projectId = context.params.id;

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
  }

  let requestBody;
  try {
    const rawBody = await request.json();
    console.log("[POST Handler] Raw request body:", rawBody);
    requestBody = refineBodySchema.parse(rawBody);
    console.log("[POST Handler] Parsed request body:", requestBody);
  } catch (error) {
    console.error("[POST Handler] Error parsing request body:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request body', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Invalid JSON format' }, { status: 400 });
  }

  const { userWrittenFeedback, latestVersionId, selectedSuggestionIds = [] } = requestBody;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    if (project.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden: You do not own this project' }, { status: 403 });
    }

    const previousPlan = await prisma.plan.findUnique({
      where: { id: latestVersionId },
    });

    if (!previousPlan) {
      return NextResponse.json({ message: 'Previous plan version not found' }, { status: 404 });
    }
    if (previousPlan.projectId !== projectId) {
      return NextResponse.json({ message: 'Previous version mismatch with project' }, { status: 400 });
    }

    // No need to parse previousPlanContent here, it's handled in generateRefinedPlan

    const projectDetails = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        projectDescription: true,
        keyGoals: true,
        targetAudience: true,
        codeEditor: true
      }
    });

    if (!projectDetails) {
      // This check might be redundant if previousPlan requires project existence, but good for safety
      return NextResponse.json({ message: 'Project data not found' }, { status: 404 });
    }

    let refinedPlanString: string;
    try {
      console.log(`[POST Handler] Calling internal generateRefinedPlan for project ${projectId}, previous version ${latestVersionId}`);
      refinedPlanString = await generateRefinedPlan(
        previousPlan,
        userWrittenFeedback,
        projectId,
        selectedSuggestionIds
      );
      console.log(`[POST Handler] Internal generateRefinedPlan completed successfully for project ${projectId}.`);
    } catch (error) {
      console.error("[POST Handler] Error calling internal generateRefinedPlan:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during plan generation';
      // Return the specific error message from the helper function if available
      return NextResponse.json(
        { message: 'Failed to generate refined plan', error: errorMessage },
        { status: 500 }
      );
    }

    // refinedPlanString should now be the stringified JSON from the AI service

    // Try parsing the refined plan string returned by the helper function
    let refinedContent: Record<string, any>; // Use any for flexibility, PlanContent type is in ai-service
    try {
      console.log("[POST Handler] Parsing refined plan string...");
      // DEBUG: Log the string received *before* parsing
      console.log("[POST Handler] Refined plan string received:", refinedPlanString); // Log the string
      refinedContent = JSON.parse(refinedPlanString);
      // Basic validation: check if it's an object and has planText
      if (!refinedContent || typeof refinedContent !== 'object' || typeof refinedContent.planText !== 'string') {
         console.error("[POST Handler] Parsed refined content is invalid or missing planText:", refinedContent);
         throw new Error("Generated refined content is invalid or missing required fields.");
      }
      console.log("[POST Handler] Refined plan string parsed successfully.");
    } catch (error) {
      console.error("[POST Handler] Error parsing the refined plan string returned by generateRefinedPlan:", error);
      console.error("[POST Handler] Refined plan string was:", refinedPlanString); // Log the problematic string
      return NextResponse.json(
        { message: 'Failed to parse generated plan content', error: error instanceof Error ? error.message : 'Unknown parsing error' },
        { status: 500 }
      );
    }

    // Use the already stringified version received from the helper
    const contentToSave = refinedPlanString;
    console.log("[POST Handler] Content prepared for database saving.");

    const latestVersion = await prisma.plan.findFirst({
      where: { projectId: projectId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });

    const newVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;
    console.log(`[POST Handler] Determined new version number: ${newVersionNumber}`);

    const newPlanVersion = await prisma.plan.create({
      data: {
        projectId: projectId,
        versionNumber: newVersionNumber,
        planContent: contentToSave, // Save the original stringified JSON
        planType: 'REFINED',
      },
    });
    console.log(`[POST Handler] New plan version created successfully with ID: ${newPlanVersion.id}`);

    // Log activity after successful creation
    try {
        await prisma.activity.create({
            data: {
                type: "PLAN_VERSION_CREATED", // Use string literal as type is String in schema
                userId: session.user.id,
                projectId: projectId,
                details: `Created plan version ${newPlanVersion.versionNumber} (ID: ${newPlanVersion.id}) for project ${projectId}`,
                planId: newPlanVersion.id, // Link activity to the new plan version
            },
        });
        console.log(`[POST Handler] Activity logged for PLAN_VERSION_CREATED: ${newPlanVersion.id}`);
    } catch (activityError) {
        console.error(`[POST Handler] Failed to log PLAN_VERSION_CREATED activity for plan ${newPlanVersion.id}:`, activityError);
        // Non-critical error, don't fail the request, just log it.
    }

    // Revalidate the dashboard path to ensure fresh activity data is shown
    revalidatePath('/dashboard');
    console.log(`[POST Handler] Revalidated /dashboard path.`);

    return NextResponse.json({ planVersion: newPlanVersion }, { status: 201 });

  } catch (error) {
    console.error(`[POST Handler] Unexpected error creating refined plan version for project ${projectId}:`, error);
    const errorResponse = {
      message: 'Failed to create refined plan version due to an unexpected error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Added schema definition locally as it was imported from './schema'
const refineBodySchema = z.object({
  userWrittenFeedback: z.record(z.string()),
  latestVersionId: z.string(),
  selectedSuggestionIds: z.array(z.string()).optional(),
});
