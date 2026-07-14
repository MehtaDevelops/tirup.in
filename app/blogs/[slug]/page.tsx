import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import TextWithBlur from "@/components/text-with-blur"
import TldrPopup from "@/components/tldr-popup"
import { sanitizeHtml, renderMarkdownSafe } from "@/lib/sanitize"

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

// ─── Slug validation ──────────────────────────────────────────────────────────
// Only allow alphanumeric characters, hyphens, and underscores in slugs.
// This prevents path traversal and injection attacks via the URL parameter.
const SAFE_SLUG_RE = /^[a-zA-Z0-9_-]{1,200}$/

function isValidSlug(slug: string): boolean {
  return SAFE_SLUG_RE.test(slug)
}

// ─── API base URL ─────────────────────────────────────────────────────────────
const API_BASE = "https://accomplished-condor-793.convex.site"

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  // Validate slug before using in any external fetch
  if (!isValidSlug(slug)) {
    return { title: "Article Not Found | Tirup Mehta" }
  }

  try {
    const res = await fetch(`${API_BASE}/api/post?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) return { title: "Article Not Found | Tirup Mehta" }

    const data = await res.json()
    if (data && !data.error) {
      return {
        title: `${String(data.title).slice(0, 200)} | Tirup Mehta`,
        description: String(data.tldr ?? "").slice(0, 300),
        openGraph: {
          title: `${String(data.title).slice(0, 200)} | Tirup Mehta`,
          description: String(data.tldr ?? "").slice(0, 300),
          type: "article",
          images: ["/profile.png"],
        },
      }
    }
  } catch {
    // Swallow — return default below
  }
  return {
    title: "Article Not Found | Tirup Mehta",
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  let post: BlogPost | null = null
  let error = false

  // ── Validate slug strictly before touching the network ─────────────────────
  if (!isValidSlug(slug)) {
    error = true
  } else {
    try {
      const res = await fetch(`${API_BASE}/api/post?slug=${encodeURIComponent(slug)}`, {
        next: { revalidate: 60 },
      })

      if (!res.ok) {
        error = true
      } else {
        const data = await res.json()
        if (data && !data.error) {
          post = data
        } else {
          error = true
        }
      }
    } catch (err) {
      // Do NOT log the full error or the slug to the console — it could contain
      // injection payloads that pollute server logs.
      console.error("[blog/page] Failed to fetch post")
      error = true
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ""
      const day = String(date.getDate()).padStart(2, "0")
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    } catch {
      return ""
    }
  }

  const currentYear = new Date().getFullYear()

  if (error || !post) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-light mb-4">Article Not Found</h1>
        <p className="text-black/50 dark:text-white/50 mb-8">This article doesn&apos;t exist or has been removed.</p>
        <Link href="/blogs" className="text-accent hover:underline inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={14} />
          Back to Writing
        </Link>
      </main>
    )
  }

  // ── Sanitize ALL content from the external API before rendering ─────────────
  // post.contentHtml comes from the Convex API and must be sanitized to prevent
  // stored XSS attacks (e.g., if a blog post's HTML was manipulated on the server).
  const safeContentHtml = sanitizeHtml(post.contentHtml ?? "")

  // post.tldr goes through our safe markdown renderer, which also sanitizes output
  const safeTldrHtml = renderMarkdownSafe(post.tldr ?? "")

  // Sanitize scalar fields that render into JSX (React auto-escapes these, but
  // be explicit for clarity and defence-in-depth)
  const safeTitle = String(post.title ?? "").slice(0, 300)
  const safeReadingTime = Number.isFinite(post.readingTime) ? Math.max(1, Math.min(999, post.readingTime)) : 0
  const safeTags = Array.isArray(post.tags)
    ? post.tags
        .filter((t) => typeof t === "string")
        .map((t) => t.replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 60))
        .slice(0, 20)
    : []

  return (
    <main className="relative min-h-screen">
      <div className="section px-6 md:px-20 pt-10 md:pt-20 pb-20 max-w-4xl mx-auto w-full">
        
        {/* Breadcrumb Header */}
        <TextWithBlur>
          <div className="flex items-center gap-2 text-xs md:text-sm text-black/40 dark:text-white/40 mb-10 select-none flex-wrap">
            <Link href="/" className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 shrink-0">
                <Image
                  src="/profile.png"
                  alt="Tirup Mehta"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-light">Tirup Mehta</span>
            </Link>
            <span className="text-black/20 dark:text-white/20 select-none">›</span>
            <Link href="/blogs" className="hover:text-black dark:hover:text-white transition-colors font-light">
              Writing
            </Link>
            <span className="text-black/20 dark:text-white/20 select-none">›</span>
            <span className="truncate max-w-[200px] sm:max-w-xs font-light text-black/30 dark:text-white/30">{safeTitle}</span>
          </div>
        </TextWithBlur>

        {/* Title */}
        <TextWithBlur delay={50}>
          <h1 className="text-4xl md:text-5xl font-serif italic text-black dark:text-white mb-6 leading-tight max-w-3xl font-medium">
            {safeTitle}
          </h1>
        </TextWithBlur>

        {/* Article Header info */}
        <TextWithBlur delay={50}>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">
            <span>Essay</span>
            <span className="select-none text-black/20 dark:text-white/20">/</span>
            <span className="font-mono tabular-nums">{formatDate(post.createdAt)}</span>
            <span className="select-none text-black/20 dark:text-white/20">/</span>
            {safeReadingTime > 0 && <span className="font-mono tabular-nums">{safeReadingTime} min read</span>}
          </div>
        </TextWithBlur>

        {/* Separator line */}
        <TextWithBlur delay={80}>
          <div className="border-b border-black/5 dark:border-white/5 mb-10 pb-2 flex justify-between items-center max-w-3xl">
            {safeTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {safeTags.map((tag) => (
                  <span key={tag} className="text-xs font-light text-black/40 dark:text-white/40">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {/* External link to blogs.tirup.in — slug is already validated above */}
            <a
              href={`https://blogs.tirup.in/${encodeURIComponent(slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-0.5"
            >
              <span className="link-hover pb-0.5">View on original site</span> <ArrowUpRight size={11} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
            </a>
          </div>
        </TextWithBlur>

        {/* TL;DR inline on mobile only — hidden on desktop */}
        {safeTldrHtml && !safeContentHtml.includes("tldr-box") && (
          <TextWithBlur delay={90}>
            <div className="tldr-box max-w-3xl mb-8 block md:hidden">
              <span className="tldr-label">TL;DR</span>
              <div
                className="text-base md:text-lg font-light leading-relaxed text-black/75 dark:text-white/75"
                dangerouslySetInnerHTML={{ __html: safeTldrHtml }}
              />
            </div>
          </TextWithBlur>
        )}

        {/* Article Content — sanitized HTML from external API */}
        <TextWithBlur delay={120}>
          <div className="blog-content text-black/80 dark:text-white/85 max-w-3xl mb-16">
            <div dangerouslySetInnerHTML={{ __html: safeContentHtml }} />
          </div>
        </TextWithBlur>

        {/* Footer */}
        <footer className="py-6 text-center border-t border-black/10 dark:border-white/10 mt-8">
          <p className="text-sm text-black/50 dark:text-white/50">© {currentYear} Tirup Mehta. All rights reserved.</p>
        </footer>
      </div>

      {/* TL;DR Animated Summary Popup — rendered as direct child of main to align on viewport edge on desktop */}
      <TldrPopup safeTldrHtml={safeTldrHtml} />
    </main>
  )
}
