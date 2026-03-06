'use client'

import { useState } from 'react'
import Link from 'next/link'

const EVENT_TYPE_LABELS: Record<string, string> = {
  ALL: 'All events',
  STATUS_CHANGED: 'Status Changed',
  FIELD_CHANGED: 'Field Changed',
  COMMENT_ADDED: 'Comment Added',
  ASSIGNMENT_CHANGED: 'Assignment Changed',
  DECISION_RECORDED: 'Decision Recorded',
  CREATED: 'Created',
}

type AuditEvent = {
  id: number
  eventType: string
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  createdAt: Date | string
  actor: { name: string }
  projectRequest: { id: number; requestNumber: string; title: string }
}

interface Props {
  events: AuditEvent[]
}

export function AuditLogFilter({ events }: Props) {
  const [filter, setFilter] = useState('ALL')

  const visible = filter === 'ALL' ? events : events.filter((e) => e.eventType === filter)

  // Only show event type options that actually exist in the data
  const presentTypes = Array.from(new Set(events.map((e) => e.eventType)))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">
          {visible.length === events.length
            ? `${events.length} event${events.length !== 1 ? 's' : ''}`
            : `${visible.length} of ${events.length} events`}
        </p>
        <select
          aria-label="Filter by event type"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-input bg-background rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="ALL">All events</option>
          {presentTypes.map((t) => (
            <option key={t} value={t}>
              {EVENT_TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No events match this filter.</p>
      ) : (
        <ol className="relative border-l border-muted ml-3">
          {visible.map((e) => (
            <li key={e.id} className="mb-5 ml-6">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted border border-border ring-2 ring-background">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              </span>

              <div className="flex items-center justify-between flex-wrap gap-2 mb-0.5">
                <p className="text-sm font-medium">
                  <Link
                    href={`/requests/${e.projectRequest.id}`}
                    className="text-primary hover:underline font-mono text-xs mr-2"
                  >
                    {e.projectRequest.requestNumber}
                  </Link>
                  {EVENT_TYPE_LABELS[e.eventType] ?? e.eventType.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                  {e.fieldName && (
                    <span className="font-normal text-muted-foreground"> — {e.fieldName}</span>
                  )}
                </p>
                <time className="text-xs text-muted-foreground">
                  {new Date(e.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>

              <p className="text-xs text-muted-foreground">by {e.actor.name}</p>

              {(e.oldValue || e.newValue) && (
                <div className="mt-1 flex items-center gap-2 text-xs">
                  {e.oldValue && (
                    <span className="rounded bg-red-50 border border-red-100 px-2 py-0.5 text-red-700 line-through">
                      {e.oldValue}
                    </span>
                  )}
                  {e.oldValue && e.newValue && (
                    <span className="text-muted-foreground">→</span>
                  )}
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
      )}
    </div>
  )
}
