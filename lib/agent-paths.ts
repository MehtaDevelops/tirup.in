/**
 * Path classification for the agent-facing HTTP surface on tirup.in.
 *
 * src/proxy.ts runs before routing, so it cannot ask Next.js whether a URL
 * resolved. That matters for one case: an agent that sends
 * `Accept: text/markdown` to a URL that does not exist should receive a
 * Markdown 404 body (with the docs, agent guide, and sitemap), not an HTML page.
 *
 * Rather than guess, this module knows the exact set of paths that exist on
 * this host. Anything else is a 404. The HTML path is never affected: unknown
 * URLs still fall through to app/not-found.tsx with a real 404 status.
 *
 * When a new page or endpoint is added, add it here. The test suite checks that
 * every markdown-capable route is known.
 */

/** Pages that answer 200 on this host. */
export const KNOWN_STATIC_ROUTES = new Set<string>([
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/work",
  "/skills",
  "/writing",
  "/tools",
  "/tools/utm-builder",
  "/tools/qr",
  "/tool/qr",
  "/github",
  "/components",
  "/components/all",
  "/components/docs",
  "/components/liquid-ascii",
  "/components/song-bubble",
  "/docs",
  "/developers",
  "/cli",
])

/** Machine-readable files served from public/ or a route handler. */
export const KNOWN_STATIC_FILES = new Set<string>([
  "/sitemap.xml",
  "/robots.txt",
  "/rss.xml",
  "/llms.txt",
  "/openapi.json",
  "/icon.png",
  "/opengraph-image",
  "/twitter-image",
  "/.well-known/security.txt",
  "/.well-known/api-catalog",
])

/** Prefixes owned by the app: dynamic pages, the API, framework internals. */
export const KNOWN_PREFIXES = [
  "/api/",
  "/projects/",
  "/writing/",
  "/components/r/",
  "/.well-known/",
  "/_next/",
] as const

/** Single-segment article slugs on /writing/<slug>. */
export const ARTICLE_SLUG_RE = /^[a-z0-9-]+$/

/** Trailing-slash normalisation, then a set/prefix lookup. */
export function isKnownPath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname

  if (KNOWN_STATIC_ROUTES.has(normalized)) return true
  if (KNOWN_STATIC_FILES.has(normalized)) return true
  if (KNOWN_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return true
  return false
}

const MAX_ECHOED_PATH = 200

/** Strip control characters and Markdown punctuation from untrusted input. */
function safePathForMarkdown(pathname: string): string {
  const stripped = pathname
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[`\\<>]/g, "")
  return stripped.length > MAX_ECHOED_PATH
    ? `${stripped.slice(0, MAX_ECHOED_PATH)}...`
    : stripped
}

/**
 * Markdown body for a 404. Must stay useful on its own: state what failed,
 * then link the API docs, agent guide, and sitemap.
 */
export function buildNotFoundMarkdown(pathname: string): string {
  const path = safePathForMarkdown(pathname)

  return [
    "# 404: Page not found",
    "",
    `No page or resource exists at \`${path}\` on tirup.in.`,
    "",
    "## Where to look next",
    "",
    "- Homepage: https://tirup.in/",
    "- API documentation: https://tirup.in/docs",
    "- Developer portal: https://tirup.in/developers",
    "- OpenAPI 3.1 description: https://tirup.in/openapi.json",
    "- Agent guide: https://tirup.in/llms.txt",
    "- Sitemap: https://tirup.in/sitemap.xml",
    "- Writing: https://tirup.in/writing",
    "- Blog (canonical): https://blogs.tirup.in",
    "",
    "If you followed a link from another site, the page may have moved.",
    "Check the sitemap for the current URL before retrying.",
    "",
  ].join("\n")
}
