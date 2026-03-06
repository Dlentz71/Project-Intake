import { describe, it, expect } from 'vitest'
import { validateTransition } from './transitions'

describe('validateTransition', () => {
  describe('submit', () => {
    it('allows owner with DRAFT status', () => {
      const result = validateTransition('DRAFT', 'submit', 'REQUESTER', true, {})
      expect(result.valid).toBe(true)
    })

    it('blocks non-owner', () => {
      const result = validateTransition('DRAFT', 'submit', 'REQUESTER', false, {})
      expect(result.valid).toBe(false)
      expect(result.error).toContain('owner')
    })

    it('blocks wrong status', () => {
      const result = validateTransition('SUBMITTED', 'submit', 'REQUESTER', true, {})
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Draft')
    })
  })

  describe('claim', () => {
    it('allows Reviewer with SUBMITTED status', () => {
      const result = validateTransition('SUBMITTED', 'claim', 'REVIEWER', false, {})
      expect(result.valid).toBe(true)
    })

    it('blocks non-Reviewer role', () => {
      const result = validateTransition('SUBMITTED', 'claim', 'REQUESTER', false, {})
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Reviewer')
    })

    it('blocks wrong status', () => {
      const result = validateTransition('UNDER_REVIEW', 'claim', 'REVIEWER', false, {})
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Submitted')
    })
  })

  describe('requestMoreInfo', () => {
    it('allows Reviewer with UNDER_REVIEW and comment', () => {
      const result = validateTransition('UNDER_REVIEW', 'requestMoreInfo', 'REVIEWER', false, { comment: 'Please clarify.' })
      expect(result.valid).toBe(true)
    })

    it('blocks missing comment', () => {
      const result = validateTransition('UNDER_REVIEW', 'requestMoreInfo', 'REVIEWER', false, {})
      expect(result.valid).toBe(false)
      expect(result.error).toContain('comment')
    })

    it('blocks non-Reviewer', () => {
      const result = validateTransition('UNDER_REVIEW', 'requestMoreInfo', 'DECISION_MAKER', false, { comment: 'Why?' })
      expect(result.valid).toBe(false)
    })

    it('blocks wrong status', () => {
      const result = validateTransition('SUBMITTED', 'requestMoreInfo', 'REVIEWER', false, { comment: 'Why?' })
      expect(result.valid).toBe(false)
    })
  })

  describe('resubmit', () => {
    it('allows owner with MORE_INFO_REQUESTED and comment', () => {
      const result = validateTransition('MORE_INFO_REQUESTED', 'resubmit', 'REQUESTER', true, { comment: 'Here is the info.' })
      expect(result.valid).toBe(true)
    })

    it('blocks non-owner', () => {
      const result = validateTransition('MORE_INFO_REQUESTED', 'resubmit', 'REQUESTER', false, { comment: 'Here.' })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('owner')
    })

    it('blocks missing comment', () => {
      const result = validateTransition('MORE_INFO_REQUESTED', 'resubmit', 'REQUESTER', true, {})
      expect(result.valid).toBe(false)
      expect(result.error).toContain('response comment')
    })

    it('blocks wrong status', () => {
      const result = validateTransition('UNDER_REVIEW', 'resubmit', 'REQUESTER', true, { comment: 'Here.' })
      expect(result.valid).toBe(false)
    })
  })

  describe('markReady', () => {
    it('allows Reviewer with UNDER_REVIEW', () => {
      const result = validateTransition('UNDER_REVIEW', 'markReady', 'REVIEWER', false, {})
      expect(result.valid).toBe(true)
    })

    it('blocks non-Reviewer', () => {
      const result = validateTransition('UNDER_REVIEW', 'markReady', 'DECISION_MAKER', false, {})
      expect(result.valid).toBe(false)
    })

    it('blocks wrong status', () => {
      const result = validateTransition('SUBMITTED', 'markReady', 'REVIEWER', false, {})
      expect(result.valid).toBe(false)
    })
  })

  describe('decide', () => {
    it('allows Decision Maker with READY_FOR_DECISION, outcome, and rationale', () => {
      const result = validateTransition('READY_FOR_DECISION', 'decide', 'DECISION_MAKER', false, {
        outcome: 'APPROVED',
        rationale: 'Good justification.',
      })
      expect(result.valid).toBe(true)
    })

    it('requires nextReviewDate when deferring', () => {
      const result = validateTransition('READY_FOR_DECISION', 'decide', 'DECISION_MAKER', false, {
        outcome: 'DEFERRED',
        rationale: 'Defer for now.',
      })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('next review date')
    })

    it('passes when deferring with nextReviewDate', () => {
      const result = validateTransition('READY_FOR_DECISION', 'decide', 'DECISION_MAKER', false, {
        outcome: 'DEFERRED',
        rationale: 'Defer for now.',
        nextReviewDate: '2026-12-01',
      })
      expect(result.valid).toBe(true)
    })

    it('blocks missing rationale', () => {
      const result = validateTransition('READY_FOR_DECISION', 'decide', 'DECISION_MAKER', false, {
        outcome: 'APPROVED',
        rationale: '',
      })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('rationale')
    })

    it('blocks non-Decision-Maker', () => {
      const result = validateTransition('READY_FOR_DECISION', 'decide', 'REVIEWER', false, {
        outcome: 'APPROVED',
        rationale: 'Good.',
      })
      expect(result.valid).toBe(false)
    })

    it('blocks wrong status', () => {
      const result = validateTransition('UNDER_REVIEW', 'decide', 'DECISION_MAKER', false, {
        outcome: 'APPROVED',
        rationale: 'Good.',
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('reopen', () => {
    it('allows Decision Maker with DEFERRED', () => {
      const result = validateTransition('DEFERRED', 'reopen', 'DECISION_MAKER', false, {})
      expect(result.valid).toBe(true)
    })

    it('blocks non-Decision-Maker', () => {
      const result = validateTransition('DEFERRED', 'reopen', 'REVIEWER', false, {})
      expect(result.valid).toBe(false)
    })

    it('blocks wrong status', () => {
      const result = validateTransition('APPROVED', 'reopen', 'DECISION_MAKER', false, {})
      expect(result.valid).toBe(false)
    })
  })

  describe('withdraw', () => {
    it('allows owner REQUESTER with SUBMITTED status', () => {
      const result = validateTransition('SUBMITTED', 'withdraw', 'REQUESTER', true, {})
      expect(result.valid).toBe(true)
    })

    it('allows owner REQUESTER with MORE_INFO_REQUESTED status', () => {
      const result = validateTransition('MORE_INFO_REQUESTED', 'withdraw', 'REQUESTER', true, {})
      expect(result.valid).toBe(true)
    })

    it('blocks non-REQUESTER role', () => {
      const result = validateTransition('SUBMITTED', 'withdraw', 'REVIEWER', true, {})
      expect(result.valid).toBe(false)
      expect(result.error).toContain('requester')
    })

    it('blocks non-owner', () => {
      const result = validateTransition('SUBMITTED', 'withdraw', 'REQUESTER', false, {})
      expect(result.valid).toBe(false)
      expect(result.error).toContain('submitted this request')
    })

    it('blocks UNDER_REVIEW status', () => {
      const result = validateTransition('UNDER_REVIEW', 'withdraw', 'REQUESTER', true, {})
      expect(result.valid).toBe(false)
    })

    it('blocks DRAFT status', () => {
      const result = validateTransition('DRAFT', 'withdraw', 'REQUESTER', true, {})
      expect(result.valid).toBe(false)
    })

    it('blocks terminal status APPROVED', () => {
      const result = validateTransition('APPROVED', 'withdraw', 'REQUESTER', true, {})
      expect(result.valid).toBe(false)
    })
  })
})
