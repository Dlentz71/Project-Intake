/**
 * Release Notes
 * =============
 * HOW TO ADD A NEW RELEASE
 * ------------------------
 * 1. Copy the release object template below and paste it at the TOP of the RELEASES array.
 * 2. Bump the version number (e.g. v1.2 → v1.3).
 * 3. Set `date` to today in YYYY-MM-DD format.
 * 4. Give the release a short `label` (e.g. "Bug Fixes & Performance").
 * 5. List every change in `items`. Use plain English — no jargon.
 *    Tags: "feature" (new capability), "improvement" (better existing thing),
 *          "fix" (bug corrected), "security" (access or data protection change).
 * 6. Save the file. The Releases page updates automatically — no other changes needed.
 *
 * TEMPLATE:
 * {
 *   version: 'v1.X',
 *   date: 'YYYY-MM-DD',
 *   label: 'Short Release Name',
 *   items: [
 *     {
 *       tag: 'feature',
 *       title: 'Short title',
 *       summary: 'What this means for users in one or two plain-English sentences.',
 *     },
 *   ],
 * },
 */

export type ReleaseTag = 'feature' | 'improvement' | 'fix' | 'security'

export interface ReleaseItem {
  tag: ReleaseTag
  title: string
  /** Plain-English summary suitable for non-technical readers */
  summary: string
}

export interface Release {
  version: string
  date: string
  /** Short descriptive name for this release */
  label: string
  items: ReleaseItem[]
}

export const RELEASES: Release[] = [
  // ── NEWEST RELEASE FIRST ────────────────────────────────────────────────
  {
    version: 'v1.2',
    date: '2026-03-05',
    label: 'Collaboration & Notifications',
    items: [
      {
        tag: 'feature',
        title: 'Notification bell',
        summary:
          'A bell icon now appears in the top bar showing how many items need your attention. Click it to see a grouped list of pending actions with direct links — no more hunting through lists to find what\'s waiting on you.',
      },
      {
        tag: 'feature',
        title: 'Dashboard status donut chart',
        summary:
          'The Dashboard now shows a colour-coded donut chart of all requests broken down by status, giving every user an instant visual snapshot of the pipeline at a glance.',
      },
      {
        tag: 'improvement',
        title: 'Open comments for all roles',
        summary:
          'Reviewers and Decision Makers can now post general comments on any active request, not just their own. This makes it easier for the whole team to communicate in one place.',
      },
    ],
  },
  {
    version: 'v1.1',
    date: '2026-03-04',
    label: 'Reports, Sorting & Admin Tools',
    items: [
      {
        tag: 'feature',
        title: 'Reports page',
        summary:
          'A new Reports section shows summary statistics across all requests — total counts, how long requests have been sitting at each stage, and a bar chart of submission volume over the past 12 months.',
      },
      {
        tag: 'feature',
        title: 'Sortable table columns',
        summary:
          'Every request list can now be sorted by clicking any column header (request number, title, department, status, assigned reviewer, or last updated). The sort order is remembered in the URL so you can share or bookmark a sorted view.',
      },
      {
        tag: 'feature',
        title: 'Pagination',
        summary:
          'Long request lists are now split into pages of 25. A count and Previous / Next navigation appear at the bottom so the page stays fast even with hundreds of requests.',
      },
      {
        tag: 'improvement',
        title: 'Admin: user roster & system stats',
        summary:
          'The Admin page now displays a full user roster showing each person\'s role and how many requests they\'ve submitted or reviewed. Four headline stats (total requests, pending review, ready to decide, decided) sit at the top for a quick overview.',
      },
      {
        tag: 'improvement',
        title: 'Admin: audit log filtering',
        summary:
          'The activity log on the Admin page can now be filtered by event type (status changes, comments, field edits, etc.) so admins can find specific changes quickly.',
      },
    ],
  },
  {
    version: 'v1.0',
    date: '2026-03-03',
    label: 'Initial Release',
    items: [
      {
        tag: 'feature',
        title: 'Project request submission',
        summary:
          'Team members can submit project requests with all key details — title, department, category, business justification, estimated cost, target dates, priority, and impact. Requests save as drafts and can be edited before submitting.',
      },
      {
        tag: 'feature',
        title: 'Multi-role workflow',
        summary:
          'The system supports four roles: Requester, Reviewer, Decision Maker, and Admin. Each role sees a tailored view and can only take the actions appropriate to their responsibilities.',
      },
      {
        tag: 'feature',
        title: 'Eight-stage status workflow',
        summary:
          'Requests move through a clear lifecycle: Draft → Submitted → Under Review → (More Info Requested ↔ back to requester) → Ready for Decision → Approved / Rejected / Deferred. Every transition is logged automatically.',
      },
      {
        tag: 'feature',
        title: 'Request detail & activity tab',
        summary:
          'Clicking any request opens a full detail page with all fields, the current status, decision rationale (once decided), and a chronological activity feed showing every comment and status change.',
      },
      {
        tag: 'feature',
        title: 'My Requests',
        summary:
          'Requesters have a dedicated page showing only their own submissions, making it easy to track what they\'ve submitted and what\'s waiting for their response.',
      },
      {
        tag: 'feature',
        title: 'Review Queue',
        summary:
          'Reviewers see all requests that need attention — unassigned submissions to claim, and requests actively assigned to them — in a single focused view.',
      },
      {
        tag: 'feature',
        title: 'Decisions page',
        summary:
          'Decision Makers see a focused list of requests that are ready for a decision, plus any previously deferred requests that are due for review.',
      },
      {
        tag: 'feature',
        title: 'Admin panel',
        summary:
          'Admins can view all requests across the organisation, see who is doing what, and browse the full audit log of every action taken in the system.',
      },
      {
        tag: 'feature',
        title: 'Request withdrawal',
        summary:
          'Requesters can withdraw a submitted request (as long as it hasn\'t been decided) if plans change. The action is recorded in the activity log.',
      },
    ],
  },
]
