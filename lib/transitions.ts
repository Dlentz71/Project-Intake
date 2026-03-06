import { prisma } from '@/lib/prisma'
import type { Status, Role, Outcome, DemoUser, TransitionAction, TransitionPayload, TransitionResult } from '@/types'

// Pure validation — no DB calls, fully testable.
export function validateTransition(
  currentStatus: Status,
  action: TransitionAction,
  actorRole: Role,
  isOwner: boolean,
  payload: TransitionPayload,
): { valid: boolean; error?: string } {
  switch (action) {
    case 'submit':
      if (!isOwner) return { valid: false, error: 'Only the request owner can submit.' }
      if (currentStatus !== 'DRAFT')
        return { valid: false, error: 'Only Draft requests can be submitted.' }
      return { valid: true }

    case 'claim':
      if (actorRole !== 'REVIEWER')
        return { valid: false, error: 'Only Reviewers can claim requests.' }
      if (currentStatus !== 'SUBMITTED')
        return { valid: false, error: 'Only Submitted requests can be claimed.' }
      return { valid: true }

    case 'requestMoreInfo':
      if (actorRole !== 'REVIEWER')
        return { valid: false, error: 'Only Reviewers can request more information.' }
      if (currentStatus !== 'UNDER_REVIEW')
        return {
          valid: false,
          error: 'Requests must be Under Review to request more information.',
        }
      if (!payload.comment?.trim())
        return { valid: false, error: 'A comment is required when requesting more information.' }
      return { valid: true }

    case 'resubmit':
      if (!isOwner)
        return { valid: false, error: 'Only the request owner can respond and resubmit.' }
      if (currentStatus !== 'MORE_INFO_REQUESTED')
        return {
          valid: false,
          error: 'Only requests awaiting more information can be resubmitted.',
        }
      if (!payload.comment?.trim())
        return { valid: false, error: 'A response comment is required before resubmitting.' }
      return { valid: true }

    case 'markReady':
      if (actorRole !== 'REVIEWER')
        return { valid: false, error: 'Only Reviewers can mark requests ready for decision.' }
      if (currentStatus !== 'UNDER_REVIEW')
        return {
          valid: false,
          error: 'Requests must be Under Review to be marked ready for decision.',
        }
      return { valid: true }

    case 'decide':
      if (actorRole !== 'DECISION_MAKER')
        return { valid: false, error: 'Only Decision Makers can record decisions.' }
      if (currentStatus !== 'READY_FOR_DECISION')
        return {
          valid: false,
          error: 'Requests must be Ready for Decision before a decision can be recorded.',
        }
      if (!payload.outcome) return { valid: false, error: 'An outcome is required.' }
      if (!payload.rationale?.trim())
        return { valid: false, error: 'A rationale is required for all decisions.' }
      if (payload.outcome === 'DEFERRED' && !payload.nextReviewDate)
        return { valid: false, error: 'A next review date is required when deferring a request.' }
      return { valid: true }

    case 'reopen':
      if (actorRole !== 'DECISION_MAKER')
        return { valid: false, error: 'Only Decision Makers can reopen deferred requests.' }
      if (currentStatus !== 'DEFERRED')
        return { valid: false, error: 'Only Deferred requests can be reopened.' }
      return { valid: true }

    case 'withdraw':
      if (actorRole !== 'REQUESTER')
        return { valid: false, error: 'Only the requester can withdraw a request.' }
      if (!isOwner)
        return { valid: false, error: 'Only the requester who submitted this request can withdraw it.' }
      if (currentStatus !== 'SUBMITTED' && currentStatus !== 'MORE_INFO_REQUESTED')
        return { valid: false, error: 'Only Submitted or More Info Requested requests can be withdrawn.' }
      return { valid: true }

    default:
      return { valid: false, error: 'Unknown action.' }
  }
}

const ACTION_TO_STATUS: Record<Exclude<TransitionAction, 'decide'>, Status> = {
  submit: 'SUBMITTED',
  claim: 'UNDER_REVIEW',
  requestMoreInfo: 'MORE_INFO_REQUESTED',
  resubmit: 'UNDER_REVIEW',
  markReady: 'READY_FOR_DECISION',
  reopen: 'READY_FOR_DECISION',
  withdraw: 'DRAFT',
}

export async function transitionRequest(
  requestId: number,
  action: TransitionAction,
  actor: DemoUser,
  payload: TransitionPayload = {},
): Promise<TransitionResult> {
  const request = await prisma.projectRequest.findUnique({ where: { id: requestId } })
  if (!request) return { success: false, error: 'Request not found.' }

  const isOwner = request.requesterUserId === actor.id
  const validation = validateTransition(request.status as Status, action, actor.role, isOwner, payload)
  if (!validation.valid) return { success: false, error: validation.error }

  const newStatus: Status =
    action === 'decide' ? (payload.outcome as unknown as Status) : ACTION_TO_STATUS[action]

  try {
    await prisma.$transaction(async (tx) => {
      // Build request update
      const updates: Record<string, unknown> = { status: newStatus }
      if (action === 'submit') updates.submittedAt = new Date()
      if (action === 'claim') updates.assignedReviewerUserId = actor.id
      if (action === 'withdraw') updates.assignedReviewerUserId = null

      await tx.projectRequest.update({ where: { id: requestId }, data: updates })

      // Comment for requestMoreInfo
      if (action === 'requestMoreInfo' && payload.comment) {
        await tx.comment.create({
          data: {
            projectRequestId: requestId,
            authorUserId: actor.id,
            body: payload.comment,
            type: 'MORE_INFO_REQUEST',
          },
        })
        await tx.auditEvent.create({
          data: {
            projectRequestId: requestId,
            actorUserId: actor.id,
            eventType: 'COMMENT_ADDED',
            newValue: 'More Info Request',
          },
        })
      }

      // Comment for resubmit
      if (action === 'resubmit' && payload.comment) {
        await tx.comment.create({
          data: {
            projectRequestId: requestId,
            authorUserId: actor.id,
            body: payload.comment,
            type: 'RESPONSE',
          },
        })
        await tx.auditEvent.create({
          data: {
            projectRequestId: requestId,
            actorUserId: actor.id,
            eventType: 'COMMENT_ADDED',
            newValue: 'Response',
          },
        })
      }

      // Decision record
      if (action === 'decide') {
        const outcome = payload.outcome as Outcome
        await tx.decision.upsert({
          where: { projectRequestId: requestId },
          create: {
            projectRequestId: requestId,
            outcome,
            rationale: payload.rationale!,
            decidedByUserId: actor.id,
            nextReviewDate: payload.nextReviewDate ? new Date(payload.nextReviewDate) : null,
          },
          update: {
            outcome,
            rationale: payload.rationale!,
            decidedByUserId: actor.id,
            decidedAt: new Date(),
            nextReviewDate: payload.nextReviewDate ? new Date(payload.nextReviewDate) : null,
          },
        })
        await tx.auditEvent.create({
          data: {
            projectRequestId: requestId,
            actorUserId: actor.id,
            eventType: 'DECISION_RECORDED',
            newValue: outcome,
          },
        })
      }

      // Assignment audit
      if (action === 'claim') {
        await tx.auditEvent.create({
          data: {
            projectRequestId: requestId,
            actorUserId: actor.id,
            eventType: 'ASSIGNMENT_CHANGED',
            oldValue: null,
            newValue: actor.name,
          },
        })
      }

      // Status change audit (always)
      await tx.auditEvent.create({
        data: {
          projectRequestId: requestId,
          actorUserId: actor.id,
          eventType: 'STATUS_CHANGED',
          oldValue: request.status,
          newValue: newStatus,
        },
      })
    })

    return { success: true }
  } catch (err) {
    console.error('transitionRequest error:', err)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

// Audited field edits on Draft requests
const AUDITED_FIELDS = [
  'title',
  'department',
  'category',
  'businessJustification',
  'estimatedCost',
] as const

export async function patchRequest(
  requestId: number,
  actor: DemoUser,
  data: Partial<{
    title: string
    description: string
    department: string
    category: string
    businessJustification: string
    estimatedCost: number | null
    targetStartDate: string | null
    targetEndDate: string | null
    priority: string
    impact: string
  }>,
): Promise<TransitionResult> {
  const request = await prisma.projectRequest.findUnique({ where: { id: requestId } })
  if (!request) return { success: false, error: 'Request not found.' }
  if (request.requesterUserId !== actor.id)
    return { success: false, error: 'Only the request owner can edit this request.' }
  if (request.status !== 'DRAFT')
    return { success: false, error: 'Only Draft requests can be edited.' }

  try {
    await prisma.$transaction(async (tx) => {
      // Audit changed audited fields
      for (const field of AUDITED_FIELDS) {
        if (field in data) {
          const oldVal = String(request[field as keyof typeof request] ?? '')
          const newVal = String(data[field as keyof typeof data] ?? '')
          if (oldVal !== newVal) {
            await tx.auditEvent.create({
              data: {
                projectRequestId: requestId,
                actorUserId: actor.id,
                eventType: 'FIELD_CHANGED',
                fieldName: field,
                oldValue: oldVal || null,
                newValue: newVal || null,
              },
            })
          }
        }
      }

      await tx.projectRequest.update({
        where: { id: requestId },
        data: {
          ...data,
          targetStartDate: data.targetStartDate ? new Date(data.targetStartDate) : undefined,
          targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : undefined,
        },
      })
    })

    return { success: true }
  } catch (err) {
    console.error('patchRequest error:', err)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}
