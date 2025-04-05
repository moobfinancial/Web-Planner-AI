import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        projectName: true,
      },
      orderBy: {
        createdAt: 'desc', // Or projectName: 'asc'
      },
    });

    return NextResponse.json(projects);

  } catch (error) {
    console.error('Error fetching user projects:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: 'Failed to fetch projects', error: errorMessage }, { status: 500 });
  }
}
