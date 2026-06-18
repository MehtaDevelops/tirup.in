import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import TextWithBlur from "@/components/text-with-blur"

interface BlogPost {
  title: string
  tldr: string
  contentHtml: string
  createdAt: string
  readingTime: number
  tags: string[]
}

interface PageProps {
  params: Promise<{ slug: string }>
}

function renderMarkdown(text: string): string {
  if (!text) return ""
  
  // Escape HTML tags to prevent XSS, but preserve markdown formatting
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Italics: *text* or _text_
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>")
  html = html.replace(/_(.*?)_/g, "<em>$1</em>")

  // Inline Code: `code`
  html = html.replace(/`(.*?)`/g, '<code class="font-mono bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-xs md:text-sm">$1</code>')

  // Links: [label](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:text-accent transition-colors">$1</a>')

  // Newlines
  html = html.replace(/\n/g, "<br />")

  return html
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await fetch(`https://accomplished-condor-793.convex.site/api/post?slug=${slug}`, {
      next: { revalidate: 60 }
    })
    const data = await res.json()
    if (data && !data.error) {
      return {
        title: `${data.title} | Tirup Mehta`,
        description: data.tldr,
      }
    }
  } catch (e) {
    // Ignore error
  }
  return {
    title: "Article Not Found | Tirup Mehta"
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  let post: BlogPost | null = null
  let error = false

  try {
    const res = await fetch(`https://accomplished-condor-793.convex.site/api/post?slug=${slug}`, {
      next: { revalidate: 60 }
    })
    const data = await res.json()
    if (data && !data.error) {
      post = data
    } else {
      error = true
    }
  } catch (err) {
    console.error("Error fetching post:", err)
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

  if (error || !post) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-light mb-4">Article Not Found</h1>
        <p className="text-black/50 dark:text-white/50 mb-8">This article doesn't exist or has been removed.</p>
        <Link href="/blogs" className="text-accent hover:underline inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={14} />
          Back to Writing
        </Link>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen">
      <div className="section px-6 md:px-20 pt-20 pb-20 max-w-4xl mx-auto w-full">
        {/* Back Link */}
        <TextWithBlur>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-xs md:text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors mb-10"
          >
            <ArrowLeft size={13} />
            Writing
          </Link>
        </TextWithBlur>

        {/* Article Header info */}
        <TextWithBlur delay={50}>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">
            <span>Essay</span>
            <span className="select-none text-black/20 dark:text-white/20">/</span>
            <span>{formatDate(post.createdAt)}</span>
            <span className="select-none text-black/20 dark:text-white/20">/</span>
            <span>{post.readingTime} min read</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white mb-6 leading-tight max-w-3xl">
            {post.title}
          </h1>

          {/* Render TL;DR with custom markdown parser in a styled box if it's not already inline in the contentHtml */}
          {post.tldr && !post.contentHtml?.includes("tldr-box") && (
            <div className="tldr-box max-w-3xl mb-8">
              <span className="tldr-label">TL;DR</span>
              <div 
                className="text-base md:text-lg font-light leading-relaxed text-black/75 dark:text-white/75"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.tldr) }}
              />
            </div>
          )}
        </TextWithBlur>

        {/* Separator line */}
        <TextWithBlur delay={80}>
          <div className="border-b border-black/5 dark:border-white/5 mb-10 pb-2 flex justify-between items-center">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs font-light text-black/40 dark:text-white/40">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <a
              href={`https://blogs.tirup.in/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-0.5"
            >
              View on original site <ArrowUpRight size={11} />
            </a>
          </div>
        </TextWithBlur>

        {/* Article Content Rendered via dangereouslySetInnerHTML */}
        <TextWithBlur delay={120}>
          <div 
            className="blog-content text-black/80 dark:text-white/85 max-w-3xl mb-16"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </TextWithBlur>

        {/* Footer */}
        <footer className="py-6 text-center border-t border-black/10 dark:border-white/10 mt-8">
          <p className="text-sm text-black/50 dark:text-white/50">© {currentYear} Tirup Mehta. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
