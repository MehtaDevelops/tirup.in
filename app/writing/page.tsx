import type { Metadata } from "next"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import { PaginatedPosts, type BlogPost } from "@/components/paginated-posts"
import { CONVEX_API_URL } from "@/lib/utils"
import SiteFooter from "@/components/site-footer"

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

export default async function BlogsPage() {
  let posts: BlogPost[] = []
  let error = false

  try {
    const res = await fetch(`${CONVEX_API_URL}/api/posts`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        posts = data
          .filter((post) => post && post.slug && (post.status === "published" || !post.status))
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

      {/* Intro line above the list. Same structure as the blog home so the two
          surfaces read as one list even though the labels differ. */}
      <div className="max-w-4xl mx-auto w-full px-6 md:px-20 pt-8 sm:pt-10 md:pt-14 pb-0">
        <TextWithBlur delay={80}>
          <div className="flex items-baseline justify-between gap-x-3 border-b border-black/5 dark:border-white/5 pb-2 mb-4">
            <h1 className="text-xs font-normal text-black/40 dark:text-white/40">Tirup Mehta Writing</h1>
            <a
              href="https://blogs.tirup.in"
              aria-label="Read Tirup Mehta's articles on the blog"
              className="ml-auto mr-3 text-xs md:text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors whitespace-nowrap"
            >
              {/* Three labels would overflow a 320px line together with the count. */}
              <span className="sm:hidden">Blog ↗</span>
              <span className="hidden sm:inline">Read on blogs.tirup.in ↗</span>
            </a>
            <span className="text-xs text-black/30 dark:text-white/30 tabular-nums whitespace-nowrap">
              {posts.length} {posts.length === 1 ? "article" : "articles"}
            </span>
          </div>
        </TextWithBlur>
      </div>

      {/* Writing list Section: every published post, paginated like the blog */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-16 flex-1">
        <p className="sr-only">Articles by Tirup Mehta</p>
        {error ? (
          <div className="py-8">
            <p className="text-sm font-light text-black/40 dark:text-white/40">Failed to load articles. Please check back later.</p>
          </div>
        ) : (
          <PaginatedPosts posts={posts} pageSize={10} />
        )}
      </section>

      <SiteFooter />
    </main>
  )
}
