import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatRequestNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const actor = getCurrentUser()
  if (actor.role !== 'REQUESTER') {
    return NextResponse.json({ error: 'Only Requesters can create requests.' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, description, department, category, businessJustification, estimatedCost, targetStartDate, targetEndDate, priority, impact } = body

    if (!title?.trim()) return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
    if (!department?.trim()) return NextResponse.json({ error: 'Department is required.' }, { status: 400 })
    if (!category?.trim()) return NextResponse.json({ error: 'Category is required.' }, { status: 400 })

    const newRequest = await prisma.$transaction(async (tx) => {
      const r = await tx.projectRequest.create({
        data: {
          requestNumber: 'TEMP',
          title: title.trim(),
          description: description?.trim() || null,
          department,
          category,
          businessJustification: businessJustification?.trim() || '',
          estimatedCost: estimatedCost ? Number(estimatedCost) : null,
          targetStartDate: targetStartDate ? new Date(targetStartDate) : null,
          targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
          priority: priority?.trim() || null,
          impact: impact?.trim() || null,
          status: 'DRAFT',
          requesterUserId: actor.id,
        },
      })

      const requestNumber = formatRequestNumber(r.id)
      await tx.projectRequest.update({
        where: { id: r.id },
        data: { requestNumber },
      })

      await tx.auditEvent.create({
        data: {
          projectRequestId: r.id,
          actorUserId: actor.id,
          eventType: 'CREATED',
        },
      })

      return { ...r, requestNumber }
    })

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 })
  } catch (err) {
    console.error('POST /api/requests error:', err)
    return NextResponse.json({ error: 'Failed to create request.' }, { status: 500 })
  }
}
