import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WaitingOnMeCards } from '@/components/requests/WaitingOnMeCards'
import { RequestTable } from '@/components/requests/RequestTable'
import { RequestFilters } from '@/components/requests/RequestFilters'
import { Pagination } from '@/components/requests/Pagination'
import { StatusChart } from '@/components/dashboard/StatusChart'
import { STATUS_LABELS, type Status, type RequestWithRelations } from '@/types'

export const metadata: Metadata = { title: 'Dashboard' }

const PAGE_SIZE = 25

interface SearchParams {
  status?: string
  department?: string
  category?: string
  q?: string
  sort?: string
  dir?: string
  page?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const ROLE_CONTEXT: Record<string, string> = {
  REQUESTER: 'Submit and track your project requests.',
  REVIEWER: 'Review incoming requests and prepare them for decisions.',
  DECISION_MAKER: 'Review ready requests and record decisions.',
  ADMIN: 'Overview of all requests across the organisation.',
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

const ALL_STATUSES: Status[] = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_INFO_REQUESTED',
  'READY_FOR_DECISION', 'APPROVED', 'REJECTED', 'DEFERRED',
]

const CHART_COLORS: Record<Status, string> = {
  DRAFT: '#9ca3af',
  SUBMITTED: '#3b82f6',
  UNDER_REVIEW: '#eab308',
  MORE_INFO_REQUESTED: '#f97316',
  READY_FOR_DECISION: '#a855f7',
  APPROVED: '#22c55e',
  REJECTED: '#ef4444',
  DEFERRED: '#94a3b8',
}

const SORT_ORDER: Record<string, number> = {
  DRAFT: 0, SUBMITTED: 1, UNDER_REVIEW: 2, MORE_INFO_REQUESTED: 3,
  READY_FOR_DECISION: 4, APPROVED: 5, REJECTED: 6, DEFERRED: 7,
}

function sortRequests(requests: RequestWithRelations[], sort = 'updatedAt', dir = 'desc') {
  return [...requests].sort((a, b) => {
    let cmp = 0
    if (sort === 'requestNumber') cmp = a.requestNumber.localeCompare(b.requestNumber)
    else if (sort === 'title') cmp = a.title.localeCompare(b.title)
    else if (sort === 'department') cmp = a.department.localeCompare(b.department)
    else if (sort === 'status') cmp = (SORT_ORDER[a.status] ?? 0) - (SORT_ORDER[b.status] ?? 0)
    else if (sort === 'assignedReviewer') {
      cmp = (a.assignedReviewer?.name ?? 'zzz').localeCompare(b.assignedReviewer?.name ?? 'zzz')
    } else {
      cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    }
    return dir === 'desc' ? -cmp : cmp
  })
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const user = getCurrentUser()

  const allRaw = await prisma.projectRequest.findMany({
    include: { requester: true, assignedReviewer: true, decision: true },
    orderBy: { updatedAt: 'desc' },
  })
  const all = allRaw as unknown as RequestWithRelations[]

  // Filter in JS for SQLite compatibility and search support
  const filtered = all.filter((r) => {
    if (searchParams.status && r.status !== searchParams.status) return false
    if (searchParams.department && r.department !== searchParams.department) return false
    if (searchParams.category && r.category !== searchParams.category) return false
    if (searchParams.q) {
      const q = searchParams.q.toLowerCase()
      if (!r.requestNumber.toLowerCase().includes(q) && !r.title.toLowerCase().includes(q)) return false
    }
    return true
  })

  const sort = searchParams.sort ?? 'updatedAt'
  const dir = (searchParams.dir === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
  const sorted = sortRequests(filtered, sort, dir)

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const totalCount = sorted.length
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasFilters = !!(searchParams.status || searchParams.department || searchParams.category || searchParams.q)
  const firstName = user.name.split(' ')[0]

  const statusData = ALL_STATUSES.map((s) => ({
    status: s,
    label: STATUS_LABELS[s],
    count: all.filter((r) => r.status === s).length,
    color: CHART_COLORS[s],
  }))

  const spRecord: Record<string, string> = Object.fromEntries(
    Object.entries(searchParams).filter(([, v]) => v != null) as [string, string][]
  )

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}, {firstName}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{ROLE_CONTEXT[user.role] ?? ''}</p>
      </div>

      <section>
        <SectionHeading>Waiting on You</SectionHeading>
        <WaitingOnMeCards requests={all} user={user} />
      </section>

      <section>
        <SectionHeading>Pipeline Status</SectionHeading>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <StatusChart data={statusData} />
        </div>
      </section>

      <section>
        <SectionHeading>All Requests</SectionHeading>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <RequestFilters />
          <span className="text-sm text-muted-foreground shrink-0">
            {totalCount} request{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        <RequestTable
          requests={paginated}
          emptyMessage={hasFilters ? 'No requests match your filters. Try clearing them.' : 'No requests yet.'}
          sortKey={sort}
          sortDir={dir}
          searchParams={spRecord}
        />
        <Pagination page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} searchParams={spRecord} />
      </section>
    </div>
  )
}
