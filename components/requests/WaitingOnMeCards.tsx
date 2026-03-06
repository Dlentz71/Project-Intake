import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { RequestWithRelations, DemoUser } from '@/types'
import { groupWaitingItems } from '@/lib/waiting-on'

interface Props {
  requests: RequestWithRelations[]
  user: DemoUser
}

const LABEL_BORDER: Record<string, string> = {
  'Your drafts ready to submit': 'border-l-slate-400',
  'Unassigned requests to claim': 'border-l-amber-400',
  'Requests assigned to you': 'border-l-indigo-400',
  'Requests awaiting your response': 'border-l-orange-400',
  'Requests awaiting your decision': 'border-l-emerald-400',
  'Deferred requests ready to reopen': 'border-l-purple-400',
}

const LABEL_COUNT_COLOR: Record<string, string> = {
  'Your drafts ready to submit': 'text-slate-600',
  'Unassigned requests to claim': 'text-amber-600',
  'Requests assigned to you': 'text-indigo-600',
  'Requests awaiting your response': 'text-orange-600',
  'Requests awaiting your decision': 'text-emerald-600',
  'Deferred requests ready to reopen': 'text-purple-600',
}

export function WaitingOnMeCards({ requests, user }: Props) {
  const groups = groupWaitingItems(requests, user)
  const entries = Object.entries(groups)

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 text-center">
        <p className="text-sm font-semibold text-indigo-700">You&apos;re all caught up!</p>
        <p className="text-xs text-muted-foreground mt-0.5">No actions waiting on you right now.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map(([label, items]) => {
        const borderClass = LABEL_BORDER[label] ?? 'border-l-gray-300'
        const countColor = LABEL_COUNT_COLOR[label] ?? 'text-gray-600'
        const first = items[0]
        return (
          <div
            key={label}
            className={`rounded-xl border border-l-4 bg-card shadow-sm flex flex-col p-4 gap-3 ${borderClass}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight">
                {label}
              </p>
              <span className={`text-2xl font-bold tabular-nums leading-none ${countColor}`}>
                {items.length}
              </span>
            </div>

            <Link
              href={`/requests/${first.id}`}
              className="group flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors truncate"
            >
              <span className="truncate">{first.requestNumber} — {first.title}</span>
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {items.length > 1 && (
              <div className="flex flex-col gap-0.5">
                {items.slice(1, 3).map((r) => (
                  <Link
                    key={r.id}
                    href={`/requests/${r.id}`}
                    className="text-xs text-muted-foreground hover:text-primary hover:underline truncate transition-colors"
                  >
                    {r.requestNumber} — {r.title}
                  </Link>
                ))}
                {items.length > 3 && (
                  <span className="text-xs text-muted-foreground/70">+{items.length - 3} more</span>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground/60 mt-auto">
              {items.length === 1 ? '1 item needs attention' : `${items.length} items need attention`}
            </p>
          </div>
        )
      })}
    </div>
  )
}
