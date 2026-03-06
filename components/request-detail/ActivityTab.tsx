'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import type { CommentRecord, DemoUser, RequestWithRelations } from '@/types'
import { TERMINAL_STATUSES } from '@/types'

const COMMENT_TYPE_LABELS = {
  GENERAL: '',
  MORE_INFO_REQUEST: 'More Info Request',
  RESPONSE: 'Response',
}

const COMMENT_TYPE_CLASSES = {
  GENERAL: 'bg-muted/40',
  MORE_INFO_REQUEST: 'bg-orange-50 border-orange-200',
  RESPONSE: 'bg-blue-50 border-blue-200',
}

interface Props {
  request: RequestWithRelations
  comments: CommentRecord[]
  currentUser: DemoUser
}

export function ActivityTab({ request, comments, currentUser }: Props) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canComment =
    !TERMINAL_STATUSES.includes(request.status) &&
    request.status !== 'DRAFT'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) { setError('Comment is required.'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/requests/${request.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to post comment.'); return }
      setBody('')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}

      {comments.map((c) => (
        <div
          key={c.id}
          className={`rounded-lg border p-4 ${COMMENT_TYPE_CLASSES[c.type]}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{c.author.name}</span>
            <div className="flex items-center gap-2">
              {COMMENT_TYPE_LABELS[c.type] && (
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {COMMENT_TYPE_LABELS[c.type]}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</span>
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap">{c.body}</p>
        </div>
      ))}

      {canComment && (
        <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t">
          <div className="space-y-1">
            <label htmlFor="activity-comment" className="text-sm font-medium">
              Add a comment
            </label>
            <textarea
              id="activity-comment"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your comment here…"
              rows={3}
              aria-describedby={error ? 'activity-comment-error' : undefined}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && (
            <p id="activity-comment-error" role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {submitting ? 'Posting…' : 'Post Comment'}
          </button>
        </form>
      )}
    </div>
  )
}
