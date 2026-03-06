import Link from 'next/link'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { RequestWithRelations } from '@/types'

interface Props {
  requests: RequestWithRelations[]
  emptyMessage?: string
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  searchParams?: Record<string, string>
}

function sortHref(params: Record<string, string>, col: string): string {
  const p = new URLSearchParams(params)
  const isSame = p.get('sort') === col
  const currentDir = p.get('dir') ?? 'desc'
  p.set('sort', col)
  p.set('dir', isSame && currentDir === 'asc' ? 'desc' : 'asc')
  p.delete('page')
  return `?${p.toString()}`
}

function SortIcon({ col, sortKey, sortDir }: { col: string; sortKey?: string; sortDir?: string }) {
  if (sortKey !== col) return <ChevronsUpDown aria-hidden="true" className="h-3.5 w-3.5 opacity-40 ml-1 inline-block" />
  return sortDir === 'asc'
    ? <ChevronUp aria-hidden="true" className="h-3.5 w-3.5 ml-1 inline-block text-primary" />
    : <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 ml-1 inline-block text-primary" />
}

type SortableCol = { key: string; label: string; className: string; ariaSort?: 'ascending' | 'descending' | 'none' }

export function RequestTable({
  requests,
  emptyMessage = 'No requests found.',
  sortKey,
  sortDir,
  searchParams = {},
}: Props) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/40 p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  const cols: SortableCol[] = [
    { key: 'requestNumber', label: 'Number', className: 'whitespace-nowrap' },
    { key: 'title', label: 'Title', className: '' },
    { key: 'department', label: 'Dept', className: 'whitespace-nowrap' },
    { key: 'status', label: 'Status', className: '' },
    { key: 'assignedReviewer', label: 'Assigned To', className: 'whitespace-nowrap' },
    { key: 'updatedAt', label: 'Updated', className: 'whitespace-nowrap' },
  ]

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b">
            <tr>
              {cols.map((col) => {
                const isActive = sortKey === col.key
                const ariaSort = isActive ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${col.className}`}
                  >
                    <Link
                      href={sortHref(searchParams, col.key)}
                      className={`inline-flex items-center hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded ${isActive ? 'text-foreground' : ''}`}
                    >
                      {col.label}
                      <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                    </Link>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.map((r) => (
              <tr key={r.id} className="relative hover:bg-accent/60 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-mono text-xs text-primary">{r.requestNumber}</span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/requests/${r.id}`}
                    aria-label={`View request ${r.requestNumber}: ${r.title}`}
                    className="font-medium line-clamp-1 after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{r.department}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {r.assignedReviewer?.name ?? <span className="text-muted-foreground/50">—</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {formatDate(r.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
