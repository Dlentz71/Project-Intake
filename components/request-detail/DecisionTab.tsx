import { formatDate, formatDateTime } from '@/lib/utils'
import type { DecisionRecord } from '@/types'

const OUTCOME_LABELS = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DEFERRED: 'Deferred',
}

const OUTCOME_CLASSES = {
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  DEFERRED: 'bg-slate-100 text-slate-700 border-slate-200',
}

interface Props {
  decision: DecisionRecord | null
}

export function DecisionTab({ decision }: Props) {
  if (!decision) {
    return (
      <div className="rounded-lg border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
        No decision has been recorded yet.
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${OUTCOME_CLASSES[decision.outcome]}`}
        >
          {OUTCOME_LABELS[decision.outcome]}
        </span>
        <span className="text-sm text-muted-foreground">
          {formatDateTime(decision.decidedAt)}
        </span>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          Decided by
        </p>
        <p className="text-sm">{decision.decidedBy?.name ?? '—'}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          Rationale
        </p>
        <p className="text-sm whitespace-pre-wrap">{decision.rationale}</p>
      </div>

      {decision.outcome === 'DEFERRED' && decision.nextReviewDate && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Next Review Date
          </p>
          <p className="text-sm">{formatDate(decision.nextReviewDate)}</p>
        </div>
      )}
    </div>
  )
}
