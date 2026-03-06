import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { transitionRequest } from '@/lib/transitions'
import type { TransitionAction, TransitionPayload } from '@/types'

type Params = { params: { id: string } }

export async function POST(request: NextRequest, { params }: Params) {
  const actor = getCurrentUser()
  if (actor.role === 'ADMIN') {
    return NextResponse.json({ error: 'Admin users cannot perform actions on requests.' }, { status: 403 })
  }

  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  try {
    const body = await request.json()
    const { action, ...payload } = body as { action: TransitionAction } & TransitionPayload

    if (!action) return NextResponse.json({ error: 'Action is required.' }, { status: 400 })

    const result = await transitionRequest(id, action, actor, payload)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/requests/[id]/transition error:', err)
    return NextResponse.json({ error: 'Failed to perform action.' }, { status: 500 })
  }
}
