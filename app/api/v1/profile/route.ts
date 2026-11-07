import { API_VERSION, handleHead, json, preflight } from "@/lib/api"
import { methodNotAllowed, rateLimitGuard, rateLimitHeaders } from "@/lib/problem"

/**
 * GET /api/v1/profile
 *
 * The same identity facts the site publishes as JSON-LD, in a flat shape that is
 * cheaper for an agent to consume than parsing a schema.org graph.
 */

export const revalidate = 3600

const PROFILE = {
  name: "Tirup Mehta",
  alternateName: "Tirup Jayram Mehta",
  headline: "Software engineer building secure, high-performance web interfaces",
  summary:
    "Tirup Mehta is a software engineering student in Gujarat, India, working at the intersection of frontend engineering, systems security, and cryptography. He builds React and Next.js interfaces with secure-by-default architectures.",
  jobTitle: "Student Software Engineer",
  location: {
    locality: "Gujarat",
    country: "India",
    countryCode: "IN",
  },
  avatar: "https://tirup.in/profile.png",
  url: "https://tirup.in",
  blog: "https://blogs.tirup.in",
  email: null,
  knowsAbout: [
    "Software Engineering",
    "Computer Science",
    "Frontend Development",
    "Web Security",
    "Cryptography",
    "React",
    "Next.js",
    "TypeScript",
    "UI/UX Design",
    "Information Security",
  ],
  sameAs: [
    "https://github.com/TirupMehta",
    "https://www.linkedin.com/in/TirupMehta",
    "https://x.com/TirupMehta",
    "https://peerlist.io/tirupmehta",
    "https://www.kaggle.com/TirupMehta",
    "https://medium.com/@TirupMehta",
    "https://youtube.com/@TirupMehta",
    "https://instagram.com/TirupMehta",
    "https://blogs.tirup.in",
  ],
  contact: "https://tirup.in/contact",
  version: API_VERSION,
} as const

export async function GET(request: Request): Promise<Response> {
  const { result, blocked } = rateLimitGuard(request)
  if (blocked) return blocked

  return json(PROFILE, {
    headers: {
      ...rateLimitHeaders(result),
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
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
