import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Next.js 16 Proxy (Edge) — Security Layer
 *
 * Runs on every request BEFORE it reaches pages/API routes.
 * In Next.js 16+, this file replaces the deprecated `middleware.ts`.
 * Responsibilities:
 *  1. Block obviously malicious request patterns
 *  2. Strip dangerous query parameters that could confuse downstream parsers
 *  3. Block common vulnerability scanner paths
 */

// ─── Blocked path patterns ─────────────────────────────────────────────────────
// These are common scanner/exploit paths. Blocking them reduces server-side noise
// and prevents misconfigured routes from being accidentally exposed.
const BLOCKED_PATH_PATTERNS = [
  // Common web shells
  /\.(php|asp|aspx|jsp|cgi|sh|bash|py|rb|pl)$/i,
  // Git/SVN/env exposure
  /\/\.git\//,
  /\/\.env/,
  /\/\.svn\//,
  /\/\.hg\//,
  // Common sensitive paths
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/wp-config/i,
  /\/phpmyadmin/i,
  /\/adminer/i,
  /\/admin\/login/i,
  /\/xmlrpc\.php/i,
  // Path traversal attempts
  /\.\.\//,
  /%2e%2e/i,
  /%252e/i,
  // Null byte injection
  /%00/,
  // Server-Side Template Injection probes
  /\{\{.*\}\}/,
  /\$\{.*\}/,
  // SQL injection probes in paths (basic)
  /union\s+select/i,
  /;\s*drop\s+table/i,
]

// ─── Maximum allowed URL length ────────────────────────────────────────────────
// Extremely long URLs are a common DoS / buffer overflow probe vector.
const MAX_URL_LENGTH = 2048

export function proxy(request: NextRequest) {
  const { pathname, search, href } = request.nextUrl

  // ── 1. Block oversized URLs ───────────────────────────────────────────────
  if (href.length > MAX_URL_LENGTH) {
    return new NextResponse("Request URI Too Long", { status: 414 })
  }

  // ── 2. Block scanner / exploit paths ──────────────────────────────────────
  const fullPath = pathname + search
  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(fullPath)) {
      return new NextResponse("Not Found", { status: 404 })
    }
  }

  // ── 3. Block requests with dangerous HTTP methods ─────────────────────────
  // This portfolio site only needs GET and HEAD. Block everything else to
  // reduce the attack surface.
  const method = request.method.toUpperCase()
  if (!["GET", "HEAD"].includes(method)) {
    return new NextResponse("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    })
  }

  // ── 4. Continue to the page/route ─────────────────────────────────────────
  const response = NextResponse.next()

  // ── 5. Remove server fingerprinting headers ───────────────────────────────
  // Next.js + Vercel add these — strip them for defence-in-depth.
  response.headers.delete("x-powered-by")
  response.headers.delete("server")

  return response
}

export const config = {
  // Run on all routes EXCEPT Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|profile.png|placeholder|.*\\.pdf).*)",
  ],
}
