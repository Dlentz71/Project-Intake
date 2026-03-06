# Implementation Plan: Project Intake App

**Spec**: `.claude/specs/project-intake-app.md`
**Target directory**: `claude_starter/` (project root)

---

## Files to Create

### Infrastructure
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `.gitignore`
- `components.json` (shadcn/ui config)
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `lib/prisma.ts` — Prisma client singleton
- `lib/auth.ts` — getCurrentUser(), setCurrentUser() from cookie
- `lib/transitions.ts` — transitionRequest() service + StatusTransition helper
- `lib/waiting-on.ts` — deriveWaitingOn() and deriveNextStep()
- `lib/utils.ts` — cn(), formatDate(), formatRequestNumber()
- `types/index.ts` — shared TypeScript types

### Layout & Shell
- `app/layout.tsx` — root layout (sidebar + header)
- `app/globals.css`
- `components/layout/Sidebar.tsx`
- `components/layout/Header.tsx`
- `components/layout/UserSwitcher.tsx`
- `components/StatusBadge.tsx`

### API Routes
- `app/api/auth/switch/route.ts` — POST: set active demo user cookie
- `app/api/requests/route.ts` — POST: create request
- `app/api/requests/[id]/route.ts` — GET: request detail; PATCH: field edits (Draft only)
- `app/api/requests/[id]/transition/route.ts` — POST: all status transitions (submit, claim, moreInfo, resubmit, readyForDecision, reopen)
- `app/api/requests/[id]/comment/route.ts` — POST: add comment
- `app/api/requests/[id]/decision/route.ts` — POST: record decision

### Pages
- `app/page.tsx` — Dashboard
- `app/my-requests/page.tsx` — My Requests (Requester view)
- `app/review-queue/page.tsx` — Review Queue (Reviewer view)
- `app/decisions/page.tsx` — Decisions (Decision Maker view)
- `app/reports/page.tsx` — Reports
- `app/admin/page.tsx` — Admin: global audit log
- `app/requests/new/page.tsx` — New Request form
- `app/requests/[id]/page.tsx` — Request detail

### Request Detail Components
- `components/requests/RequestTable.tsx` — shared filterable table
- `components/requests/RequestFilters.tsx` — status/department/category filters + search
- `components/requests/WaitingOnMeCards.tsx`
- `components/request-detail/RequestHeader.tsx`
- `components/request-detail/OverviewTab.tsx`
- `components/request-detail/ActivityTab.tsx`
- `components/request-detail/DecisionTab.tsx`
- `components/request-detail/AuditLogTab.tsx`
- `components/request-detail/ActionButtons.tsx`

### Tests
- `lib/transitions.test.ts` — all transition rules: valid paths, invalid role, missing fields
- `lib/waiting-on.test.ts` — derivation logic for each status
- `app/api/requests/route.test.ts` — create request happy path + validation
- `app/api/requests/[id]/transition/route.test.ts` — each transition + auth boundary

---

## Implementation Steps (in order)

### Phase 1: Foundation
1. Write `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `components.json`
2. Write `prisma/schema.prisma` (full schema per spec)
3. Write `lib/prisma.ts`, `lib/utils.ts`, `types/index.ts`
4. Write `lib/auth.ts` (cookie helpers, getCurrentUser, DEMO_USERS constant)
5. Write `prisma/seed.ts` (4 users, 15+ requests, comments, decisions)

### Phase 2: Business Logic
6. Write `lib/transitions.ts` — `transitionRequest()` with all 8 transitions, role checks, field validation, audit writes
7. Write `lib/waiting-on.ts` — `deriveWaitingOn()`, `deriveNextStep()`
8. Write `lib/transitions.test.ts` and `lib/waiting-on.test.ts`

### Phase 3: API Routes
9. `app/api/auth/switch/route.ts`
10. `app/api/requests/route.ts` (POST create)
11. `app/api/requests/[id]/route.ts` (GET detail, PATCH field edit)
12. `app/api/requests/[id]/transition/route.ts`
13. `app/api/requests/[id]/comment/route.ts`
14. `app/api/requests/[id]/decision/route.ts`
15. Write API route tests

### Phase 4: Layout & Shell
16. `app/globals.css`, `app/layout.tsx`
17. `components/layout/Sidebar.tsx`, `Header.tsx`, `UserSwitcher.tsx`
18. `components/StatusBadge.tsx`

### Phase 5: Pages
19. Dashboard (`app/page.tsx`) — WaitingOnMeCards + RequestTable
20. My Requests (`app/my-requests/page.tsx`)
21. Review Queue (`app/review-queue/page.tsx`)
22. Decisions (`app/decisions/page.tsx`)
23. Reports (`app/reports/page.tsx`)
24. Admin (`app/admin/page.tsx`)
25. New Request form (`app/requests/new/page.tsx`)
26. Request detail (`app/requests/[id]/page.tsx`) — tabs + ActionButtons

### Phase 6: Validate
27. Run `npm run lint` — fix all errors
28. Run `npm run build` — fix all errors

---

## Schema Changes
Full schema per spec — greenfield, no backwards-compat concerns.
Run after writing schema: `npx prisma migrate dev --name init`
Run seed: `npx prisma db seed`

## Risks & Unknowns
- shadcn/ui components must be installed via CLI — plan uses Badge, Button, Card, Dialog, Input, Label, Select, Table, Tabs, Textarea. These will be installed in Phase 1.
- SQLite doesn't support `$transaction` with row-level locking, but last-writer-wins is acceptable per spec.
- Next.js App Router server actions vs API routes: using API routes throughout for consistency and testability.
- `npx create-next-app` will NOT be used — files are written directly to avoid interactive prompts.

## Deviations from Spec (none anticipated)
None — will note any that arise during implementation.
