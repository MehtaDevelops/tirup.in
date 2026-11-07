/**
 * Shared response helpers for the public API at /api/v1.
 *
 * Every endpoint on this host is a read-only, unauthenticated GET. The API is
 * meant to be consumed by agents as much as by humans, so responses are:
 *   - JSON with an explicit schema (see public/openapi.json)
 *   - CORS-open, because there is no credential to leak
 *   - rate limited per client, with the RFC RateLimit headers attached
 */

export const API_VERSION = "v1"

/** CORS is safe here: every endpoint is public, read-only, and unauthenticated. */
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
  "Access-Control-Max-Age": "86400",
}

export interface JsonInit {
  status?: number
  headers?: Record<string, string>
}

/** JSON response with the headers every endpoint on this API shares. */
export function json(data: unknown, init: JsonInit = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...CORS_HEADERS,
      ...init.headers,
    },
  })
}

/** Answer for a CORS preflight. The body is empty by definition. */
export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * Sends `HEAD` through the same handler as `GET` and strips the body, so the
 * two methods can never drift apart.
 */
export async function handleHead(request: Request, get: (request: Request) => Promise<Response>): Promise<Response> {
  const response = await get(request)
  return new Response(null, {
    status: response.status,
    headers: response.headers,
  })
}
