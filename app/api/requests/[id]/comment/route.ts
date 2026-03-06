import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TERMINAL_STATUSES } from '@/types'

type Params = { params: { id: string } }

export async function POST(request: NextRequest, { params }: Params) {
  const actor = getCurrentUser()
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  try {
    const { body: commentBody } = await request.json()
    if (!commentBody?.trim()) {
      return NextResponse.json({ error: 'Comment body is required.' }, { status: 400 })
    }

    const projectRequest = await prisma.projectRequest.findUnique({ where: { id } })
    if (!projectRequest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // No comments on terminal states (APPROVED, REJECTED) or DRAFT
    if (TERMINAL_STATUSES.includes(projectRequest.status as import('@/types').Status) || projectRequest.status === 'DRAFT') {
      return NextResponse.json(
        { error: 'Comments cannot be added to requests in this status.' },
        { status: 400 },
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.comment.create({
        data: {
          projectRequestId: id,
          authorUserId: actor.id,
          body: commentBody.trim(),
          type: 'GENERAL',
        },
      })
      await tx.auditEvent.create({
        data: {
          projectRequestId: id,
          actorUserId: actor.id,
          eventType: 'COMMENT_ADDED',
          newValue: 'General',
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/requests/[id]/comment error:', err)
    return NextResponse.json({ error: 'Failed to add comment.' }, { status: 500 })
  }
}
