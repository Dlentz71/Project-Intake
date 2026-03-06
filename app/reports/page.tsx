import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { STATUS_LABELS, type Status } from '@/types'
import { formatDate } from '@/lib/utils'
import { VolumeChart } from '@/components/reports/VolumeChart'

export const metadata: Metadata = { title: 'Reports' }

const ALL_STATUSES: Status[] = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_INFO_REQUESTED',
  'READY_FOR_DECISION', 'APPROVED', 'REJECTED', 'DEFERRED',
]

function daysBetween(a: Date | null | undefined, b: Date | null | undefined): number | null {
  if (!a || !b) return null
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24))
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
        {children}
      </h2>
      <div className="flex-1 h-px bg-border" aria-hidden="true" />
    </div>
  )
}

export default async function ReportsPage() {
  const requests = await prisma.projectRequest.findMany({
    include: { decision: true },
    orderBy: { createdAt: 'desc' },
  })

  // Counts by status
  const countsByStatus = ALL_STATUSES.map((s) => ({
    status: s,
    count: requests.filter((r) => r.status === s).length,
  }))

  // Average age by status (days since created)
  const now = new Date()
  const avgAgeByStatus = ALL_STATUSES.map((s) => {
    const group = requests.filter((r) => r.status === s)
    if (group.length === 0) return { status: s, avgDays: null }
    const total = group.reduce((acc, r) => {
      return acc + Math.floor((now.getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    }, 0)
    return { status: s, avgDays: Math.round(total / group.length) }
  })

  // Cycle time: submitted → decision date
  const decided = requests.filter(
    (r) => r.decision && r.submittedAt && ['APPROVED', 'REJECTED', 'DEFERRED'].includes(r.status),
  )

  // Volume over time: last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (11 - i))
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    }
  })
  const volumeData = months.map(({ key, label }) => ({
    month: label,
    count: requests.filter((r) => new Date(r.createdAt).toISOString().slice(0, 7) === key).length,
  }))

  const totalPendingReview = requests.filter((r) =>
    ['SUBMITTED', 'UNDER_REVIEW', 'MORE_INFO_REQUESTED'].includes(r.status)
  ).length
  const totalReadyToDecide = requests.filter((r) => r.status === 'READY_FOR_DECISION').length
  const totalDecided = requests.filter((r) =>
    ['APPROVED', 'REJECTED', 'DEFERRED'].includes(r.status)
  ).length

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Summary statistics across all requests
        </p>
      </div>

      {/* Summary cards */}
      <section>
        <SectionHeading>Overview</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Requests" value={requests.length} accent="indigo" />
          <StatCard label="Pending Review" value={totalPendingReview} accent="amber" />
          <StatCard label="Ready to Decide" value={totalReadyToDecide} accent="violet" />
          <StatCard label="Decided" value={totalDecided} accent="emerald" />
        </div>
      </section>

      {/* Volume over time */}
      <section>
        <SectionHeading>Volume Over Time</SectionHeading>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground mb-4">Requests created — last 12 months</p>
          <VolumeChart data={volumeData} />
        </div>
      </section>

      {/* Counts by status */}
      <section>
        <SectionHeading>Requests by Status</SectionHeading>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b">
              <tr>
                <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th scope="col" className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Count</th>
                <th scope="col" className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Avg Age (days)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {countsByStatus.map(({ status, count }) => {
                const age = avgAgeByStatus.find((a) => a.status === status)?.avgDays
                return (
                  <tr key={status} className="hover:bg-muted/30">
                    <td className="px-4 py-3">{STATUS_LABELS[status]}</td>
                    <td className="px-4 py-3 text-right font-mono">{count}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground font-mono">
                      {age != null ? age : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cycle time */}
      {decided.length > 0 && (
        <section>
          <SectionHeading>Cycle Time — Submission to Decision</SectionHeading>
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b">
                  <tr>
                    <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Request</th>
                    <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outcome</th>
                    <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Submitted</th>
                    <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Decided</th>
                    <th scope="col" className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {decided.map((r) => {
                    const days = daysBetween(r.submittedAt, r.decision!.decidedAt)
                    return (
                      <tr key={r.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-muted-foreground">{r.requestNumber}</span>
                          <span className="ml-2">{r.title}</span>
                        </td>
                        <td className="px-4 py-3 capitalize">{r.decision!.outcome.toLowerCase()}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(r.submittedAt)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(r.decision!.decidedAt)}</td>
                        <td className="px-4 py-3 text-right font-mono">{days ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

const ACCENT_CLASSES = {
  indigo: 'border-l-indigo-500',
  amber: 'border-l-amber-500',
  violet: 'border-l-violet-500',
  emerald: 'border-l-emerald-500',
  slate: 'border-l-slate-400',
} as const

function StatCard({
  label,
  value,
  accent = 'slate',
}: {
  label: string
  value: number
  accent?: keyof typeof ACCENT_CLASSES
}) {
  return (
    <div className={`rounded-lg border-l-4 border bg-card p-4 shadow-sm ${ACCENT_CLASSES[accent]}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
