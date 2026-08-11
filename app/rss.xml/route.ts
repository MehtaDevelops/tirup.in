import { NextResponse } from "next/server"
import { CONVEX_API_URL } from "@/lib/utils"

interface BlogPost {
  slug: string
  title: string
  tldr?: string
  createdAt: string
  status?: string
}

// In-Memory DDoS Protection Cache
let cachedRssXml: string | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour cache buffer

export async function GET() {
  const siteUrl = "https://tirup.in"
  const now = Date.now()

  // Return in-memory cached RSS XML instantly to prevent downstream database overload during DDoS
  if (cachedRssXml && now - cacheTimestamp < CACHE_TTL_MS) {
    return new NextResponse(cachedRssXml, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        "X-Cache-Status": "HIT",
      },
    })
  }

  let posts: BlogPost[] = []

  try {
    const res = await fetch(`${CONVEX_API_URL}/api/posts`, {
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    if (Array.isArray(data)) {
      posts = data
    }
  } catch (err) {
    console.error("[RSS] Failed to fetch posts:", err)
  }

  const itemsXml = posts
    .map(
      (blog: BlogPost) => `
    <item>
      <title><![CDATA[${blog.title}]]></title>
      <link>${siteUrl}/blogs/${blog.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blogs/${blog.slug}</guid>
      <pubDate>${new Date(blog.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${blog.tldr || blog.title}]]></description>
    </item>`
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
