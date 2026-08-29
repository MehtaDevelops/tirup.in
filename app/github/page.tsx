import type { Metadata } from "next"
import Header from "@/components/header"
import GitHubCalendarView from "@/components/github-calendar-view"
import { getMergedGitHubContributions } from "@/lib/github-contributions"

// Prevent search engines from indexing this page as requested
export const metadata: Metadata = {
  title: "GitHub Activity",
  description: "Unified GitHub engineering activity across @MehtaDevelops and @TirupMehta.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export const revalidate = 3600 // Revalidate contributions hourly

export default async function GitHubActivityPage() {
  const contributionsData = await getMergedGitHubContributions()
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      {/* GitHub Activity Section */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20 pt-2">
        <GitHubCalendarView data={contributionsData} />
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-black/10 dark:border-white/10">
        <p className="text-black/50 dark:text-white/50 text-xs" suppressHydrationWarning>
          © {currentYear} Tirup Mehta. All rights reserved.
        </p>
      </footer>
    </main>
  )
}
