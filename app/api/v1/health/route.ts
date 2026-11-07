import { API_VERSION, handleHead, json, preflight } from "@/lib/api"
import { methodNotAllowed, rateLimitGuard, rateLimitHeaders } from "@/lib/problem"

/**
 * GET /api/v1/health
 *
 * Liveness probe. Deliberately touches no downstream service: a 200 here means
 * the deployment is serving requests, nothing more. Uptime is process-local, so
 * it restarts from zero on every cold start and is advisory only.
 */

const startedAt = Date.now()

export const dynamic = "force-dynamic"

export async function GET(request: Request): Promise<Response> {
  const { result, blocked } = rateLimitGuard(request, 120, 60_000)
  if (blocked) return blocked

  return json(
    {
      status: "ok",
      service: "tirup.in",
      version: API_VERSION,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      links: {
        self: "https://tirup.in/api/v1/health",
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

/** Every other verb gets a parseable error rather than an HTML page. */
export function POST(request: Request): Response {
  return methodNotAllowed(request)
}
