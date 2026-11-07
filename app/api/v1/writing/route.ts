import { API_VERSION, handleHead, json, preflight } from "@/lib/api"
import { methodNotAllowed, problem, rateLimitGuard, rateLimitHeaders } from "@/lib/problem"
import { CONVEX_API_URL } from "@/lib/utils"

/**
 * GET /api/v1/writing
 *
 * Published articles as data. The list is owned by blogs.tirup.in, so every
 * `url` here is the canonical blog URL, not the syndicated copy on this host.
 *
 * Query parameters:
 *   limit  integer 1-50, default 10
 */

export const dynamic = "force-dynamic"

interface BlogPost {
  slug?: string
  title?: string
  tldr?: string
  createdAt?: string
  status?: string
}

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 10

function readLimit(request: Request): { limit: number; invalid: string | null } {
  const raw = new URL(request.url).searchParams.get("limit")
  if (raw === null) return { limit: DEFAULT_LIMIT, invalid: null }
  if (!/^\d+$/.test(raw)) return { limit: DEFAULT_LIMIT, invalid: raw }
  const parsed = Number(raw)
  if (parsed < 1 || parsed > MAX_LIMIT) return { limit: DEFAULT_LIMIT, invalid: raw }
  return { limit: parsed, invalid: null }
}

export async function GET(request: Request): Promise<Response> {
  const { result, blocked } = rateLimitGuard(request)
  if (blocked) return blocked

  const { limit, invalid } = readLimit(request)
  if (invalid !== null) {
    return problem({
      status: 400,
      code: "invalid_parameter",
      title: "Invalid query parameter",
      detail: `limit must be an integer between 1 and ${MAX_LIMIT}.`,
      instance: new URL(request.url).pathname,
      hint: `Omit limit to get ${DEFAULT_LIMIT} posts, or pass a value from 1 to ${MAX_LIMIT}.`,
      headers: rateLimitHeaders(result),
    })
  }

  let posts: BlogPost[] = []

  try {
    const res = await fetch(`${CONVEX_API_URL}/api/posts`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error(`upstream responded ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data)) throw new Error("upstream returned a non-array payload")

    posts = data
      .filter((post: BlogPost) => post && post.slug && (post.status === "published" || !post.status))
      .sort((a: BlogPost, b: BlogPost) => {
        const ta = new Date(a.createdAt ?? "").getTime()
        const tb = new Date(b.createdAt ?? "").getTime()
        if (isNaN(ta) && isNaN(tb)) return 0
        if (isNaN(ta)) return 1
        if (isNaN(tb)) return -1
        return tb - ta
      })
  } catch (err) {
    console.error("[api/v1/writing] Failed to fetch posts:", err)
    return problem({
      status: 502,
      code: "upstream_unavailable",
      title: "Writing feed unavailable",
      detail: "The article store did not answer in time, so no posts could be listed.",
      instance: new URL(request.url).pathname,
      hint: "Retry in a few seconds. The RSS feed at https://tirup.in/rss.xml serves the same list and may recover first.",
      headers: rateLimitHeaders(result),
    })
  }

  const items = posts.slice(0, limit).map((post) => ({
    slug: post.slug,
    title: post.title ?? "",
    tldr: post.tldr ?? "",
    publishedAt: post.createdAt ?? null,
    url: `https://blogs.tirup.in/${encodeURIComponent(String(post.slug))}`,
  }))

  return json(
    {
      version: API_VERSION,
      count: items.length,
      total: posts.length,
      limit,
      posts: items,
      links: {
        self: "https://tirup.in/api/v1/writing",
        blog: "https://blogs.tirup.in",
        rss: "https://tirup.in/rss.xml",
        openapi: "https://tirup.in/openapi.json",
      },
    },
    { headers: { ...rateLimitHeaders(result), "Cache-Control": "no-store" } }
  )
}

export async function HEAD(request: Request): Promise<Response> {
  return handleHead(request, GET)
}

export function OPTIONS(): Response {
  return preflight()
}

export function POST(request: Request): Response {
  return methodNotAllowed(request)
}
