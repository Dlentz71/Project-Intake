'use client'

import { useRouter } from 'next/navigation'
import { DEMO_USERS, type DemoUser } from '@/types'

interface Props {
  currentUser: DemoUser
}

const ROLE_LABELS: Record<string, string> = {
  REQUESTER: 'Requester',
  REVIEWER: 'Reviewer',
  DECISION_MAKER: 'Decision Maker',
  ADMIN: 'Admin',
}

export function UserSwitcher({ currentUser }: Props) {
  const router = useRouter()

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const userId = parseInt(e.target.value, 10)
    await fetch('/api/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground whitespace-nowrap">Acting as:</span>
      <select
        aria-label="Switch demo user"
        value={currentUser.id}
        onChange={handleChange}
        className="border border-input bg-background rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {DEMO_USERS.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({ROLE_LABELS[u.role]})
          </option>
        ))}
      </select>
    </div>
  )
}
