import type { Metadata } from "next"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import { ArrowUpRight } from "lucide-react"
import { CONVEX_API_URL } from "@/lib/utils"
import SiteFooter from "@/components/site-footer"
import { PaginatedPosts, type PostSummary } from "@/components/paginated-posts"

export const revalidate = 60

export const metadata: Metadata = {
  // This page is the portfolio's writing index, not the blog. It deliberately
  // targets the "Tirup Mehta writing / articles / essays" queries so it does
  // not compete with blogs.tirup.in, which owns "Tirup Mehta Blogs". Individual
  // article pages here are noindex + canonical to the blog, so no post can
  // appear twice in search results.
  title: { absolute: "Writing by Tirup Mehta | Articles & Essays" },
  description:
    "Writing by Tirup Mehta: articles and essays on software engineering, web security, design systems, and AI safety. Browse recent pieces, then read the full posts on the blog.",
  keywords: [
    "Tirup Mehta writing",
    "Tirup Mehta articles",
    "Tirup Mehta essays",
    "Tirup Mehta blog posts",
  ],
  alternates: { canonical: "/writing" },
  openGraph: {
    url: "/writing",
    title: "Writing by Tirup Mehta | Articles & Essays",
    description:
      "Articles and essays by Tirup Mehta on software engineering, web security, design systems, and AI safety.",
  },
}

interface BlogPost {
  slug: string
  title: string
  tldr: string
  createdAt: string
  status?: "draft" | "published"
}

export default async function BlogsPage() {
  let posts: PostSummary[] = []
  let error = false

  try {
    // Summary view: the list renders a title, a TL;DR and a date, so there is
    // no reason to pull every article body across the wire.
    const res = await fetch(`${CONVEX_API_URL}/api/posts?view=summary`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        posts = (data as (BlogPost & { status?: string })[])
          // The summary endpoint only returns published posts and omits `status`.
          .filter((post) => post && post.slug)
          .sort((a, b) => {
            const ta = new Date(a.createdAt).getTime()
            const tb = new Date(b.createdAt).getTime()
            const aBad = isNaN(ta)
            const bBad = isNaN(tb)
            if (aBad && bBad) return 0
            if (aBad) return 1
            if (bBad) return -1
            return tb - ta
          })
          .map(({ slug, title, tldr, createdAt }) => ({ slug, title, tldr, createdAt }))
      } else {
        error = true
      }
    } else {
      error = true
    }
  } catch (err) {
    console.error("Error fetching posts:", err)
    error = true
  }

  return (
    <main className="relative min-h-screen flex flex-col">
      <Header />

      {/* Writing index. Paginated exactly like blogs.tirup.in (10 per page) so
          no post is reachable on one surface and missing from the other. */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-16">
        <h1 className="sr-only">Writing by Tirup Mehta</h1>
        {error ? (
          <div className="py-8">
            <p className="text-sm font-light text-black/40 dark:text-white/40">Failed to load articles. Please check back later.</p>
          </div>
        ) : (
          <>
            <PaginatedPosts posts={posts} pageSize={10} />

            {/* Read all blogs: sends readers to the main blogs site */}
            <TextWithBlur delay={120}>
              <div className="pt-8 pb-2 flex justify-start">
                <a
                  href="https://blogs.tirup.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 pl-4 pr-3 h-9 text-xs font-medium tracking-wide rounded-full border bg-transparent transition-all duration-150 select-none cursor-pointer active:scale-[0.97] border-[rgba(18,19,20,0.15)] hover:border-[rgba(18,19,20,0.3)] hover:bg-[rgba(18,19,20,0.05)] text-[rgba(18,19,20,0.7)] hover:text-black dark:border-[rgba(255,255,255,0.07)] dark:hover:border-[rgba(255,255,255,0.16)] dark:hover:bg-[rgba(255,255,255,0.05)] dark:text-[rgba(244,244,245,0.7)] dark:hover:text-white"
                >
                  <span className="leading-none select-none">Read all blogs</span>
                  <ArrowUpRight size={13} className="icon-arrow-hover opacity-70" />
                </a>
              </div>
            </TextWithBlur>
          </>
        )}
      </section>

      <SiteFooter />
    </main>
  )
}
