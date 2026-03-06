import { formatDate, formatCurrency } from '@/lib/utils'
import type { RequestWithRelations } from '@/types'

interface Props {
  request: RequestWithRelations
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm">{value ?? <span className="text-muted-foreground/50">—</span>}</dd>
    </div>
  )
}

export function OverviewTab({ request }: Props) {
  return (
    <div className="space-y-6">
      {request.description && (
        <div>
          <h3 className="text-sm font-semibold mb-1">Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.description}</p>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2">Business Justification</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.businessJustification}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Department" value={request.department} />
        <Field label="Category" value={request.category} />
        <Field label="Priority" value={request.priority} />
        <Field label="Estimated Cost" value={formatCurrency(request.estimatedCost)} />
        <Field label="Target Start" value={formatDate(request.targetStartDate)} />
        <Field label="Target End" value={formatDate(request.targetEndDate)} />
      </div>

      {request.impact && (
        <div>
          <h3 className="text-sm font-semibold mb-1">Impact</h3>
          <p className="text-sm text-muted-foreground">{request.impact}</p>
        </div>
      )}

      <div className="border-t pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
        <Field label="Created" value={formatDate(request.createdAt)} />
        <Field label="Submitted" value={formatDate(request.submittedAt)} />
        <Field label="Last updated" value={formatDate(request.updatedAt)} />
      </div>
    </div>
  )
}
