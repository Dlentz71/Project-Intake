import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RequestTable } from '@/components/requests/RequestTable'
import { RequestFilters } from '@/components/requests/RequestFilters'
import { Pagination } from '@/components/requests/Pagination'
import type { RequestWithRelations } from '@/types'

export const metadata: Metadata = { title: 'Review Queue' }

const PAGE_SIZE = 25

interface SearchParams {
  department?: string
  category?: string
  q?: string
  sort?: string
  dir?: string
  page?: string
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

export default async function ReviewQueuePage({ searchParams }: { searchParams: SearchParams }) {
  const user = getCurrentUser()

  // Unassigned submitted requests + requests assigned to current reviewer
  const requestsRaw = await prisma.projectRequest.findMany({
    where: {
      OR: [
        { status: 'SUBMITTED' },
        {
          status: { in: ['UNDER_REVIEW', 'MORE_INFO_REQUESTED'] },
          assignedReviewerUserId: user.role === 'REVIEWER' ? user.id : undefined,
        },
      ],
    },
    include: { requester: true, assignedReviewer: true, decision: true },
    orderBy: { updatedAt: 'desc' },
  })
  const requests = requestsRaw as unknown as RequestWithRelations[]

  const filtered = requests.filter((r) => {
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

  const spRecord: Record<string, string> = Object.fromEntries(
    Object.entries(searchParams).filter(([, v]) => v != null) as [string, string][]
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Review Queue</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Submitted requests awaiting claim, and requests assigned to you
        </p>
      </div>

      <RequestFilters showStatusFilter={false} />
      <RequestTable
        requests={paginated}
        emptyMessage="No requests in the review queue right now."
        sortKey={sort}
        sortDir={dir}
        searchParams={spRecord}
      />
      <Pagination page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} searchParams={spRecord} />
    </div>
  )
}
