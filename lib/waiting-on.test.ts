import { describe, it, expect } from 'vitest'
import { isWaitingOnUser, deriveNextStep, deriveWaitingOn } from './waiting-on'
import type { RequestWithRelations, DemoUser } from '@/types'

function makeRequest(overrides: Partial<RequestWithRelations>): RequestWithRelations {
  return {
    id: 1,
    requestNumber: 'PRJ-000001',
    title: 'Test',
    description: null,
    department: 'Engineering',
    category: 'Tool/Software',
    businessJustification: 'Testing',
    estimatedCost: null,
    targetStartDate: null,
    targetEndDate: null,
    priority: null,
    impact: null,
    status: 'DRAFT',
    requesterUserId: 1,
    assignedReviewerUserId: null,
    submittedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    requester: { id: 1, name: 'Requester1', role: 'REQUESTER' },
    assignedReviewer: null,
    decision: null,
    ...overrides,
  }
}

const requester: DemoUser = { id: 1, name: 'Requester1', role: 'REQUESTER' }
const reviewer: DemoUser = { id: 2, name: 'Reviewer1', role: 'REVIEWER' }
const decisionMaker: DemoUser = { id: 3, name: 'Approver1', role: 'DECISION_MAKER' }
const admin: DemoUser = { id: 4, name: 'Admin1', role: 'ADMIN' }

describe('isWaitingOnUser', () => {
  it('SUBMITTED — waiting on any Reviewer', () => {
    const r = makeRequest({ status: 'SUBMITTED' })
    expect(isWaitingOnUser(r, reviewer)).toBe(true)
    expect(isWaitingOnUser(r, requester)).toBe(false)
    expect(isWaitingOnUser(r, decisionMaker)).toBe(false)
  })

  it('MORE_INFO_REQUESTED — waiting on the requester (owner)', () => {
    const r = makeRequest({ status: 'MORE_INFO_REQUESTED', requesterUserId: 1 })
    expect(isWaitingOnUser(r, requester)).toBe(true)
    // Different requester
    const other: DemoUser = { id: 99, name: 'Other', role: 'REQUESTER' }
    expect(isWaitingOnUser(makeRequest({ status: 'MORE_INFO_REQUESTED', requesterUserId: 99 }), requester)).toBe(false)
  })

  it('READY_FOR_DECISION — waiting on Decision Maker', () => {
    const r = makeRequest({ status: 'READY_FOR_DECISION' })
    expect(isWaitingOnUser(r, decisionMaker)).toBe(true)
    expect(isWaitingOnUser(r, reviewer)).toBe(false)
  })

  it('UNDER_REVIEW — waiting on assigned reviewer', () => {
    const r = makeRequest({ status: 'UNDER_REVIEW', assignedReviewerUserId: 2 })
    expect(isWaitingOnUser(r, reviewer)).toBe(true)
    const otherReviewer: DemoUser = { id: 99, name: 'Other', role: 'REVIEWER' }
    expect(isWaitingOnUser(r, otherReviewer)).toBe(false)
  })

  it('Admin is never waiting', () => {
    const r = makeRequest({ status: 'READY_FOR_DECISION' })
    expect(isWaitingOnUser(r, admin)).toBe(false)
  })

  it('Terminal statuses — nobody waiting', () => {
    const approved = makeRequest({ status: 'APPROVED' })
    expect(isWaitingOnUser(approved, requester)).toBe(false)
    expect(isWaitingOnUser(approved, reviewer)).toBe(false)
    expect(isWaitingOnUser(approved, decisionMaker)).toBe(false)
  })
})

describe('deriveNextStep', () => {
  it('DRAFT — prompts to submit', () => {
    expect(deriveNextStep(makeRequest({ status: 'DRAFT' }))).toContain('submit')
  })

  it('APPROVED — no further action', () => {
    expect(deriveNextStep(makeRequest({ status: 'APPROVED' }))).toContain('no further action')
  })

  it('DEFERRED with date — shows review date', () => {
    const r = makeRequest({
      status: 'DEFERRED',
      decision: {
        id: 1,
        projectRequestId: 1,
        outcome: 'DEFERRED',
        rationale: 'Later',
        decidedByUserId: 3,
        decidedAt: new Date(),
        nextReviewDate: new Date('2026-12-15'),
      },
    })
    const step = deriveNextStep(r)
    expect(step).toContain('Dec')
  })
})

describe('deriveWaitingOn', () => {
  it('SUBMITTED — any Reviewer', () => {
    const r = makeRequest({ status: 'SUBMITTED' })
    expect(deriveWaitingOn(r)).toBe('Any Reviewer')
  })

  it('UNDER_REVIEW — named reviewer', () => {
    const r = makeRequest({
      status: 'UNDER_REVIEW',
      assignedReviewer: { id: 2, name: 'Reviewer1', role: 'REVIEWER' },
    })
    expect(deriveWaitingOn(r)).toBe('Reviewer1')
  })

  it('MORE_INFO_REQUESTED — requester name', () => {
    const r = makeRequest({ status: 'MORE_INFO_REQUESTED' })
    expect(deriveWaitingOn(r)).toBe('Requester1')
  })
})
