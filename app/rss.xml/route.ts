import { NextResponse } from "next/server"
import { CONVEX_API_URL } from "@/lib/utils"

interface BlogPost {
  slug: string
  title: string
  tldr?: string
  createdAt: string
  status?: string
}

// Process-local cache. On a serverless host each instance keeps its own copy,
// so this is a load reducer, not a security control.
let cachedRssXml: string | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour cache buffer

export async function GET() {
  const siteUrl = "https://tirup.in"
  const canonicalBase = "https://blogs.tirup.in"
  const now = Date.now()

  if (cachedRssXml && now - cacheTimestamp < CACHE_TTL_MS) {
    return new NextResponse(cachedRssXml, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        "X-Cache-Status": "HIT",
      },
    })
  }

  // `null` means "we do not know", which is different from "there are no posts".
  let posts: BlogPost[] | null = null

  try {
    const res = await fetch(`${CONVEX_API_URL}/api/posts?view=summary`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Convex responded ${res.status}`)
    const data = await res.json()
    if (Array.isArray(data)) {
      posts = data
        // The summary endpoint only ever returns published posts (and omits `status`).
        .filter((p) => p && p.slug && p.title)
        .sort((a, b) => {
          const ta = new Date(a.createdAt).getTime()
          const tb = new Date(b.createdAt).getTime()
          if (isNaN(ta) && isNaN(tb)) return 0
          if (isNaN(ta)) return 1
          if (isNaN(tb)) return -1
          return tb - ta
        })
        .slice(0, 50)
    }
  } catch (err) {
    console.error("[RSS] Failed to fetch posts:", err)
  }

  // Never cache a failed read. Caching the empty document used to pin an empty
  // feed for an hour after a single upstream blip, and the response told the
  // CDN to keep it for another hour on top of that.
  if (posts === null) {
    return new NextResponse("Feed temporarily unavailable", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": "60",
      },
    })
  }

  // XML 1.0 forbids most C0 control characters; a stray one in a title makes
  // the whole feed unparseable.
  const escapeCdata = (s: string) =>
    String(s ?? "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
      .replace(/]]>/g, "]]&gt;")
  const pubDateOf = (d: string) => {
    const t = new Date(d)
    return isNaN(t.getTime()) ? new Date(0).toUTCString() : t.toUTCString()
  }

  const itemsXml = posts
    .map(
      (blog: BlogPost) => {
        const slug = encodeURIComponent(String(blog.slug))
        const canonical = `${canonicalBase}/${slug}`
        return `
    <item>
      <title><![CDATA[${escapeCdata(blog.title)}]]></title>
      <link>${canonical}</link>
      <guid isPermaLink="true">${canonical}</guid>
      <pubDate>${pubDateOf(blog.createdAt)}</pubDate>
      <description><![CDATA[${escapeCdata(blog.tldr || blog.title)}]]></description>
    </item>`
      }
    )
    .join("")

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tirup Mehta | Writing & Essays</title>
    <link>${siteUrl}</link>
    <description>Thoughts on development, design, systems, and security by Tirup Mehta.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`

  cachedRssXml = rssXml
  cacheTimestamp = now

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Cache-Status": "MISS",
    },
  })
}
