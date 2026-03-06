import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { RequestWithRelations } from '@/types'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return { title: 'Request' }
  const r = await prisma.projectRequest.findUnique({ where: { id }, select: { requestNumber: true, title: true } })
  return { title: r ? `${r.requestNumber} — ${r.title}` : 'Request' }
}
import { RequestHeader } from '@/components/request-detail/RequestHeader'
import { OverviewTab } from '@/components/request-detail/OverviewTab'
import { ActivityTab } from '@/components/request-detail/ActivityTab'
import { DecisionTab } from '@/components/request-detail/DecisionTab'
import { AuditLogTab } from '@/components/request-detail/AuditLogTab'
import { ActionButtons } from '@/components/request-detail/ActionButtons'

type Params = { params: { id: string } }

export default async function RequestDetailPage({ params }: Params) {
  const user = getCurrentUser()
  const id = parseInt(params.id, 10)
  if (isNaN(id)) notFound()

  const requestRaw = await prisma.projectRequest.findUnique({
    where: { id },
    include: {
      requester: true,
      assignedReviewer: true,
      decision: { include: { decidedBy: true } },
      comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      auditEvents: { include: { actor: true }, orderBy: { createdAt: 'asc' } },
    },
  })

  if (!requestRaw) notFound()
  const request = requestRaw as unknown as RequestWithRelations

  // Requesters can only view their own requests
  if (user.role === 'REQUESTER' && request.requesterUserId !== user.id) {
    redirect('/')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <RequestHeader request={request} />

      <ActionButtons request={request} currentUser={user} />

      <SectionNav />

      <DetailTabs request={request} user={user} />
    </div>
  )
}

function SectionNav() {
  const links = [
    { href: '#section-overview', label: 'Overview' },
    { href: '#section-activity', label: 'Activity' },
    { href: '#section-decision', label: 'Decision' },
    { href: '#section-audit', label: 'Audit Log' },
  ]
  return (
    <nav
      aria-label="Page sections"
      className="sticky top-0 z-10 -mx-1 flex gap-1 border-b bg-background/95 backdrop-blur px-1 pb-0"
    >
      {links.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {label}
        </a>
      ))}
    </nav>
  )
}

function DetailTabs({
  request,
  user,
}: {
  request: RequestWithRelations
  user: ReturnType<typeof getCurrentUser>
}) {
  return (
    <div className="space-y-6">
      <Section id="section-overview" title="Overview">
        <OverviewTab request={request} />
      </Section>

      <Section id="section-activity" title="Activity & Comments">
        <ActivityTab
          request={request}
          comments={request.comments ?? []}
          currentUser={user}
        />
      </Section>

      <Section id="section-decision" title="Decision">
        <DecisionTab decision={request.decision} />
      </Section>

      <Section id="section-audit" title="Audit Log">
        <AuditLogTab events={request.auditEvents ?? []} />
      </Section>
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-xl border shadow-sm scroll-mt-6">
      <div className="px-6 py-3 border-b bg-muted/30">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  )
}
