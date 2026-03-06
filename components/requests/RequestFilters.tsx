'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { DEPARTMENTS, CATEGORIES, STATUS_LABELS, type Status } from '@/types'

const ALL_STATUSES: Status[] = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_INFO_REQUESTED',
  'READY_FOR_DECISION', 'APPROVED', 'REJECTED', 'DEFERRED',
]

interface Props {
  showStatusFilter?: boolean
}

export function RequestFilters({ showStatusFilter = true }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  const clearAll = () => router.push(pathname)

  const hasFilters = searchParams.toString() !== ''

  return (
    <div role="search" aria-label="Filter requests" className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        aria-label="Search by request number or title"
        placeholder="Search by number or title…"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => update('q', e.target.value)}
        className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring w-56"
      />

      {showStatusFilter && (
        <select
          aria-label="Filter by status"
          value={searchParams.get('status') ?? ''}
          onChange={(e) => update('status', e.target.value)}
          className="border border-input rounded-md px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      )}

      <select
        aria-label="Filter by department"
        value={searchParams.get('department') ?? ''}
        onChange={(e) => update('department', e.target.value)}
        className="border border-input rounded-md px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All departments</option>
        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>

      <select
        aria-label="Filter by category"
        value={searchParams.get('category') ?? ''}
        onChange={(e) => update('category', e.target.value)}
        className="border border-input rounded-md px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-sm text-muted-foreground hover:text-foreground underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
