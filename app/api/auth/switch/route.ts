import { NextRequest, NextResponse } from 'next/server'
import { DEMO_USERS } from '@/types'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    const user = DEMO_USERS.find((u) => u.id === userId)
    if (!user) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true, user })
    response.cookies.set(COOKIE_NAME, String(userId), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
