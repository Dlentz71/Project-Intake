'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  CheckSquare,
  BarChart2,
  Shield,
  PlusCircle,
  Inbox,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

interface Props {
  role: Role
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['REQUESTER', 'REVIEWER', 'DECISION_MAKER', 'ADMIN'] },
  { href: '/my-requests', label: 'My Requests', icon: FileText, roles: ['REQUESTER', 'ADMIN'] },
  { href: '/review-queue', label: 'Review Queue', icon: ClipboardList, roles: ['REVIEWER', 'ADMIN'] },
  { href: '/decisions', label: 'Decisions', icon: CheckSquare, roles: ['DECISION_MAKER', 'ADMIN'] },
  { href: '/reports', label: 'Reports', icon: BarChart2, roles: ['REQUESTER', 'REVIEWER', 'DECISION_MAKER', 'ADMIN'] },
  { href: '/releases', label: "What's New", icon: Sparkles, roles: ['REQUESTER', 'REVIEWER', 'DECISION_MAKER', 'ADMIN'] },
  { href: '/admin', label: 'Admin', icon: Shield, roles: ['ADMIN'] },
] as const

export function Sidebar({ role }: Props) {
  const pathname = usePathname()
  const visible = navItems.filter((item) => (item.roles as readonly string[]).includes(role))

  return (
    <aside
      className="w-60 shrink-0 flex flex-col"
      style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
    >
      {/* Brand area */}
      <div className="h-14 flex items-center gap-2.5 px-4 shrink-0 border-b border-white/10">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'hsl(var(--sidebar-active-bg))' }}
          aria-hidden="true"
        >
          <Inbox className="w-4 h-4 text-white" />
        </div>
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ color: 'hsl(var(--sidebar-active-fg))' }}
        >
          Request Tracker
        </span>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex flex-col gap-0.5 px-3 flex-1 pt-3">
        {visible.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
              )}
              style={
                isActive
                  ? { backgroundColor: 'hsl(var(--sidebar-active-bg))', color: 'hsl(var(--sidebar-active-fg))' }
                  : { color: 'hsl(var(--sidebar-fg))' }
              }
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(var(--sidebar-hover-bg))'
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = ''
              }}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* New Request CTA — only shown for REQUESTER */}
      {role === 'REQUESTER' && (
        <div className="p-3 pb-5">
          <Link
            href="/requests/new"
            className="flex items-center justify-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            <PlusCircle aria-hidden="true" className="h-4 w-4" />
            New Request
          </Link>
        </div>
      )}
    </aside>
  )
}
