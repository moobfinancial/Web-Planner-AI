'use server'

import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planId, userEmail, role }: { planId: string, userEmail: string, role: 'VIEWER' | 'EDITOR' | 'ADMIN' } = await request.json()

    // Check if user has permission to share the plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        sharedWith: {
          where: {
            userId: session.user.id,
            role: 'ADMIN',
          },
        },
      },
    })

    if (!plan || (plan.ownerId !== session.user.id && plan.sharedWith.length === 0)) {
      return NextResponse.json(
        { status: 'error', message: 'You do not have permission to share this plan' },
        { status: 403 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has access
    const existingShare = await prisma.planShare.findFirst({
      where: {
        planId,
        userId: user.id,
      },
    })

    if (existingShare) {
      return NextResponse.json(
        { status: 'error', message: 'User already has access to this plan' },
        { status: 400 }
      )
    }

    // Create share
    const share = await prisma.planShare.create({
      data: {
        planId,
        userId: user.id,
        role,
        permissions: {
          create: [
            { permission: 'VIEW' },
            { permission: 'COMMENT' },
          ],
        },
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      status: 'success',
      data: share
    })
  } catch (error) {
    console.error('Error sharing plan:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to share plan' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')

    if (!shareId) {
      return NextResponse.json(
        { status: 'error', message: 'Share ID is required' },
        { status: 400 }
      )
    }

    // Get the share to check permissions
    const share = await prisma.planShare.findUnique({
      where: { id: shareId },
      include: {
        plan: {
          include: {
            sharedWith: {
              where: {
                userId: session.user.id,
                role: 'ADMIN',
              },
            },
          },
        },
      },
    })

    if (!share) {
      return NextResponse.json(
        { status: 'error', message: 'Share not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to remove the share
    if (share.plan.ownerId !== session.user.id && share.plan.sharedWith.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'You do not have permission to remove this share' },
        { status: 403 }
      )
    }

    // Delete the share
    await prisma.planShare.delete({
      where: { id: shareId },
    })

    return NextResponse.json({
      status: 'success',
      data: { success: true }
    })
  } catch (error) {
    console.error('Error removing share:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to remove share' },
      { status: 500 }
    )
  }
}
