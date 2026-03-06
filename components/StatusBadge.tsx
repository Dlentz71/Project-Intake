import { cn } from '@/lib/utils'
import { STATUS_LABELS, type Status } from '@/types'

const STATUS_CLASSES: Record<Status, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-200',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  MORE_INFO_REQUESTED: 'bg-orange-100 text-orange-700 border-orange-200',
  READY_FOR_DECISION: 'bg-purple-100 text-purple-700 border-purple-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  DEFERRED: 'bg-slate-100 text-slate-600 border-slate-200',
}

const STATUS_DOT_COLORS: Record<Status, string> = {
  DRAFT: 'bg-gray-400',
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-yellow-500',
  MORE_INFO_REQUESTED: 'bg-orange-500',
  READY_FOR_DECISION: 'bg-purple-500',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  DEFERRED: 'bg-slate-400',
}

interface Props {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold whitespace-nowrap',
        STATUS_CLASSES[status],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('h-1.5 w-1.5 rounded-full shrink-0', STATUS_DOT_COLORS[status])}
      />
      {STATUS_LABELS[status]}
    </span>
  )
}
