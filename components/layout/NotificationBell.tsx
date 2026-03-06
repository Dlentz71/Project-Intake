'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

export type NotifGroup = {
  label: string
  items: { id: number; requestNumber: string; title: string }[]
}

interface Props {
  notifGroups: NotifGroup[]
}

export function NotificationBell({ notifGroups }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const totalCount = notifGroups.reduce((acc, g) => acc + g.items.length, 0)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        aria-label={totalCount > 0 ? `Notifications (${totalCount} pending)` : 'Notifications'}
        aria-expanded={open}
        onClick={() => {
          if (totalCount === 0) { window.location.href = '/'; return }
          setOpen((v) => !v)
        }}
        className="relative rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {totalCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none"
          >
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-popover shadow-lg z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{totalCount} item{totalCount !== 1 ? 's' : ''} waiting for your action</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifGroups.map((group) => (
              <div key={group.label} className="px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/requests/${item.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                      >
                        <span className="font-mono text-xs text-primary shrink-0 mt-0.5">{item.requestNumber}</span>
                        <span className="line-clamp-1 text-foreground">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t bg-muted/40">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="text-xs text-primary hover:underline font-medium"
            >
              View all on Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
