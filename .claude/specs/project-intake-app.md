# Feature: Project Intake App

> **Status**: Approved
> **Spec file**: `.claude/specs/project-intake-app.md`
> **Created**: 2026-03-04

## Problem

Internal teams lack a structured way to track requests from initial idea through final decision. Without a clear workflow, requests stall in email threads, reviewers don't know what's waiting on them, and there's no record of why decisions were made.

## Users & Roles

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| Requester | Create/edit Draft requests; submit; view own requests; respond to More Info Requested | View others' requests; claim/assign; record decisions |
| Reviewer | View review queue; claim/assign requests; request more info; mark Ready for Decision | Create requests; record final decisions |
| Decision Maker | Record Approve/Reject/Defer decisions with rationale | Create requests; claim/assign |
| Admin | Read-only overlay — view all requests and global audit log; no write actions of any kind | Create, edit, or action any request |

Demo auth: role/user switching via a dropdown — no passwords. Selected user stored in cookie. Four demo users: Requester1 (Requester), Reviewer1 (Reviewer), Approver1 (Decision Maker), Admin1 (Admin). Admin1 has no write role.

## User Stories

- As a **Requester**, I want to create a Draft request and save it before submitting, so I can prepare it over multiple sessions.
- As a **Requester**, I want to submit my request once it's complete, so it enters the review queue.
- As a **Requester**, I want to see what's waiting on me on my dashboard, so I don't miss a More Info request.
- As a **Requester**, I want to respond to a More Info request and resubmit, so the review can continue.
- As a **Reviewer**, I want to claim an unassigned request, so ownership is clear.
- As a **Reviewer**, I want to request more info with a comment, so I can get what I need before escalating.
- As a **Reviewer**, I want to mark a request Ready for Decision, so it routes to a Decision Maker.
- As a **Decision Maker**, I want to record Approve/Reject/Defer with a written rationale, so the decision is documented.
- As a **Decision Maker**, I want to set a Next Review Date when deferring, so deferred items don't get lost.
- As an **Admin**, I want to see the full audit log for any request, so I can reconstruct exactly what happened and when.

## Acceptance Criteria

### Status Transitions
- [ ] Draft → Submitted blocked unless Title, Department, Category, and BusinessJustification are filled in
- [ ] Submitted → Under Review only when a reviewer claims or is assigned to the request
- [ ] Under Review → More Info Requested only when a MoreInfoRequest comment is added
- [ ] More Info Requested → Under Review only when requester adds a Response comment and triggers resubmit action
- [ ] Under Review → Ready for Decision available to Reviewer
- [ ] Ready for Decision → Approved/Rejected/Deferred only with a Decision record including Rationale; Deferred also requires NextReviewDate
- [ ] Deferred → Ready for Decision via a Reopen action
- [ ] Approved and Rejected are terminal — no further status transitions or write actions are possible; UI shows the decision summary only
- [ ] UI only shows actions valid for the current user's role + current status; invalid actions show a friendly explanation, not a raw error
- [ ] If two Reviewers attempt to claim the same request simultaneously, last-writer-wins is acceptable; no special locking required at demo scale

### Request Fields
- [ ] Required at submission: Title (≤ 200 chars), Department, Category, BusinessJustification (≤ 5000 chars)
- [ ] Optional: Description (≤ 5000 chars), EstimatedCost, TargetStartDate, TargetEndDate, Priority, Impact (≤ 1000 chars)
- [ ] Validation errors shown inline on the relevant field; a summary error appears at the top of the form if submission is attempted while errors remain
- [ ] RequestNumber auto-generated post-insert as `PRJ-${id.toString().padStart(6, '0')}` using the auto-increment primary key — no MAX query needed

### "Waiting on Me" Logic
- [ ] SUBMITTED with no assigned reviewer → shown in Reviewer's "Waiting on Me"
- [ ] MORE_INFO_REQUESTED where requesterUserId = current user → shown in Requester's "Waiting on Me"
- [ ] READY_FOR_DECISION → shown in Decision Maker's "Waiting on Me"
- [ ] DEFERRED where NextReviewDate ≤ today → shown in Decision Maker's "Waiting on Me"
- [ ] Dashboard "Waiting on Me" section shows an empty-state message ("Nothing waiting on you right now") when there are no pending items

### Audit Trail
- [ ] AuditEvent written for: request created, status changed, assignment changed, comment added, decision recorded
- [ ] AuditEvent written for field changes to: Title, Department, Category, BusinessJustification, EstimatedCost
- [ ] Audit events are written server-side only; actor identity comes from the session cookie, never from the client request body
- [ ] Audit log visible on request detail page to all roles — by design, Requesters can see all reviewer and audit activity on their own request
- [ ] Global audit log (all requests, all actors) visible to Admin only via the Admin nav section

### Dashboard
- [ ] "Waiting on Me" cards at top (one card per pending action type); empty state shown when nothing is pending
- [ ] Request grid with filters: status, department, category; filter controls show "All" by default
- [ ] Search by RequestNumber or title
- [ ] Each row shows a derived "Next step" label
- [ ] Empty grid state shows "No requests found" message with a prompt to clear filters if any are active

### Request Detail Page
- [ ] Header: Status pill, "Waiting on" (derived), "Next step" (derived), assigned reviewer name
- [ ] Sections: Overview, Activity (comments + audit inline), Decision, Audit Log
- [ ] Action buttons rendered conditionally by role + status
- [ ] Decision tab shows "No decision recorded yet" when request has not been decided

### Reports Page
- [ ] Count of requests by status (all statuses shown, zero counts included)
- [ ] Average age (days) by status
- [ ] Cycle time table: list of decided requests with submitted date, decision date, and days elapsed

### Seed Data
- [ ] 4 demo users: Requester1 (Requester), Reviewer1 (Reviewer), Approver1 (Decision Maker), Admin1 (Admin)
- [ ] At least 15 requests distributed across all statuses, with varied departments and categories
- [ ] At least a few comments of each type (General, MoreInfoRequest, Response)
- [ ] At least 3 decisions (at least one each of Approved, Rejected, Deferred)

### Navigation
- [ ] Left nav: Dashboard, My Requests, Review Queue, Decisions, Reports, Admin (Admin only)
- [ ] Active nav item highlighted; user always knows where they are
- [ ] Responsive layout (mobile usable)

## Out of Scope

- Email or in-app notifications
- File/attachment uploads
- Real authentication (passwords, OAuth, SSO)
- Multi-tenant or multi-org support
- Role management UI (roles are hardcoded to demo users)
- Request deletion
- Comment editing or deletion
- Reopening Approved or Rejected requests

## Data Model Changes

```prisma
model ProjectRequest {
  id                     Int       @id @default(autoincrement())
  requestNumber          String    @unique  // PRJ-000123, set post-insert
  title                  String
  description            String?
  department             String
  category               String
  businessJustification  String
  estimatedCost          Float?
  targetStartDate        DateTime?
  targetEndDate          DateTime?
  priority               String?
  impact                 String?
  status                 Status    @default(DRAFT)
  requesterUserId        Int
  assignedReviewerUserId Int?
  submittedAt            DateTime?
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt

  requester        User           @relation("RequesterRequests", fields: [requesterUserId], references: [id])
  assignedReviewer User?          @relation("ReviewerRequests", fields: [assignedReviewerUserId], references: [id])
  comments         Comment[]
  decision         Decision?
  auditEvents      AuditEvent[]
}

enum Status {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  MORE_INFO_REQUESTED
  READY_FOR_DECISION
  APPROVED
  REJECTED
  DEFERRED
}

// Append-only — updatedAt omitted by design (immutable records).
// CLAUDE.md standard exception: immutable audit/event tables do not need updatedAt.
model Comment {
  id               Int         @id @default(autoincrement())
  projectRequestId Int
  authorUserId     Int
  body             String
  type             CommentType @default(GENERAL)
  createdAt        DateTime    @default(now())

  projectRequest ProjectRequest @relation(fields: [projectRequestId], references: [id])
  author         User           @relation(fields: [authorUserId], references: [id])
}

enum CommentType {
  GENERAL
  MORE_INFO_REQUEST
  RESPONSE
}

// Append-only — updatedAt omitted by design (immutable records).
model Decision {
  id               Int       @id @default(autoincrement())
  projectRequestId Int       @unique
  outcome          Outcome
  rationale        String
  decidedByUserId  Int
  decidedAt        DateTime  @default(now())
  nextReviewDate   DateTime? // required when outcome = DEFERRED

  projectRequest ProjectRequest @relation(fields: [projectRequestId], references: [id])
  decidedBy      User           @relation(fields: [decidedByUserId], references: [id])
}

enum Outcome {
  APPROVED
  REJECTED
  DEFERRED
}

// Append-only — updatedAt omitted by design (immutable records).
model AuditEvent {
  id               Int       @id @default(autoincrement())
  projectRequestId Int
  actorUserId      Int
  eventType        EventType
  fieldName        String?
  oldValue         String?
  newValue         String?
  createdAt        DateTime  @default(now())

  projectRequest ProjectRequest @relation(fields: [projectRequestId], references: [id])
  actor          User           @relation(fields: [actorUserId], references: [id])
}

enum EventType {
  CREATED
  FIELD_CHANGED
  STATUS_CHANGED
  ASSIGNMENT_CHANGED
  COMMENT_ADDED
  DECISION_RECORDED
}

model User {
  id        Int    @id @default(autoincrement())
  name      String @unique
  role      Role
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  requesterRequests ProjectRequest[] @relation("RequesterRequests")
  reviewerRequests  ProjectRequest[] @relation("ReviewerRequests")
  comments          Comment[]
  decisions         Decision[]
  auditEvents       AuditEvent[]
}

enum Role {
  REQUESTER
  REVIEWER
  DECISION_MAKER
  ADMIN
}
```

## UI / UX Notes

### Layout
- Persistent left sidebar with role-gated nav links
- "Acting as: [name]" dropdown in the top-right corner of the header for demo role switching
- Status badges use color coding: Draft (gray), Submitted (blue), Under Review (yellow), More Info Requested (orange), Ready for Decision (purple), Approved (green), Rejected (red), Deferred (slate)

### Dashboard
- Top section: "Waiting on Me" cards — one card per action type (e.g. "3 requests need your response", "2 requests in your review queue"); empty state: "Nothing waiting on you right now"
- Below: filterable/searchable request table with columns: RequestNumber, Title, Department, Status badge, Assigned To, Last Updated, Next Step
- Empty grid: "No requests found" + "Clear filters" link if filters are active

### Request Detail
```
[PRJ-000042] Request Title                          [Status: Under Review]
Waiting on: Reviewer1   |   Next step: Mark Ready for Decision or Request More Info
─────────────────────────────────────────────────────
[Overview tab]  [Activity tab]  [Decision tab]  [Audit Log tab]

Action buttons (role + status conditional):
  [Request More Info]  [Mark Ready for Decision]  (Reviewer, Under Review)
  [Approve] [Reject] [Defer]  (Decision Maker, Ready for Decision)
  [Respond & Resubmit]  (Requester, More Info Requested)

Terminal states (Approved/Rejected): no action buttons shown; decision summary displayed prominently.
```

### Form Validation
- Inline error messages appear below each invalid field on blur and on submit attempt
- A summary banner at the top of the form lists all errors when submit is attempted while errors remain
- Required field errors use the message: "[Field name] is required"
- Length errors use: "[Field name] must be [n] characters or fewer"

### Status Transition Service
- A single `transitionRequest(requestId, action, actorUser, payload)` server function handles all transitions
- Returns `{ success, error }` — never throws; caller renders the error message in the UI
- Validates role, current status, and required fields before writing any DB rows
- Writes AuditEvent(s) atomically with the state change in a Prisma `$transaction`

### Reports
- Simple stat cards + two tables (counts by status; avg age by status)
- Cycle time table: list of decided requests with submitted date, decision date, and days elapsed
- All status rows shown in counts table even if count is zero

## Open Questions

- None — all resolved.

## Notes

- RequestNumber is set in a post-insert update within the same `$transaction` as the create: `PRJ-${id.toString().padStart(6, '0')}`. No MAX query; no gaps at demo scale.
- Immutable tables (Comment, Decision, AuditEvent) intentionally omit `updatedAt` — documented exception to CLAUDE.md standard.
- All write actions go through API routes (`app/api/`); pages are server components for data fetching.
- Seed script lives at `prisma/seed.ts` and is run via `npx prisma db seed`.
- Admin1 is purely read-only. The UI should not render any action buttons when Admin1 is the active user.
