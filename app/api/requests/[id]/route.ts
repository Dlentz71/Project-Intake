import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { patchRequest } from '@/lib/transitions'

type Params = { params: { id: string } }

export async function GET(_request: NextRequest, { params }: Params) {
  const actor = getCurrentUser()
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const request = await prisma.projectRequest.findUnique({
    where: { id },
    include: {
      requester: true,
      assignedReviewer: true,
      decision: { include: { decidedBy: true } },
      comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      auditEvents: { include: { actor: true }, orderBy: { createdAt: 'asc' } },
    },
  })

  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Requesters can only view their own requests
  if (actor.role === 'REQUESTER' && request.requesterUserId !== actor.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ data: request })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const actor = getCurrentUser()
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  try {
    const body = await request.json()
    const result = await patchRequest(id, actor, body)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/requests/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update request.' }, { status: 500 })
  }
}
