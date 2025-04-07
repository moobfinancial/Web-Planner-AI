'use server'

import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ShareRole } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { projectId, userEmail, role }: { projectId: string, userEmail: string, role: ShareRole } = await request.json()

    if (!projectId || !userEmail || !role) {
      return NextResponse.json({ status: 'error', message: 'Missing required fields (projectId, userEmail, role)' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    })

    if (!project) {
      return NextResponse.json({ status: 'error', message: 'Project not found' }, { status: 404 })
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { status: 'error', message: 'Only the project owner can share this project.' },
        { status: 403 }
      )
    }

    const userToShareWith = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() },
      select: { id: true },
    })

    if (!userToShareWith) {
      return NextResponse.json(
        { status: 'error', message: 'User to share with not found' },
        { status: 404 }
      )
    }

    if (userToShareWith.id === session.user.id) {
      return NextResponse.json(
        { status: 'error', message: 'Cannot share the project with yourself.' },
        { status: 400 }
      )
    }

    const existingShare = await prisma.planShare.findUnique({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: userToShareWith.id,
        },
      },
    })

    if (existingShare) {
      const updatedShare = await prisma.planShare.update({
        where: { id: existingShare.id },
        data: { role },
        include: { user: { select: { id: true, email: true, name: true, image: true } } },
      })
      return NextResponse.json({ status: 'success', message: 'Share role updated.', data: updatedShare })
    }

    const newShare = await prisma.planShare.create({
      data: {
        projectId: projectId,
        userId: userToShareWith.id,
        role: role,
      },
      include: {
        user: { select: { id: true, email: true, name: true, image: true } },
      },
    })

    return NextResponse.json({
      status: 'success',
      message: 'Project shared successfully.',
      data: newShare
    })

  } catch (error) {
    console.error('Error sharing project:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to share project'
    return NextResponse.json(
      { status: 'error', message: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
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

    const share = await prisma.planShare.findUnique({
      where: { id: shareId },
      select: {
        userId: true,
        project: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!share) {
      return NextResponse.json(
        { status: 'error', message: 'Share record not found' },
        { status: 404 }
      )
    }

    if (share.project.userId !== session.user.id) {
      if (share.userId === session.user.id) {
        // User is removing their own access
      } else {
        return NextResponse.json(
          { status: 'error', message: 'Only the project owner can remove other users from a share.' },
          { status: 403 }
        )
      }
    }

    await prisma.planShare.delete({
      where: { id: shareId },
    })

    return NextResponse.json({
      status: 'success',
      message: 'Share removed successfully.'
    })

  } catch (error) {
    console.error('Error removing share:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove share'
    return NextResponse.json(
      { status: 'error', message: errorMessage },
      { status: 500 }
    )
  }
}
