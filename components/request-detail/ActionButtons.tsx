'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import type { DemoUser, RequestWithRelations } from '@/types'
import { TERMINAL_STATUSES } from '@/types'

interface Props {
  request: RequestWithRelations
  currentUser: DemoUser
}

interface DialogState {
  action: string
  title: string
  needsComment?: boolean
  commentLabel?: string
  needsOutcome?: boolean
  needsDate?: boolean
}

function ForbiddenNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      {message}
    </div>
  )
}

export function ActionButtons({ request, currentUser }: Props) {
  const router = useRouter()
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [comment, setComment] = useState('')
  const [outcome, setOutcome] = useState<'APPROVED' | 'REJECTED' | 'DEFERRED'>('APPROVED')
  const [nextReviewDate, setNextReviewDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const { status, requesterUserId } = request
  const { role, id: userId } = currentUser
  const isOwner = requesterUserId === userId

  // Focus trap + Escape key
  useEffect(() => {
    if (!dialog) return

    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    )
    firstFocusable?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeDialog()
        return
      }
      if (e.key !== 'Tab') return

      const focusables = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
        ) ?? [],
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog])

  if (TERMINAL_STATUSES.includes(status)) return null

  // Draft owner: show Edit Draft link instead of workflow buttons
  if (status === 'DRAFT' && isOwner) {
    return (
      <Link
        href={`/requests/${request.id}/edit`}
        className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Pencil aria-hidden="true" className="h-4 w-4" />
        Edit Draft
      </Link>
    )
  }

  if (role === 'ADMIN') {
    return <ForbiddenNotice message="Admin users have view-only access and cannot perform actions on requests." />
  }

  async function callApi(action: string, payload: Record<string, unknown> = {}) {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/requests/${request.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Action failed.'); return false }
      return true
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirm() {
    if (!dialog) return
    let success = false

    if (dialog.action === 'claim') {
      success = await callApi('claim')
    } else if (dialog.action === 'markReady') {
      success = await callApi('markReady')
    } else if (dialog.action === 'reopen') {
      success = await callApi('reopen')
    } else if (dialog.action === 'requestMoreInfo') {
      success = await callApi('requestMoreInfo', { comment })
    } else if (dialog.action === 'resubmit') {
      success = await callApi('resubmit', { comment })
    } else if (dialog.action === 'decide') {
      success = await callApi('decide', {
        outcome,
        rationale: comment,
        nextReviewDate: outcome === 'DEFERRED' ? nextReviewDate : undefined,
      })
    } else if (dialog.action === 'withdraw') {
      success = await callApi('withdraw')
    }

    if (success) {
      setDialog(null)
      setComment('')
      router.refresh()
    }
  }

  function openDialog(d: DialogState, trigger: HTMLButtonElement) {
    triggerRef.current = trigger
    setDialog(d)
    setComment('')
    setError('')
  }

  function closeDialog() {
    setDialog(null)
    setComment('')
    setError('')
    triggerRef.current?.focus()
  }

  const buttons: React.ReactNode[] = []

  if (status === 'SUBMITTED' && role === 'REVIEWER') {
    buttons.push(
      <Button key="claim" onClick={(e) => openDialog({ action: 'claim', title: 'Claim this request?' }, e.currentTarget)}>
        Claim Request
      </Button>,
    )
  }

  if (status === 'UNDER_REVIEW' && role === 'REVIEWER') {
    buttons.push(
      <Button
        key="moreInfo"
        variant="outline"
        onClick={(e) => openDialog({ action: 'requestMoreInfo', title: 'Request More Information', needsComment: true, commentLabel: 'What information is needed?' }, e.currentTarget)}
      >
        Request More Info
      </Button>,
      <Button
        key="markReady"
        onClick={(e) => openDialog({ action: 'markReady', title: 'Mark Ready for Decision?' }, e.currentTarget)}
      >
        Mark Ready for Decision
      </Button>,
    )
  }

  if (status === 'MORE_INFO_REQUESTED' && role === 'REQUESTER' && isOwner) {
    buttons.push(
      <Button
        key="resubmit"
        onClick={(e) => openDialog({ action: 'resubmit', title: 'Respond & Resubmit', needsComment: true, commentLabel: "Your response to the reviewer's question:" }, e.currentTarget)}
      >
        Respond &amp; Resubmit
      </Button>,
    )
  }

  if (status === 'READY_FOR_DECISION' && role === 'DECISION_MAKER') {
    buttons.push(
      <Button
        key="decide"
        onClick={(e) => openDialog({ action: 'decide', title: 'Record Decision', needsComment: true, commentLabel: 'Rationale', needsOutcome: true, needsDate: true }, e.currentTarget)}
      >
        Record Decision
      </Button>,
    )
  }

  if (status === 'DEFERRED' && role === 'DECISION_MAKER') {
    buttons.push(
      <Button key="reopen" onClick={(e) => openDialog({ action: 'reopen', title: 'Reopen request as Ready for Decision?' }, e.currentTarget)}>
        Reopen for Decision
      </Button>,
    )
  }

  if ((status === 'SUBMITTED' || status === 'MORE_INFO_REQUESTED') && role === 'REQUESTER' && isOwner) {
    buttons.push(
      <Button
        key="withdraw"
        variant="outline"
        onClick={(e) => openDialog({ action: 'withdraw', title: 'Withdraw this request?' }, e.currentTarget)}
      >
        Withdraw Request
      </Button>,
    )
  }

  if (buttons.length === 0) {
    let message = 'No actions available for your role at this stage.'
    if (status === 'SUBMITTED' && role !== 'REVIEWER') message = 'This request is waiting for a Reviewer to claim it.'
    if (status === 'UNDER_REVIEW' && role !== 'REVIEWER') message = 'This request is under review by the assigned reviewer.'
    if (status === 'MORE_INFO_REQUESTED' && (!isOwner || role !== 'REQUESTER')) message = 'Waiting for the requester to respond.'
    if (status === 'READY_FOR_DECISION' && role !== 'DECISION_MAKER') message = 'Waiting for a Decision Maker to record a decision.'
    if (status === 'DEFERRED' && role !== 'DECISION_MAKER') message = 'This request is deferred. A Decision Maker can reopen it.'
    return <ForbiddenNotice message={message} />
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">{buttons}</div>

      {dialog && (
        <>
          {/* Backdrop — aria-hidden so screen readers don't read the overlay itself */}
          <div className="fixed inset-0 z-50 bg-black/50" aria-hidden="true" />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="action-dialog-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-background rounded-lg border shadow-lg w-full max-w-md p-6 space-y-4 pointer-events-auto">
              <h2 id="action-dialog-title" className="text-base font-semibold">
                {dialog.title}
              </h2>

              {dialog.needsOutcome && (
                <fieldset className="space-y-1">
                  <legend className="text-sm font-medium">Outcome</legend>
                  <div className="flex gap-3 mt-1">
                    {(['APPROVED', 'REJECTED', 'DEFERRED'] as const).map((o) => (
                      <label key={o} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="outcome"
                          value={o}
                          checked={outcome === o}
                          onChange={() => setOutcome(o)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {o.charAt(0) + o.slice(1).toLowerCase()}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {dialog.needsComment && (
                <div className="space-y-1">
                  <label htmlFor="dialog-comment" className="text-sm font-medium">
                    {dialog.commentLabel ?? 'Comment'}
                  </label>
                  <textarea
                    id="dialog-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Required…"
                  />
                </div>
              )}

              {dialog.needsDate && outcome === 'DEFERRED' && (
                <div className="space-y-1">
                  <label htmlFor="dialog-review-date" className="text-sm font-medium">
                    Next Review Date{' '}
                    <span aria-hidden="true" className="text-destructive">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <input
                    id="dialog-review-date"
                    type="date"
                    value={nextReviewDate}
                    onChange={(e) => setNextReviewDate(e.target.value)}
                    aria-required="true"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeDialog}
                  disabled={submitting}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function Button({
  children,
  onClick,
  variant = 'default',
}: {
  children: React.ReactNode
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'default' | 'outline'
}) {
  return (
    <button
      onClick={onClick}
      className={
        variant === 'outline'
          ? 'rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          : 'rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      }
    >
      {children}
    </button>
  )
}
