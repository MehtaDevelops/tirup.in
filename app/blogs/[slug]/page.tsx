import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import TextWithBlur from "@/components/text-with-blur"
import TldrPopup from "@/components/tldr-popup"
import { BlogContentRenderer } from "@/components/blog-content-renderer"
import { sanitizeHtml, renderMarkdownSafe } from "@/lib/sanitize"
import { CONVEX_API_URL } from "@/lib/utils"
import { notFound } from "next/navigation"

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
const SAFE_SLUG_RE = /^[a-zA-Z0-9_.-]{1,300}$/

function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== "string") return false
  return SAFE_SLUG_RE.test(slug)
}

// ─── API base URL ─────────────────────────────────────────────────────────────
const API_BASE = CONVEX_API_URL.replace(/\/+$/, "")

export const dynamicParams = true
export const revalidate = 60 // Revalidate posts every minute

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/posts`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const posts = await res.json()
    if (Array.isArray(posts)) {
      return posts
        .filter((post) => post && post.slug && (post.status === "published" || !post.status))
        .map((post: { slug: string }) => ({
          slug: String(post.slug),
        }))
    }
  } catch (err) {
    console.error("Failed to generate static params for blogs:", err)
  }
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let slug = ""
  try {
    const p = await params
    slug = p?.slug || ""
  } catch {
    return { title: "Article Not Found" }
  }

  // Validate slug before using in any external fetch
  if (!isValidSlug(slug)) {
    return { title: "Article Not Found" }
  }

  try {
    const res = await fetch(`${API_BASE}/api/post?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) return { title: "Article Not Found" }

    const data = await res.json()
    if (data && !data.error && data.title) {
      const title = String(data.title).slice(0, 200)
      const description = String(data.tldr ?? "").slice(0, 300)
      const originalUrl = `https://blogs.tirup.in/${encodeURIComponent(slug)}`
      return {
        title,
        description,
        alternates: { canonical: originalUrl },
        robots: { index: false, follow: true },
        openGraph: {
          title: `${title} | Tirup Mehta`,
          description,
          type: "article",
          url: originalUrl,
          images: ["/profile.png"],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: ["/profile.png"],
        },
      }
    }
  } catch (err) {
    console.error("[blog/metadata] Error fetching post metadata:", err)
  }
  return {
    title: "Article Not Found",
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  let slug = ""
  try {
    const p = await params
    slug = p?.slug || ""
  } catch {
    notFound()
  }

  // ── Validate slug strictly before touching the network ─────────────────────
  if (!isValidSlug(slug)) {
    notFound()
  }

  let post: BlogPost | null = null

  try {
    const res = await fetch(`${API_BASE}/api/post?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    })

    if (res.ok) {
      const data = await res.json()
      if (data && !data.error && data.title) {
        post = data
      }
    }
  } catch (err) {
    console.error("[blog/page] Failed to fetch post:", err)
  }

  if (!post) {
    notFound()
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ""
      const day = String(date.getDate()).padStart(2, "0")
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    } catch {
      return ""
    }
  }

  const currentYear = new Date().getFullYear()

  // ── Sanitize ALL content from the external API before rendering ─────────────
  let safeContentHtml = ""
  let safeTldrHtml = ""
  try {
    safeContentHtml = sanitizeHtml(post.contentHtml ?? "")
    safeTldrHtml = renderMarkdownSafe(post.tldr ?? "")
  } catch (e) {
    console.error("[blog/page] Error sanitizing post content:", e)
    safeContentHtml = post.contentHtml ?? ""
    safeTldrHtml = post.tldr ?? ""
  }

  const safeTitle = String(post.title ?? "").slice(0, 300)
  const safeReadingTime = Number.isFinite(post.readingTime) ? Math.max(1, Math.min(999, post.readingTime)) : 0
  const safeTags = Array.isArray(post.tags)
    ? post.tags
        .filter((t) => typeof t === "string")
        .map((t) => t.replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 60))
        .slice(0, 20)
    : []

  // Wrap tables in responsive scroll wrapper if not already wrapped
  const processBlogHtml = (html: string) => {
    if (!html) return ""
    const unwrapped = html.replace(/<div class="table-wrapper">\s*(<table[\s\S]*?<\/table>)\s*<\/div>/gi, "$1")
    return unwrapped.replace(/(<table[\s\S]*?<\/table>)/gi, '<div class="table-wrapper">$1</div>')
  }

  return (
    <main className="relative min-h-screen">
      <div className="section px-6 md:px-20 pt-8 sm:pt-10 md:pt-14 pb-16 max-w-4xl mx-auto w-full">
        
        {/* Breadcrumb Header */}
        <TextWithBlur>
          <div className="flex items-center gap-2 text-xs md:text-sm text-black/40 dark:text-white/40 mb-5 sm:mb-7 select-none flex-wrap">
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-serif italic text-black dark:text-white mb-5 leading-[1.18] max-w-3xl font-medium break-words">
            {safeTitle}
          </h1>
        </TextWithBlur>

        {/* Article Header info */}
        <TextWithBlur delay={50}>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs md:text-sm text-black/40 dark:text-white/40 mb-3">
            <span>Essay</span>
            <span className="select-none text-black/20 dark:text-white/20">/</span>
            <span className="tabular-nums">{formatDate(post.createdAt)}</span>
            {safeReadingTime > 0 && (
              <>
                <span className="select-none text-black/20 dark:text-white/20">/</span>
                <span className="tabular-nums">{safeReadingTime} min read</span>
              </>
            )}
          </div>
        </TextWithBlur>

        {/* Separator line */}
        <TextWithBlur delay={80}>
          <div className="border-b border-black/5 dark:border-white/5 mb-8 sm:mb-10 pb-2 flex justify-between items-center max-w-3xl">
            {safeTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {safeTags.map((tag) => (
                  <span key={tag} className="text-xs font-light text-black/40 dark:text-white/40">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {/* External link to blogs.tirup.in */}
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
              <div className="tldr-header flex items-center gap-2.5 mb-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/40 dark:bg-white/40 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black dark:bg-white" />
                </span>
                <span className="tldr-label text-xs sm:text-[13px] font-normal text-black dark:text-white">
                  TL;DR Summary
                </span>
              </div>
              <div
                className="text-base md:text-lg font-light leading-relaxed text-black/75 dark:text-white/75"
                dangerouslySetInnerHTML={{ __html: safeTldrHtml }}
              />
            </div>
          </TextWithBlur>
        )}

        {/* Article Content — sanitized and enhanced with copy buttons */}
        <TextWithBlur delay={120}>
          <BlogContentRenderer html={processBlogHtml(safeContentHtml)} />
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
