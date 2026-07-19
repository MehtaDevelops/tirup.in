import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import { CONVEX_API_URL } from "@/lib/utils"

export const revalidate = 900

export const metadata: Metadata = {
  title: "Writing | Tirup Mehta",
  description: "Thoughts on development, design, and security by Tirup Mehta.",
}

interface BlogPost {
  slug: string
  title: string
  tldr: string
  createdAt: string
  status: "draft" | "published"
}

export default async function BlogsPage() {
  let posts: BlogPost[] = []
  let error = false

  try {
    const res = await fetch(`${CONVEX_API_URL}/api/posts`, {
      next: { revalidate: 60 },
    })
    const data = await res.json()
    
    if (Array.isArray(data)) {
      posts = data
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
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    } catch (e) {
      return dateStr
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      {/* Blogs list Section */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20 pt-0">
        {error ? (
          <div className="py-8">
            <p className="text-sm font-light text-black/40 dark:text-white/40">Failed to load articles. Please check back later.</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-8">
            <p className="text-sm font-light text-black/40 dark:text-white/40">No articles published yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {posts.map((post, index) => {
              return (
                <TextWithBlur key={post.slug} delay={index * 40}>
                  <Link
                    href={`/blogs/${post.slug}`}
                    className={`group block py-5 ${index > 0 ? "border-t" : ""} border-black/10 dark:border-white/10`}
                  >
                    <div className="flex justify-between items-baseline gap-4">
                      {/* Left: Title only */}
                      <div className="flex items-baseline gap-x-2 leading-relaxed group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                        <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300 text-sm md:text-base">
                          {post.title}
                        </span>
                      </div>
                      
                      {/* Right: Date */}
                      <span className="font-mono tabular-nums text-[10px] md:text-xs text-black/30 dark:text-white/30 select-none shrink-0 group-hover:-translate-x-1.5 transition-transform duration-300 ease-out">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </Link>
                </TextWithBlur>
              )
            })}
            {/* End border */}
            <div className="border-t border-black/10 dark:border-white/10" />
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-black/10">
        <p className="text-black/50 dark:text-white/50">© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
