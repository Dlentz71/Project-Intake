import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { RequestWithRelations } from '@/types'
import { EditRequestForm } from './_EditRequestForm'

type Params = { params: { id: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return { title: 'Edit Request' }
  const r = await prisma.projectRequest.findUnique({ where: { id }, select: { requestNumber: true } })
  return { title: r ? `Edit ${r.requestNumber}` : 'Edit Request' }
}

export default async function EditRequestPage({ params }: Params) {
  const user = getCurrentUser()
  const id = parseInt(params.id, 10)
  if (isNaN(id)) notFound()

  const requestRaw = await prisma.projectRequest.findUnique({
    where: { id },
    include: { requester: true, assignedReviewer: true, decision: true },
  })

  if (!requestRaw) notFound()
  const request = requestRaw as unknown as RequestWithRelations

  // Only DRAFT requests can be edited
  if (request.status !== 'DRAFT') redirect(`/requests/${id}`)

  // Only the owner can edit
  if (request.requesterUserId !== user.id) redirect('/')

  return (
    <div className="max-w-2xl mx-auto">
      <EditRequestForm request={request} />
    </div>
  )
}
