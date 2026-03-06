# Request Tracker

An internal browser-based tool for tracking requests from creation through decision, including statuses, filters, audit trails, and decision tracking for small teams.

## Commands

> Fill these in after your stack is chosen. Include only commands Claude would need to run.

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build
npm test          # Run test suite
npm run lint      # Lint and format
npx prisma migrate dev   # Run DB migrations after schema changes
npx prisma studio        # Browse/edit database in browser
```

## Stack

> Run `/choose-stack` to have Claude recommend the right stack for your project,
> or fill this in manually after deciding.

- **Language**: TypeScript
- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite via Prisma ORM
- **Auth**: Simple local user selection — name stored in browser cookie (no passwords; local demo only)
- **UI**: shadcn/ui + Tailwind CSS
- **Deployment**: Local only (`npm run dev`)

## Architecture

> Describe how the project is structured. Focus on things Claude can't infer from reading code.

- Next.js App Router: pages in `app/`, API routes in `app/api/`
- Prisma schema in `prisma/schema.prisma`; run `npx prisma migrate dev` after any schema change
- shadcn/ui components in `components/ui/`; custom components in `components/`
- User identity is cookie-based (name only); no password or session table needed

## Important Gotchas

> Things that have burned you before. Vague notes get ignored — be specific.

- Always run `npx prisma migrate dev` after editing `prisma/schema.prisma` — the app will fail silently if the DB is out of sync
- SQLite file is at `prisma/dev.db` — do not commit this file; it is gitignored
- shadcn/ui components must be added via `npx shadcn-ui@latest add <component>`, not written by hand
- Audit trail entries should be written server-side only — never trust client-supplied actor identity

## Required Engineering Standards

**All new features and enhancements MUST include tests. See `.claude/rules/testing.md` for details.**

Every page designed MUST have a responsive design for mobile use.

**Check the docker logs after implementing any new feature or enhancement.**

**NEVER commit changes unless the user explicitly asks you to.**

If migrations are created, run them when complete.

**ALWAYS use the `frontend-design` skill when making or editing the UI.**

When creating new pages that are not full width, center the page — do not hug the left.

Standardize patterns by creating reusable components. If logic is likely to be repeated, create a new component. We do not want duplicate code.

**Data Model Rules**
- Table names MUST be singular (e.g. `user`, `user_token`)
- Every table MUST have `created_at` and `updated_at` timestamp fields

> Add your own project standards below as your team develops conventions.

## Rules

See `.claude/rules/` for detailed standards:

- @.claude/rules/code-style.md
- @.claude/rules/git-workflow.md
- @.claude/rules/testing.md
- @.claude/rules/security.md
