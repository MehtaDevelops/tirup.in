import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import TextWithBlur from "@/components/text-with-blur"
import ExpressionAvatar from "@/components/expression-avatar"
import TldrPopup from "@/components/tldr-popup"
import { BlogContentRenderer } from "@/components/blog-content-renderer"
import { ArticleAiToolbar } from "@/components/ui/article-ai-toolbar"
import { sanitizeHtml } from "@/lib/sanitize"
import { formatCategory } from "@/lib/category"
import { CONVEX_API_URL } from "@/lib/utils"
import { notFound } from "next/navigation"
import SiteFooter from "@/components/site-footer"

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
  if (!SAFE_SLUG_RE.test(slug)) return false
  if (/^\.+$/.test(slug) || slug.startsWith(".")) return false
  return true
}

function isPublishedPost(data: unknown): data is BlogPost {
  if (!data || typeof data !== "object") return false
  const d = data as Record<string, unknown>
  if (d.error) return false
  if (typeof d.title !== "string" || !d.title) return false
  // Defense-in-depth: Convex /api/post now filters drafts, but never render
  // a non-published post even if the backend ever regresses.
  if ("status" in d && d.status !== undefined && d.status !== "published") return false
  return true
}

// ─── API base URL ─────────────────────────────────────────────────────────────
const API_BASE = CONVEX_API_URL.replace(/\/+$/, "")

export const dynamicParams = true
export const revalidate = 60 // Revalidate posts every minute

export async function generateStaticParams() {
  try {
    // Build-time read of the post list. Must NOT reuse Next's fetch cache:
    // a stale list leaves freshly published posts out of the prerender
    // manifest, and the on-demand fallback for /writing/[slug] is what
    // throws on Vercel (every non-prerendered slug, valid or not, 500s).
    const res = await fetch(`${API_BASE}/api/posts`, {
      cache: "no-store",
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
    if (isPublishedPost(data)) {
      // TL;DR is plain text on both sites (matches blogs.tirup.in metadata)
      const description = String(data.tldr ?? "").slice(0, 2000)
      const title = String(data.title).slice(0, 200)
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
          // Share image comes from ./opengraph-image.tsx
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          // Share image comes from ./twitter-image.tsx
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
      if (isPublishedPost(data)) {
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
      // UTC getters so Vercel regions render the identical day string (parity with blogs)
      const day = String(date.getUTCDate()).padStart(2, "0")
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const month = months[date.getUTCMonth()]
      const year = date.getUTCFullYear()
      return `${day}.${month}.${year}`
    } catch {
      return ""
    }
  }

  const currentYear = new Date().getUTCFullYear()

  // ── Sanitize ALL content from the external API before rendering ─────────────
  // Fail CLOSED: never render raw HTML if the sanitizer throws.
  let safeContentHtml = ""
  try {
    safeContentHtml = sanitizeHtml(post.contentHtml ?? "")
  } catch (e) {
    console.error("[blog/page] Error sanitizing post content:", e)
    safeContentHtml = ""
  }
  // TL;DR is plain text (React escapes it), same as blogs.tirup.in
  const tldrText = String(post.tldr ?? "").slice(0, 2000)

  const safeTitle = String(post.title ?? "").slice(0, 300)
  const safeReadingTime = Number.isFinite(post.readingTime) ? Math.max(1, Math.min(999, post.readingTime)) : 0
  const safeTags = Array.isArray(post.tags)
    ? post.tags
        .filter((t) => typeof t === "string")
        .map((t) => t.replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 60))
        .slice(0, 20)
    : []

  const dynamicCategory = formatCategory(safeTags)

  // ── Related Reading: same selection logic as blogs.tirup.in/[slug] ─────────
  // Chronological neighbours always included, then same-tag overlap with most
  // recent as tiebreaker, capped at 3. Fails soft: any error hides the section.
  type RelatedPost = { slug: string; title: string; createdAt: string; readingTime: number; tags: string[] }
  let relatedPosts: RelatedPost[] = []
  try {
    const listRes = await fetch(`${API_BASE}/api/posts`, { next: { revalidate: 60 } })
    if (listRes.ok) {
      const raw = await listRes.json()
      if (Array.isArray(raw)) {
        const allPosts: RelatedPost[] = raw
          .filter(
            (p) =>
              p &&
              typeof p.slug === "string" &&
              isValidSlug(p.slug) &&
              typeof p.title === "string" &&
              p.title &&
              (p.status === "published" || !p.status)
          )
          .map((p) => ({
            slug: p.slug as string,
            title: String(p.title).slice(0, 300),
            createdAt: String(p.createdAt ?? ""),
            readingTime: Number.isFinite(p.readingTime) ? p.readingTime : 0,
            tags: Array.isArray(p.tags)
              ? p.tags
                  .filter((t: unknown): t is string => typeof t === "string")
                  .map((t: string) => t.replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 60))
                  .slice(0, 20)
              : [],
          }))
        const time = (p: RelatedPost) => new Date(p.createdAt).getTime()
        const ordered = [...allPosts].sort((a, b) => time(b) - time(a))
        const myIndex = ordered.findIndex((p) => p.slug === slug)
        const neighbours: RelatedPost[] = []
        if (myIndex >= 0) {
          if (ordered[myIndex - 1]) neighbours.push(ordered[myIndex - 1])
          if (ordered[myIndex + 1]) neighbours.push(ordered[myIndex + 1])
        }
        const tagRanked = allPosts
          .filter((p) => p.slug !== slug)
          .map((p) => ({ post: p, shared: p.tags.filter((t) => safeTags.includes(t)).length }))
          .sort((a, b) => (b.shared !== a.shared ? b.shared - a.shared : time(b.post) - time(a.post)))
          .map(({ post: related }) => related)
        const neighbourSlugs = new Set(neighbours.map((p) => p.slug))
        relatedPosts = [...neighbours, ...tagRanked.filter((p) => !neighbourSlugs.has(p.slug))].slice(0, 3)
      }
    }
  } catch {
    relatedPosts = []
  }

  // Wrap tables in responsive scroll wrapper if not already wrapped
  const processBlogHtml = (html: string) => {
    if (!html) return ""
    const unwrapped = html.replace(/<div class="table-wrapper">\s*(<table[\s\S]*?<\/table>)\s*<\/div>/gi, "$1")
    return unwrapped.replace(/(<table[\s\S]*?<\/table>)/gi, '<div class="table-wrapper">$1</div>')
  }

  return (
    <main className="relative min-h-screen flex flex-col">
      <div className="section px-6 md:px-20 pt-8 sm:pt-10 md:pt-14 pb-16 max-w-4xl mx-auto w-full">
        
        {/* Breadcrumb Header */}
        <TextWithBlur>
          <div className="flex items-center gap-2 text-xs md:text-sm text-black/40 dark:text-white/40 mb-5 sm:mb-7 select-none flex-wrap">
            <Link href="/" className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors">
              <div className="shrink-0">
                <ExpressionAvatar size={20} interactive={false} face="laugh" />
              </div>
              <span className="font-light">Tirup Mehta</span>
            </Link>
            <span className="text-black/20 dark:text-white/20 select-none">›</span>
            <Link href="/writing" className="hover:text-black dark:hover:text-white transition-colors font-light">
              Writing
            </Link>
            <span className="text-black/20 dark:text-white/20 select-none">›</span>
            <span className="truncate max-w-[200px] sm:max-w-xs font-light text-black/30 dark:text-white/30">{safeTitle}</span>
          </div>
        </TextWithBlur>

        {/* Title */}
        <TextWithBlur delay={50}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-black dark:text-white mb-5 leading-[1.15] max-w-3xl font-medium break-words">
            {safeTitle}
          </h1>
        </TextWithBlur>

        {/* Article Header info */}
        <TextWithBlur delay={50}>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs md:text-sm text-black/50 dark:text-white/50 mb-3">
            <span>{dynamicCategory}</span>
            <span className="select-none text-black/25 dark:text-white/25">/</span>
            <span className="tabular-nums">{formatDate(post.createdAt)}</span>
            {safeReadingTime > 0 && (
              <>
                <span className="select-none text-black/25 dark:text-white/25">/</span>
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
                  <span key={tag} className="text-xs font-light text-black/55 dark:text-white/55">
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

        {/* TL;DR inline on mobile only: hidden on desktop */}
        {tldrText && !safeContentHtml.includes("tldr-box") && (
          <TextWithBlur delay={90}>
            <div className="tldr-box max-w-3xl mb-8 block md:hidden">
              <div className="tldr-header flex items-center gap-2.5 mb-2">
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tldr-accent)]" />
                <span className="tldr-label text-xs sm:text-[13px] font-normal text-black dark:text-white">
                  TL;DR Summary
                </span>
              </div>
              <p>
                {tldrText}
              </p>
            </div>
          </TextWithBlur>
        )}

        {/* Article Content: sanitized and enhanced with copy buttons + AI selection toolbar */}
        <TextWithBlur delay={120}>
          <ArticleAiToolbar articleTitle={safeTitle}>
            <BlogContentRenderer html={processBlogHtml(safeContentHtml)} />
          </ArticleAiToolbar>
        </TextWithBlur>

        {/* Related Reading: identical markup to blogs.tirup.in (links stay inside /writing) */}
        {relatedPosts.length > 0 && (
          <TextWithBlur delay={140}>
            <nav aria-label="Related articles" className="max-w-3xl mt-8 mb-0 border-t border-black/5 dark:border-white/5 pt-8">
              <h2 className="text-lg sm:text-xl font-serif italic text-black dark:text-white mb-5">
                Related Reading
              </h2>
              <ul className="flex flex-col gap-4">
                {relatedPosts.map((related) => (
                  <li key={related.slug}>
                    <Link
                      href={`/writing/${related.slug}`}
                      className="group block active:scale-[0.99] transition-transform"
                    >
                      <span className="link-hover text-lg text-black/80 dark:text-white/85 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {related.title}
                      </span>
                      <span className="block mt-1 text-xs md:text-sm text-black/50 dark:text-white/50">
                        {formatCategory(related.tags)}
                        <span className="select-none text-black/25 dark:text-white/25"> / </span>
                        <span className="tabular-nums">{formatDate(related.createdAt)}</span>
                        {related.readingTime > 0 && (
                          <>
                            <span className="select-none text-black/25 dark:text-white/25"> / </span>
                            <span className="tabular-nums">{related.readingTime} min read</span>
                          </>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </TextWithBlur>
        )}
      </div>

      <SiteFooter />

      {/* TL;DR Animated Summary Popup: rendered as direct child of main to align on viewport edge on desktop */}
      <TldrPopup safeTldrHtml={tldrText} />
    </main>
  )
}
