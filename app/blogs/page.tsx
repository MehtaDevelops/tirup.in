import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import { CONVEX_API_URL } from "@/lib/utils"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Writing",
  description: "Thoughts on development, design, and security by Tirup Mehta.",
  alternates: { canonical: "/blogs" },
  openGraph: { url: "/blogs" },
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

      {/* Blogs list Section */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20">
        <h1 className="sr-only">Articles and Writing</h1>
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
                <TextWithBlur key={post.slug} delay={index * 35}>
                  <Link
                    href={`/blogs/${post.slug}`}
                    className={[
                      "group block py-5 -mx-3 px-3 rounded-lg",
                      index > 0 ? "border-t border-black/10 dark:border-white/10" : "",
                      "hover:bg-black/[0.025] dark:hover:bg-white/[0.025]",
                      "[transition:background-color_120ms_ease-out,transform_100ms_cubic-bezier(0.16,1,0.3,1)]",
                      "active:scale-[0.99]",
                    ].join(" ")}
                  >
                    <div className="flex justify-between items-baseline gap-4">
                      {/* Left: Title — stays put */}
                      <span className="font-medium text-black dark:text-white group-hover:text-accent [transition:color_80ms_ease-out] text-sm md:text-base leading-relaxed min-w-0 flex-1">
                        {post.title}
                      </span>
                      {/* Right: Date — stays put */}
                      <span className="tabular-nums text-[10px] md:text-xs text-black/40 dark:text-white/40 select-none shrink-0 group-hover:text-black/60 dark:group-hover:text-white/60 [transition:color_80ms_ease-out] whitespace-nowrap">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </Link>
                </TextWithBlur>
              )
            })}
            {/* End border */}
            <div className="border-t border-black/10 dark:border-white/10" />

            {/* View all articles at blogs.tirup.in link */}
            <TextWithBlur delay={posts.length * 35 + 40}>
              <div className="pt-8 pb-2 flex justify-start">
                <a
                  href="https://blogs.tirup.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-xs sm:text-sm text-black/45 dark:text-white/45 hover:text-black dark:hover:text-white transition-colors duration-200"
                >
                  <span className="link-hover pb-0.5">View all articles at blogs.tirup.in</span>
                  <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
                </a>
              </div>
            </TextWithBlur>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-black/10 dark:border-white/10">
        <p className="text-black/50 dark:text-white/50">© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
