import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { deriveWaitingOn, deriveNextStep } from '@/lib/waiting-on'
import type { RequestWithRelations } from '@/types'

interface Props {
  request: RequestWithRelations
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs">
      <span className="font-medium text-foreground">{label}:</span>
      <span className="text-muted-foreground">{value}</span>
    </span>
  )
}

export function RequestHeader({ request }: Props) {
  const waitingOn = deriveWaitingOn(request)
  const nextStep = deriveNextStep(request)

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              Dashboard
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li className="font-medium text-foreground" aria-current="page">
            {request.requestNumber}
          </li>
        </ol>
      </nav>

      {/* Title + Status */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight">{request.title}</h1>
        <StatusBadge status={request.status} className="text-sm px-3 py-1 mt-1" />
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        <MetaChip label="Submitted by" value={request.requester.name} />
        {request.assignedReviewer && (
          <MetaChip label="Reviewer" value={request.assignedReviewer.name} />
        )}
        {waitingOn && <MetaChip label="Waiting on" value={waitingOn} />}
        <MetaChip label="Next step" value={nextStep} />
      </div>
    </div>
  )
}
