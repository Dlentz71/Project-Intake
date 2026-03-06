import { cookies } from 'next/headers'
import { DEMO_USERS, type DemoUser } from '@/types'

export const COOKIE_NAME = 'demo_user_id'

export function getCurrentUser(): DemoUser {
  const cookieStore = cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  const id = raw ? parseInt(raw, 10) : 1
  return DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0]
}
