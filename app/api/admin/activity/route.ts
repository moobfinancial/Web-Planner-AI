import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path as needed
import { prisma } from '@/lib/prisma'; // Adjust path as needed
import { Role, Prisma } from '@prisma/client'; // Import Role enum and Prisma types

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // 1. Authentication and Authorization Check
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden. Requires ADMIN role.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const roleFilter = searchParams.get('role') as Role | 'ALL' | null; // 'ADMIN', 'USER', or 'ALL'
  const skip = (page - 1) * limit;

  try {
    // 2. Construct Where Clause based on role filter
    let whereClause: Prisma.ActivityWhereInput = {};
    if (roleFilter && roleFilter !== 'ALL') {
      // Ensure the roleFilter is a valid Role enum member
      if (roleFilter === Role.ADMIN || roleFilter === Role.USER) {
        whereClause = {
          user: {
            role: roleFilter,
          },
        };
      } else {
        // Handle invalid role filter value if necessary, though frontend should prevent this
        console.warn(`Invalid role filter received: ${roleFilter}`);
        // Optionally return an error or ignore the filter
      }
    }

    // 2. Fetch Paginated Activities with User data
    const activities = await prisma.activity.findMany({
      where: whereClause, // Apply the filter
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: 'desc', // Show newest activities first
      },
      include: {
        // Include user details for display
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        // Optionally include project/plan if needed later
        // project: { select: { id: true, projectName: true } },
        // plan: { select: { id: true, versionNumber: true } },
      },
    });

    // 3. Get Total Count for Pagination (respecting the filter)
    const totalActivities = await prisma.activity.count({
      where: whereClause, // Apply the same filter for accurate count
    });

    // 4. Return Response
    return NextResponse.json({
      activities,
      totalActivities,
      totalPages: Math.ceil(totalActivities / limit),
      currentPage: page,
    });

  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ error: 'Internal Server Error fetching activity logs.' }, { status: 500 });
  }
}
