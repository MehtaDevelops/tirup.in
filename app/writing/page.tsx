import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import { ArrowUpRight } from "lucide-react"
import { CONVEX_API_URL } from "@/lib/utils"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Writing",
  description: "Thoughts on development, design, and security by Tirup Mehta.",
  alternates: { canonical: "/writing" },
  openGraph: { url: "/writing" },
}

interface BlogPost {
  slug: string
  title: string
  tldr: string
  createdAt: string
  status?: "draft" | "published"
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
            if (isNaN(ta) || isNaN(tb)) return 0
            return tb - ta
          })
          .slice(0, 10)
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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      const day = String(date.getDate()).padStart(2, "0")
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    } catch {
      return dateStr
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      {/* Blogs list Section — latest 10 titles only. Full essays live on blogs.tirup.in */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20">
        <h1 className="sr-only">Writing</h1>
        {error ? (
          <div className="py-8">
            <p className="text-sm font-light text-black/40 dark:text-white/40">Failed to load articles. Please check back later.</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-8">
            <p className="text-sm font-light text-black/40 dark:text-white/40">No articles published yet.</p>
          </div>
        ) : (
          <div className="flex flex-col list-hover-group">
            {posts.map((post, index) => {
              return (
                <TextWithBlur key={post.slug} delay={Math.min(index * 35, 140)}>
                  <Link
                    href={`/writing/${post.slug}`}
                    className={[
                      "group block -mx-3 px-3 rounded-lg",
                      index === 0 ? "pb-5 pt-1" : "py-5",
                      index > 0 ? "border-t border-black/10 dark:border-white/10" : "",
                      "hover:bg-black/[0.025] dark:hover:bg-white/[0.025]",
                      "[transition:background-color_120ms_ease-out,transform_100ms_cubic-bezier(0.16,1,0.3,1)]",
                      "active:scale-[0.99]",
                    ].join(" ")}
                  >
                    <div className="flex justify-between items-baseline gap-2 sm:gap-4">
                      {/* Left: Title */}
                      <span className="font-medium text-black dark:text-white group-hover:text-accent [transition:color_80ms_ease-out] text-sm md:text-base break-words leading-relaxed min-w-0 flex-1">
                        {post.title}
                      </span>
                      {/* Right: Date */}
                      <span className="tabular-nums text-[10px] md:text-xs text-black/30 dark:text-white/30 select-none shrink-0 group-hover:text-black/60 dark:group-hover:text-white/60 [transition:color_80ms_ease-out] whitespace-nowrap">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </Link>
                </TextWithBlur>
              )
            })}
            {/* End border */}
            <div className="border-t border-black/10 dark:border-white/10" />

            {/* Read all blogs — sends readers to the main blogs site */}
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
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-4 px-6 text-center border-t border-black/10 dark:border-white/10">
        <p className="text-xs md:text-sm text-black/40 dark:text-white/40">© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
