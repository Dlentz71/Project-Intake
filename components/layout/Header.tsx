import { UserSwitcher } from './UserSwitcher'
import { NotificationBell } from './NotificationBell'
import type { DemoUser } from '@/types'
import type { NotifGroup } from './NotificationBell'

const ROLE_LABELS: Record<string, string> = {
  REQUESTER: 'Requester',
  REVIEWER: 'Reviewer',
  DECISION_MAKER: 'Decision Maker',
  ADMIN: 'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  REQUESTER: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  REVIEWER: 'bg-amber-50 text-amber-700 ring-amber-200',
  DECISION_MAKER: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ADMIN: 'bg-slate-100 text-slate-700 ring-slate-200',
}

interface Props {
  user: DemoUser
  notifGroups: NotifGroup[]
}

export function Header({ user, notifGroups }: Props) {
  const roleLabel = ROLE_LABELS[user.role] ?? user.role
  const roleColor = ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-700 ring-gray-200'

  return (
    <header
      aria-label="Application header"
      className="h-14 border-b bg-white flex items-center justify-end px-6 shrink-0 gap-4"
    >
      <div className="flex items-center gap-2.5 text-sm">
        <span className="font-medium text-foreground">{user.name}</span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${roleColor}`}>
          {roleLabel}
        </span>
      </div>
      <NotificationBell notifGroups={notifGroups} />
      <div className="border-l pl-4">
        <UserSwitcher currentUser={user} />
      </div>
    </header>
  )
}
