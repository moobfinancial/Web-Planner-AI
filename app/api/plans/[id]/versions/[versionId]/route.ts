import { NextResponse, NextRequest } from 'next/server'; 
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; 
import { prisma } from "@/lib/prisma"; 

export const dynamic = 'force-dynamic'; 

export async function GET(request: NextRequest, { params }: { params: { id: string, versionId: string } }) {
    await Promise.resolve(); 
    const session = await getServerSession(authOptions);
    const projectId = params.id;
    const versionId = params.versionId;

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`Fetching plan version ${versionId} for project ${projectId}, user ${session.user.id}`);

        const planVersion = await prisma.plan.findUnique({
            where: {
                id: versionId,
                projectId: projectId,
            },
            include: {
                project: {
                    select: {
                        status: true,
                        projectName: true,
                        userId: true
                    }
                },
                feedback: true,
            },
        });

        if (!planVersion) {
            return NextResponse.json({ message: "Plan version not found for this project" }, { status: 404 });
        }

        if (!planVersion.project) {
            console.error(`Data integrity issue: Plan version ${versionId} found but associated project ${projectId} is missing.`);
            return NextResponse.json({ error: 'Internal Server Error: Project data missing' }, { status: 500 });
        }

        if (planVersion.project.userId !== session.user.id) {
            console.error(`Unauthorized access attempt: User ${session.user.id} tried to access plan version ${versionId} owned by ${planVersion.project.userId}`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        console.log(`Successfully fetched plan version ${versionId} for project ${projectId}`);

        const { project, ...restOfPlanVersion } = planVersion;
        const finalResponse = {
            ...restOfPlanVersion,
            projectStatus: project.status,
            projectName: project.projectName
        };

        return NextResponse.json(finalResponse);

    } catch (error) {
        console.error(`Error fetching plan version ${versionId} for project ${projectId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
