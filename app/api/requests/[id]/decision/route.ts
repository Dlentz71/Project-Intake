import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { transitionRequest } from '@/lib/transitions'

type Params = { params: { id: string } }

// Convenience wrapper — delegates to transitionRequest with action='decide'
export async function POST(request: NextRequest, { params }: Params) {
  const actor = getCurrentUser()
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  try {
    const { outcome, rationale, nextReviewDate } = await request.json()
    const result = await transitionRequest(id, 'decide', actor, {
      outcome,
      rationale,
      nextReviewDate,
    })
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/requests/[id]/decision error:', err)
    return NextResponse.json({ error: 'Failed to record decision.' }, { status: 500 })
  }
}
