import type { Status, DemoUser, RequestWithRelations } from '@/types'

export function deriveWaitingOn(request: Pick<RequestWithRelations, 'status' | 'requester' | 'assignedReviewer'>): string | null {
  switch (request.status) {
    case 'SUBMITTED':
      return 'Any Reviewer'
    case 'UNDER_REVIEW':
      return request.assignedReviewer?.name ?? 'Unassigned Reviewer'
    case 'MORE_INFO_REQUESTED':
      return request.requester.name
    case 'READY_FOR_DECISION':
      return 'Decision Maker'
    case 'DEFERRED':
      return 'Decision Maker'
    case 'DRAFT':
      return request.requester.name
    default:
      return null
  }
}

export function deriveNextStep(
  request: Pick<RequestWithRelations, 'status' | 'decision'>,
): string {
  switch (request.status) {
    case 'DRAFT':
      return 'Complete required fields and submit'
    case 'SUBMITTED':
      return 'Waiting for a reviewer to claim'
    case 'UNDER_REVIEW':
      return 'Reviewer to mark ready or request more info'
    case 'MORE_INFO_REQUESTED':
      return 'Requester to respond and resubmit'
    case 'READY_FOR_DECISION':
      return 'Decision maker to approve, reject, or defer'
    case 'APPROVED':
      return 'Approved — no further action required'
    case 'REJECTED':
      return 'Rejected — no further action required'
    case 'DEFERRED': {
      const d = request.decision?.nextReviewDate
      if (d) {
        return `Review again on ${new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
      }
      return 'Deferred — awaiting next review date'
    }
    default:
      return ''
  }
}

// Returns true if the current user has a pending action on this request
export function isWaitingOnUser(request: RequestWithRelations, user: DemoUser): boolean {
  const { status, requesterUserId, assignedReviewerUserId } = request

  switch (user.role) {
    case 'REQUESTER':
      if (status === 'DRAFT' && requesterUserId === user.id) return true
      if (status === 'MORE_INFO_REQUESTED' && requesterUserId === user.id) return true
      return false

    case 'REVIEWER':
      if (status === 'SUBMITTED') return true
      if (
        (status === 'UNDER_REVIEW' || status === 'MORE_INFO_REQUESTED') &&
        assignedReviewerUserId === user.id
      )
        return true
      return false

    case 'DECISION_MAKER': {
      if (status === 'READY_FOR_DECISION') return true
      if (status === 'DEFERRED') {
        const d = request.decision?.nextReviewDate
        if (d && new Date(d) <= new Date()) return true
      }
      return false
    }

    case 'ADMIN':
      return false

    default:
      return false
  }
}

export function groupWaitingItems(
  requests: RequestWithRelations[],
  user: DemoUser,
): Record<string, RequestWithRelations[]> {
  const groups: Record<string, RequestWithRelations[]> = {}

  for (const r of requests) {
    if (!isWaitingOnUser(r, user)) continue

    let label: string
    switch (r.status) {
      case 'DRAFT':
        label = 'Your drafts ready to submit'
        break
      case 'SUBMITTED':
        label = 'Unassigned requests to claim'
        break
      case 'UNDER_REVIEW':
        label = 'Requests assigned to you'
        break
      case 'MORE_INFO_REQUESTED':
        if (user.role === 'REQUESTER') {
          label = 'Requests awaiting your response'
        } else {
          label = 'Requests assigned to you'
        }
        break
      case 'READY_FOR_DECISION':
        label = 'Requests awaiting your decision'
        break
      case 'DEFERRED':
        label = 'Deferred requests ready to reopen'
        break
      default:
        label = 'Pending'
    }

    if (!groups[label]) groups[label] = []
    groups[label].push(r)
  }

  return groups
}

// Derive the "waiting on" role label for display
export function deriveWaitingOnRole(status: Status): string | null {
  switch (status) {
    case 'SUBMITTED': return 'Reviewer'
    case 'UNDER_REVIEW': return 'Reviewer'
    case 'MORE_INFO_REQUESTED': return 'Requester'
    case 'READY_FOR_DECISION': return 'Decision Maker'
    case 'DEFERRED': return 'Decision Maker'
    default: return null
  }
}
