import type { Metadata } from 'next'
import './globals.css'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { groupWaitingItems } from '@/lib/waiting-on'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import type { RequestWithRelations } from '@/types'
import type { NotifGroup } from '@/components/layout/NotificationBell'

export const metadata: Metadata = {
  title: { template: '%s | Request Tracker', default: 'Request Tracker' },
  description: 'Internal project request tracking system',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser()

  const allRaw = await prisma.projectRequest.findMany({
    include: { requester: true, assignedReviewer: true, decision: true },
  })
  const all = allRaw as unknown as RequestWithRelations[]
  const waitingGroups = groupWaitingItems(all, user)
  const notifGroups: NotifGroup[] = Object.entries(waitingGroups).map(([label, reqs]) => ({
    label,
    items: reqs.map((r) => ({ id: r.id, requestNumber: r.requestNumber, title: r.title })),
  }))

  return (
    <html lang="en">
      <body className="h-screen flex flex-col overflow-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <Header user={user} notifGroups={notifGroups} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar role={user.role} />
          <main id="main-content" className="flex-1 overflow-y-auto p-6" tabIndex={-1}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
