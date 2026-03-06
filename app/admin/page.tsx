import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DEMO_USERS } from '@/types'
import { AuditLogFilter } from './_AuditLogFilter'

export const metadata: Metadata = { title: 'Admin' }

const ROLE_LABELS: Record<string, string> = {
  REQUESTER: 'Requester',
  REVIEWER: 'Reviewer',
  DECISION_MAKER: 'Decision Maker',
  ADMIN: 'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  REQUESTER: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  REVIEWER: 'bg-amber-50 text-amber-700 ring-amber-200',
  DECISION_MAKER: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ADMIN: 'bg-slate-100 text-slate-700 ring-slate-200',
}

const ACCENT_CLASSES = {
  indigo: 'border-l-indigo-500',
  amber: 'border-l-amber-500',
  emerald: 'border-l-emerald-500',
  slate: 'border-l-slate-400',
} as const

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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string
  accent: keyof typeof ACCENT_CLASSES
}) {
  return (
    <div className={`rounded-lg border-l-4 border bg-card p-4 shadow-sm ${ACCENT_CLASSES[accent]}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

export default async function AdminPage() {
  const user = getCurrentUser()
  if (user.role !== 'ADMIN') redirect('/')

  const [requests, events] = await Promise.all([
    prisma.projectRequest.findMany({
      select: { id: true, requesterUserId: true, assignedReviewerUserId: true },
    }),
    prisma.auditEvent.findMany({
      include: {
        actor: true,
        projectRequest: { select: { id: true, requestNumber: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ])

  // Stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventsToday = events.filter((e) => new Date(e.createdAt) >= today).length
  const uniqueActors = new Set(events.map((e) => e.actorUserId)).size

  // User roster
  const userStats = DEMO_USERS.map((u) => ({
    ...u,
    submitted: requests.filter((r) => r.requesterUserId === u.id).length,
    reviewed: requests.filter((r) => r.assignedReviewerUserId === u.id).length,
  }))

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          System overview, user roster, and global audit log
        </p>
      </div>

      {/* System stats */}
      <section>
        <SectionHeading>System Overview</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Requests" value={requests.length} accent="indigo" />
          <StatCard label="Events Today" value={eventsToday} accent="amber" />
          <StatCard label="Total Events" value={events.length} accent="emerald" />
          <StatCard label="Active Users" value={uniqueActors} accent="slate" />
        </div>
      </section>

      {/* User roster */}
      <section>
        <SectionHeading>Users</SectionHeading>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b">
              <tr>
                <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</th>
                <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</th>
                <th scope="col" className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Submitted</th>
                <th scope="col" className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reviewed</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {userStats.map((u) => {
                const isCurrent = u.id === user.id
                return (
                  <tr key={u.id} className={isCurrent ? 'bg-muted/50' : 'hover:bg-muted/30'}>
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        {u.name}
                        {isCurrent && (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            You
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-700 ring-gray-200'}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {u.submitted > 0 ? u.submitted : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {u.reviewed > 0 ? u.reviewed : <span className="text-muted-foreground/50">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Global audit log */}
      <section>
        <SectionHeading>Audit Log</SectionHeading>
        <div className="rounded-lg border overflow-hidden">
          <div className="p-4">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit events yet.</p>
            ) : (
              <AuditLogFilter events={events} />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
