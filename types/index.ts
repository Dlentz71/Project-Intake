// SQLite doesn't support Prisma enums — union types defined here directly.

export type Role = 'REQUESTER' | 'REVIEWER' | 'DECISION_MAKER' | 'ADMIN'

export type Status =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'MORE_INFO_REQUESTED'
  | 'READY_FOR_DECISION'
  | 'APPROVED'
  | 'REJECTED'
  | 'DEFERRED'

export type CommentType = 'GENERAL' | 'MORE_INFO_REQUEST' | 'RESPONSE'

export type Outcome = 'APPROVED' | 'REJECTED' | 'DEFERRED'

export type EventType =
  | 'CREATED'
  | 'FIELD_CHANGED'
  | 'STATUS_CHANGED'
  | 'ASSIGNMENT_CHANGED'
  | 'COMMENT_ADDED'
  | 'DECISION_RECORDED'

export interface DemoUser {
  id: number
  name: string
  role: Role
}

export const DEMO_USERS: DemoUser[] = [
  { id: 1, name: 'Requester1', role: 'REQUESTER' },
  { id: 2, name: 'Reviewer1', role: 'REVIEWER' },
  { id: 3, name: 'Approver1', role: 'DECISION_MAKER' },
  { id: 4, name: 'Admin1', role: 'ADMIN' },
]

export type TransitionAction =
  | 'submit'
  | 'claim'
  | 'requestMoreInfo'
  | 'resubmit'
  | 'markReady'
  | 'decide'
  | 'reopen'
  | 'withdraw'

export interface TransitionPayload {
  comment?: string
  outcome?: Outcome
  rationale?: string
  nextReviewDate?: string
}

export interface TransitionResult {
  success: boolean
  error?: string
}

export type RequestWithRelations = {
  id: number
  requestNumber: string
  title: string
  description: string | null
  department: string
  category: string
  businessJustification: string
  estimatedCost: number | null
  targetStartDate: Date | null
  targetEndDate: Date | null
  priority: string | null
  impact: string | null
  status: Status
  requesterUserId: number
  assignedReviewerUserId: number | null
  submittedAt: Date | null
  createdAt: Date
  updatedAt: Date
  requester: { id: number; name: string; role: Role }
  assignedReviewer: { id: number; name: string; role: Role } | null
  decision: DecisionRecord | null
  comments?: CommentRecord[]
  auditEvents?: AuditRecord[]
}

export type CommentRecord = {
  id: number
  projectRequestId: number
  authorUserId: number
  body: string
  type: CommentType
  createdAt: Date
  author: { id: number; name: string; role: Role }
}

export type DecisionRecord = {
  id: number
  projectRequestId: number
  outcome: Outcome
  rationale: string
  decidedByUserId: number
  decidedAt: Date
  nextReviewDate: Date | null
  decidedBy?: { id: number; name: string; role: Role }
}

export type AuditRecord = {
  id: number
  projectRequestId: number
  actorUserId: number
  eventType: EventType
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  createdAt: Date
  actor: { id: number; name: string; role: Role }
}

export const STATUS_LABELS: Record<Status, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  MORE_INFO_REQUESTED: 'More Info Requested',
  READY_FOR_DECISION: 'Ready for Decision',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DEFERRED: 'Deferred',
}

export const DEPARTMENTS = [
  'Engineering',
  'Finance',
  'HR',
  'Legal',
  'Marketing',
  'Operations',
]

export const CATEGORIES = [
  'Budget Approval',
  'Headcount',
  'Infrastructure',
  'Process Change',
  'Tool/Software',
  'Vendor Contract',
]

export const TERMINAL_STATUSES: Status[] = ['APPROVED', 'REJECTED']

export const COOKIE_NAME = 'demo_user_id'
