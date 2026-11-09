import type { Metadata } from "next"
import Header from "@/components/header"
import GitHubCalendarView from "@/components/github-calendar-view"
import { getMergedGitHubContributions } from "@/lib/github-contributions"
import SiteFooter from "@/components/site-footer"

// Indexable on purpose: this page is advertised in sitemap.ts, so it must not
// carry noindex and it must not inherit the site-wide canonical (app/layout.tsx
// points every page at https://tirup.in by default, which would have made this
// page a canonical duplicate of the homepage and kept it out of the index).
export const metadata: Metadata = {
  title: "GitHub Activity",
  description:
    "Unified GitHub engineering activity across @MehtaDevelops and @TirupMehta: contribution calendar, commit cadence, and streak history.",
  alternates: { canonical: "/github" },
  openGraph: { url: "/github" },
  robots: { index: true, follow: true },
}

export const revalidate = 3600 // Revalidate contributions hourly

export default async function GitHubActivityPage() {
  const contributionsData = await getMergedGitHubContributions()
  // Baked into the cached HTML at revalidation time, so the client can show how
  // old the payload actually is rather than pretending it just arrived.
  const dataUpdatedAt = Date.now()
  return (
    <main className="relative min-h-screen flex flex-col">
      <Header />

      {/* GitHub Activity Section */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20 pt-2">
        <GitHubCalendarView data={contributionsData} dataUpdatedAt={dataUpdatedAt} />
      </section>

      <SiteFooter />
    </main>
  )
}
