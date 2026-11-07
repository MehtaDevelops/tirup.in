import { API_VERSION, handleHead, json, preflight } from "@/lib/api"
import { methodNotAllowed, rateLimitGuard, rateLimitHeaders } from "@/lib/problem"
import { projectsData } from "@/lib/projects-data"

/**
 * GET /api/v1/projects
 *
 * The portfolio's project index as data. `github` is normalised to a full URL
 * because the source data stores it without a scheme in some entries.
 */

export const revalidate = 3600

interface ProjectEntry {
  title?: string
  description?: string
  fullDescription?: string
  liveUrl?: string
  github?: string
  techStack?: string[]
  stats?: Record<string, string>
}

function githubUrl(value?: string): string | null {
  if (!value) return null
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

export async function GET(request: Request): Promise<Response> {
  const { result, blocked } = rateLimitGuard(request)
  if (blocked) return blocked

  const entries = Object.entries(projectsData as Record<string, ProjectEntry>)

  const projects = entries.map(([slug, project]) => ({
    slug,
    title: project.title ?? slug,
    description: project.description ?? "",
    url: `https://tirup.in/projects/${slug}`,
    liveUrl: project.liveUrl ?? null,
    repository: githubUrl(project.github),
    techStack: project.techStack ?? [],
    stats: project.stats ?? {},
  }))

  return json(
    {
      version: API_VERSION,
      count: projects.length,
      projects,
      links: {
        self: "https://tirup.in/api/v1/projects",
        openapi: "https://tirup.in/openapi.json",
      },
    },
    {
      headers: {
        ...rateLimitHeaders(result),
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
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
