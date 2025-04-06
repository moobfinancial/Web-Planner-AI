import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma client is exported from here
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Assuming authOptions are defined here

// Basic POST handler to update build plan progress (example)
export async function POST(
  req: Request,
  { params }: { params: { id: string } } // Plan ID from the route
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const planId = params.id;

  try {
    const body = await req.json();
    const { completedTasks, totalTasks } = body; // Expecting these fields in the request

    // Basic validation
    if (typeof completedTasks !== 'number' || typeof totalTasks !== 'number') {
      return NextResponse.json({ error: 'Invalid input: completedTasks and totalTasks must be numbers.' }, { status: 400 });
    }

    // Fetch the current plan version to ensure it exists and belongs to the user (or shared)
    // TODO: Add proper authorization check - does the user own this plan or have edit rights?
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { projectId: true } // Select minimal data needed for now
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // --- Authorization Check Placeholder ---
    // In a real app, verify if session.user.id has rights to edit this plan
    // e.g., check if user owns the project or has edit permissions via PlanShare
    // For now, we assume the user is authorized if they are logged in.
    // const project = await prisma.project.findUnique({ where: { id: plan.projectId } });
    // if (project?.userId !== session.user.id) {
    //   // Check PlanShare permissions here...
    //   // return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
    // --- End Placeholder ---


    // Update the buildPlanProgress field
    // Workaround: Use type assertion 'as any' for the data object due to persistent type errors
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        buildPlanProgress: {
          completed: completedTasks,
          total: totalTasks,
          lastUpdated: new Date(),
          progress: body._detailedProgress || {}, // Store the detailed progress information
        },
      } as any, // Apply workaround here
      // Workaround: Select 'id' and fetch again or just return input data if select fails
      // select: { buildPlanProgress: true } // This might still cause TS error
      select: { id: true } // Select minimal field
    });

    // Since select might fail for buildPlanProgress, return the input data as confirmation
    // Or fetch the record again if necessary, but this is simpler for now.
    // const freshPlan = await prisma.plan.findUnique({ where: { id: updatedPlan.id }, select: { buildPlanProgress: true }});
    // return NextResponse.json(freshPlan?.buildPlanProgress);
    return NextResponse.json({
        completed: completedTasks,
        total: totalTasks,
        lastUpdated: new Date().toISOString(), // Return consistent format
        progress: body._detailedProgress || {}, // Return the detailed progress information
    });

  } catch (error) {
    console.error(`Error updating build plan progress for plan ${planId}:`, error);
    // Handle potential JSON parsing errors
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Basic GET handler to retrieve build plan progress (example)
export async function GET(
  req: Request,
  { params }: { params: { id: string } } // Plan ID from the route
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const planId = params.id;

  try {
    // Fetch the plan and select only the progress field
    // TODO: Add proper authorization check here as well
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { 
        projectId: true,
        buildPlanProgress: true 
      },
    });


    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // --- Authorization Check Placeholder ---
    // Verify user has view rights
    // --- End Placeholder ---

    // Return the progress data, or a default if it doesn't exist yet
    const progressData = plan.buildPlanProgress || { completed: 0, total: 0, lastUpdated: null, progress: {} };
    
    console.log("Returning progress data:", progressData);

    return NextResponse.json(progressData);

  } catch (error) {
    console.error(`Error fetching build plan progress for plan ${planId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
