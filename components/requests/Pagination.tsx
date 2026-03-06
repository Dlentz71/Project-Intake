import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
  searchParams: Record<string, string>
}

function pageHref(params: Record<string, string>, p: number): string {
  const sp = new URLSearchParams(params)
  sp.set('page', String(p))
  return `?${sp.toString()}`
}

export function Pagination({ page, totalPages, totalCount, pageSize, searchParams }: Props) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  return (
    <div className="flex items-center justify-between pt-3 text-sm text-muted-foreground">
      <span>
        Showing {from}–{to} of {totalCount} request{totalCount !== 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-1">
        {prevDisabled ? (
          <span
            aria-disabled="true"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 border text-muted-foreground/40 cursor-not-allowed select-none"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Previous
          </span>
        ) : (
          <Link
            href={pageHref(searchParams, page - 1)}
            aria-label="Go to previous page"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 border hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Previous
          </Link>
        )}

        <span className="px-3 py-1.5 text-xs">
          Page {page} of {totalPages}
        </span>

        {nextDisabled ? (
          <span
            aria-disabled="true"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 border text-muted-foreground/40 cursor-not-allowed select-none"
          >
            Next
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </span>
        ) : (
          <Link
            href={pageHref(searchParams, page + 1)}
            aria-label="Go to next page"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 border hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Next
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
