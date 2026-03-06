import { formatDateTime } from '@/lib/utils'
import type { AuditRecord } from '@/types'

const EVENT_LABELS: Record<string, string> = {
  CREATED: 'Request created',
  STATUS_CHANGED: 'Status changed',
  ASSIGNMENT_CHANGED: 'Assignment changed',
  COMMENT_ADDED: 'Comment added',
  DECISION_RECORDED: 'Decision recorded',
  FIELD_CHANGED: 'Field updated',
}

interface Props {
  events: AuditRecord[]
}

export function AuditLogTab({ events }: Props) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No audit events found.</p>
  }

  return (
    <ol className="relative border-l border-muted ml-3">
      {events.map((e) => (
        <li key={e.id} className="mb-6 ml-6">
          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted border border-border ring-2 ring-background">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
          </span>

          <div className="flex items-center justify-between flex-wrap gap-2 mb-0.5">
            <p className="text-sm font-medium">
              {EVENT_LABELS[e.eventType] ?? e.eventType}
              {e.fieldName && (
                <span className="font-normal text-muted-foreground"> — {e.fieldName}</span>
              )}
            </p>
            <time className="text-xs text-muted-foreground">{formatDateTime(e.createdAt)}</time>
          </div>

          <p className="text-xs text-muted-foreground">by {e.actor.name}</p>

          {(e.oldValue || e.newValue) && (
            <div className="mt-1 flex items-center gap-2 text-xs">
              {e.oldValue && (
                <span className="rounded bg-red-50 border border-red-100 px-2 py-0.5 text-red-700 line-through">
                  {e.oldValue}
                </span>
              )}
              {e.oldValue && e.newValue && <span className="text-muted-foreground">→</span>}
              {e.newValue && (
                <span className="rounded bg-green-50 border border-green-100 px-2 py-0.5 text-green-700">
                  {e.newValue}
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}
