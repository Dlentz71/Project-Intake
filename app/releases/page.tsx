import type { Metadata } from 'next'
import { RELEASES, type ReleaseTag } from '@/lib/releases'

export const metadata: Metadata = { title: "What's New" }

const TAG_STYLES: Record<ReleaseTag, { pill: string; label: string }> = {
  feature:     { pill: 'bg-indigo-100 text-indigo-700 ring-indigo-200',  label: 'New Feature' },
  improvement: { pill: 'bg-amber-100  text-amber-700  ring-amber-200',   label: 'Improvement' },
  fix:         { pill: 'bg-emerald-100 text-emerald-700 ring-emerald-200', label: 'Bug Fix' },
  security:    { pill: 'bg-red-100    text-red-700    ring-red-200',      label: 'Security' },
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
        {children}
      </h2>
      <div className="flex-1 h-px bg-border" aria-hidden="true" />
    </div>
  )
}

function TagPill({ tag }: { tag: ReleaseTag }) {
  const { pill, label } = TAG_STYLES[tag]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset shrink-0 ${pill}`}>
      {label}
    </span>
  )
}

export default function ReleasesPage() {
  const latest = RELEASES[0]

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{"What's New"}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          A plain-English summary of every update to Request Tracker.
        </p>
      </div>

      {/* Update process callout */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4">
        <p className="text-sm font-semibold text-indigo-800 mb-1">How updates are tracked</p>
        <p className="text-sm text-indigo-700 leading-relaxed">
          Every time a change is made to the system — whether it&apos;s a new feature, an
          improvement, or a bug fix — a new entry is added here before the update is released.
          Entries are written in plain English so everyone on the team can stay informed without
          needing a technical background.
        </p>
      </div>

      {RELEASES.map((release, idx) => {
        const isLatest = idx === 0
        const date = new Date(release.date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })

        const featureCount = release.items.filter((i) => i.tag === 'feature').length
        const improvementCount = release.items.filter((i) => i.tag === 'improvement').length
        const fixCount = release.items.filter((i) => i.tag === 'fix').length

        return (
          <section key={release.version} aria-label={`Release ${release.version}`}>
            <SectionHeading>
              {release.version} — {release.label}
            </SectionHeading>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              {/* Release header bar */}
              <div className="flex items-center justify-between gap-4 px-5 py-4 border-b bg-muted/30">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-base font-bold text-foreground">{release.version}</span>
                  {isLatest && (
                    <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white">
                      Latest
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">{release.label}</span>
                </div>
                <time dateTime={release.date} className="text-xs text-muted-foreground shrink-0">
                  {date}
                </time>
              </div>

              {/* Summary counts */}
              <div className="flex items-center gap-4 px-5 py-3 border-b bg-muted/10 text-xs text-muted-foreground">
                {featureCount > 0 && <span>{featureCount} new feature{featureCount !== 1 ? 's' : ''}</span>}
                {improvementCount > 0 && <span>{improvementCount} improvement{improvementCount !== 1 ? 's' : ''}</span>}
                {fixCount > 0 && <span>{fixCount} bug fix{fixCount !== 1 ? 'es' : ''}</span>}
              </div>

              {/* Release items */}
              <ul className="divide-y">
                {release.items.map((item, i) => (
                  <li key={i} className="flex gap-4 px-5 py-4">
                    <div className="pt-0.5 shrink-0">
                      <TagPill tag={item.tag} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground mb-0.5">{item.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )
      })}
    </div>
  )
}
