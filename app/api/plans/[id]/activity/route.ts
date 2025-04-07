// Add this line to explicitly mark the route as dynamic
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define expected Activity Types explicitly
enum ActivityTypeValue {
  PDF_EXPORTED = 'PDF_EXPORTED',
  PLAN_VERSION_CREATED = 'PLAN_VERSION_CREATED',
  PLAN_DELETED = 'PLAN_DELETED',
  PROJECT_SHARED = 'PROJECT_SHARED', // Example: Add other relevant types
  USER_REMOVED = 'USER_REMOVED',   // Example: Add other relevant types
}


export async function POST(
  request: Request,
  { params }: { params: { id: string } } // id here is planId
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const planId = params.id;

  let activityType: ActivityTypeValue;
  let details: string | undefined;

  try {
    const body = await request.json();
    activityType = body.activityType;
    details = body.details;

    // Validate activity type against the enum
    if (!Object.values(ActivityTypeValue).includes(activityType)) {
         console.error(`Invalid activity type received: ${activityType}`);
         return NextResponse.json({ error: 'Invalid activity type provided.' }, { status: 400 });
    }

  } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }


  try {
    // Fetch the plan to get projectId and verify existence
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { projectId: true } // Only fetch what's needed
    });

    // --- Enhanced Logging and Checks ---
    if (!plan) {
      // If plan itself not found
      console.error(`Activity Log Error: Plan with ID ${planId} not found.`);
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Explicitly check projectId AFTER confirming plan exists
    if (!plan.projectId) {
      console.error(`Activity Log Error: Plan ${planId} found, but has no associated projectId.`);
      // Ensure Activity.projectId is not nullable in your schema if returning 404 here.
      // If Activity.projectId *can* be null, adjust logic accordingly.
      return NextResponse.json({ error: 'Plan is not associated with a project' }, { status: 404 });
    }

    const projectId = plan.projectId;
    console.log(`Activity Log Info: Attempting to log for planId=${planId}, projectId=${projectId}, userId=${userId}, activityType=${activityType}`); // Log key data
    // --- End Enhanced Logging ---


    // --- Optional: Permission Check ---
    // Verify the user has access to this project (owner or shared)
    const projectAccess = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { userId: userId }, // User is the owner
                { sharedWith: { some: { userId: userId } } } // User is in the PlanShare list
            ]
        },
        select: { id: true } // Only need to know if it exists
    });

    console.log(`Activity Log Info: Permission check passed for project ${projectId}. Proceeding to create activity.`); // Log before create

    if (!projectAccess) {
        console.warn(`User ${userId} attempted to log activity for project ${projectId} without access.`);
        // Decide if unauthorized or just skip logging silently, returning success can obscure issues
        return NextResponse.json({ error: 'Forbidden: You do not have access to this project.' }, { status: 403 });
    }
    // --- End Optional Permission Check ---


    // Create the activity log entry using the correct model name and relation syntax
    await prisma.Activity.create({
      data: {
        type: activityType,
        details: details ? details.substring(0, 500) : undefined,
        planId: planId, // Pass planId as a scalar field
        user: {         // Use the relation field 'user'
          connect: { id: userId } // Connect via the user's ID
        },
        project: {      // Use the relation field 'project'
          connect: { id: projectId } // Connect via the project's ID
        },
      },
    });

    return NextResponse.json({ success: true, message: "Activity logged successfully." });

  } catch (error) {
    console.error('Error logging activity:', error);
    // Avoid exposing internal errors directly
    return NextResponse.json(
      { error: "Internal Server Error: Failed to log activity." },
      { status: 500 }
    );
  }
}

// --- GET Handler (Example - Needs refinement based on display needs) ---
// This GET handler fetches activities for a SPECIFIC PLAN.
// You might want a different route (e.g., /api/activity or /api/projects/[projectId]/activity)
// to fetch activities for a project or for the dashboard overall.
export async function GET(
  request: Request,
  { params }: { params: { id: string } } // id here is planId
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const planId = params.id;

  try {
       // First, verify the user has access to the plan's project
       const plan = await prisma.plan.findUnique({
           where: { id: planId },
           select: { projectId: true }
       });

       if (!plan || !plan.projectId) {
           return NextResponse.json({ error: 'Plan or associated Project not found' }, { status: 404 });
       }
       const projectId = plan.projectId;

       const projectAccess = await prisma.project.findFirst({
           where: {
               id: projectId,
               OR: [
                   { userId: userId },
                   { sharedWith: { some: { userId: userId } } }
               ]
           },
           select: { id: true }
       });

       if (!projectAccess) {
           return NextResponse.json({ error: 'Forbidden: You do not have access to this project.' }, { status: 403 });
       }

      // Fetch activities specifically for this planId
      const activities = await prisma.Activity.findMany({ 
        where: {
          planId: planId,
          // Optional: Filter further? e.g., by project just to be safe?
          // projectId: projectId
        },
        orderBy: {
          timestamp: 'desc', // Show newest first
        },
        take: 20, // Limit the number of results
        include: { // Include related data for display
            user: { select: { name: true, email: true, image: true }} // Get user who performed action
        }
      });

      return NextResponse.json(activities);

  } catch (error) {
      console.error(`Error fetching activity for plan ${planId}:`, error);
      return NextResponse.json(
        { error: "Internal Server Error: Failed to fetch activity logs." },
        { status: 500 }
      );
  }
}
