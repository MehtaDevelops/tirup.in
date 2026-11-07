/**
 * RFC 9457 problem responses and rate limiting for the public API.
 *
 * Every error the public API returns is `application/problem+json` with a
 * machine-readable `code`, a human-readable `title`/`detail`, and a `hint`
 * telling the caller what to do next. Agents can branch on `code` instead of
 * scraping prose.
 */

export interface ProblemOptions {
  status: number
  /** Stable, machine-readable identifier, e.g. `not_found`. */
  code: string
  title: string
  detail: string
  /** Request path the problem occurred on. */
  instance?: string
  /** Actionable next step. */
  hint?: string
  headers?: Record<string, string>
}

export interface ProblemBody {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
  code: string
  hint?: string
}

export function problem(options: ProblemOptions): Response {
  const { status, code, title, detail, instance, hint, headers } = options

  const body: ProblemBody = {
    type: `https://tirup.in/docs#error-${code}`,
    title,
    status,
    detail,
    code,
    ...(instance ? { instance } : {}),
    ...(hint ? { hint } : {}),
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/problem+json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
      ...headers,
    },
  })
}

// ── Rate limiting ────────────────────────────────────────────────────────────
// Fixed-window, in-memory, per instance. Best-effort by design: Vercel may run
// several instances, so this protects the origin from a single hot loop rather
// than promising a global quota. The headers let a well-behaved agent throttle
// itself either way.

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  /** Seconds until the window resets. */
  reset: number
  /** Window length in seconds. */
  window: number
}

const buckets = new Map<string, { count: number; resetAt: number }>()
const MAX_BUCKETS = 5000

export const DEFAULT_LIMIT = 60
export const DEFAULT_WINDOW_MS = 60_000

export function checkRateLimit(
  identifier: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now()

  // Keep the map bounded: drop expired buckets when it grows too large.
  if (buckets.size > MAX_BUCKETS) {
    for (const [key, entry] of buckets) {
      if (now >= entry.resetAt) buckets.delete(key)
    }
  }

  const entry = buckets.get(identifier)
  const window = Math.round(windowMs / 1000)

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs
    buckets.set(identifier, { count: 1, resetAt })
    return { allowed: true, limit, remaining: limit - 1, reset: window, window }
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      reset: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      window,
    }
  }

  entry.count += 1
  return {
    allowed: true,
    limit,
    remaining: limit - entry.count,
    reset: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    window,
  }
}

/** RFC RateLimit header set. `Retry-After` is added only on a 429. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(result.reset),
    "RateLimit-Policy": `${result.limit};w=${result.window}`,
  }
  if (!result.allowed) headers["Retry-After"] = String(result.reset)
  return headers
}

/** Best-effort client identity for rate limiting. */
export function clientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return request.headers.get("x-real-ip")?.trim() || "anonymous"
}

/**
 * Runs the rate limit and returns either `null` (allowed, caller should add
 * `rateLimitHeaders` to its response) or a ready 429 problem response.
 */export function rateLimitGuard(
  request: Request,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS
): { result: RateLimitResult; blocked: Response | null } {
  const result = checkRateLimit(clientId(request), limit, windowMs)
  if (result.allowed) return { result, blocked: null }

  const pathname = new URL(request.url).pathname
  const blocked = problem({
    status: 429,
    code: "rate_limited",
    title: "Rate limit exceeded",
    detail: `This endpoint allows ${limit} requests per ${Math.round(windowMs / 1000)} seconds per client.`,
    instance: pathname,
    hint: `Wait ${result.reset} seconds (see Retry-After) before retrying.`,
    headers: rateLimitHeaders(result),
  })
  return { result, blocked }
}

/** Standard 405 for a read-only endpoint. */
export function methodNotAllowed(request: Request): Response {
  return problem({
    status: 405,
    code: "method_not_allowed",
    title: "Method not allowed",
    detail: "This endpoint is read-only. Use GET or HEAD.",
    instance: new URL(request.url).pathname,
    hint: "Retry with GET.",
    headers: { Allow: "GET, HEAD, OPTIONS" },
  })
}

/** Standard 404 for an API path this deployment does not serve. */
export function notFound(request: Request): Response {
  return problem({
    status: 404,
    code: "not_found",
    title: "No such API endpoint",
    detail: `No API endpoint is served at ${new URL(request.url).pathname}.`,
    instance: new URL(request.url).pathname,
    hint: "See https://tirup.in/docs for the list of endpoints, or fetch https://tirup.in/openapi.json.",
  })
}
