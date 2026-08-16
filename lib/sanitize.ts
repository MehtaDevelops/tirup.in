/**
 * Production-hardened, serverless-safe HTML sanitizer and markdown parser.
 * Designed to execute synchronously with zero native C++ / JSDOM dependencies,
 * guaranteeing 100% stability across Node.js SSR, Edge runtime, and Vercel serverless.
 */

const DANGEROUS_TAGS_RE = /<\/?(?:script|style|iframe|object|embed|applet|form|input|button|textarea|select|option|base|meta|link|svg|math|template|noscript)\b[^>]*>/gi
const DANGEROUS_ATTRIBUTES_RE = /\s*(?:on[a-z]+|formaction|action)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const JAVASCRIPT_URL_RE = /(href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data:(?!image\/[a-z0-9+.-]+;base64,)[^"'>]+)\2/gi

/**
 * Sanitizes raw HTML from external sources (e.g., Convex CMS / TipTap editor)
 * for safe rendering via dangerouslySetInnerHTML.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return ""

  try {
    let clean = dirty
      // 1. Remove dangerous executable tags completely
      .replace(DANGEROUS_TAGS_RE, "")
      // 2. Strip all inline DOM event handlers (e.g. onclick, onerror, onload)
      .replace(DANGEROUS_ATTRIBUTES_RE, "")
      // 3. Neutralize dangerous URL schemes (javascript:, vbscript:, non-image data:)
      .replace(JAVASCRIPT_URL_RE, '$1="#"')

    // 4. Enforce security on blank target links
    clean = clean.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
      if (/target\s*=\s*["']_blank["']/i.test(attrs)) {
        if (/rel\s*=\s*["'][^"']*["']/i.test(attrs)) {
          attrs = attrs.replace(/rel\s*=\s*["']([^"']*)["']/i, (_: string, existing: string) => {
            const rels = new Set(existing.split(/\s+/).filter(Boolean))
            rels.add("noopener")
            rels.add("noreferrer")
            return `rel="${Array.from(rels).join(" ")}"`
          })
        } else {
          attrs += ' rel="noopener noreferrer"'
        }
      }
      return `<a${attrs}>`
    })

    // 5. Add lazy loading to images if not already present
    clean = clean.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
      if (!/loading\s*=/i.test(attrs)) {
        attrs += ' loading="lazy"'
      }
      return `<img${attrs}>`
    })

    return clean
  } catch (err) {
    console.error("[sanitize] Error sanitizing HTML:", err)
    return ""
  }
}

/** URL schemes allowed in href attributes for markdown links */
const SAFE_URL_SCHEMES = /^(https?:|mailto:|#|\/)/i

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * Converts lightweight markdown strings (TL;DR summaries, author bios) to safe HTML.
 */
export function renderMarkdownSafe(text: string): string {
  if (!text || typeof text !== "string") return ""

  try {
    // 1. Escape raw HTML entities first to prevent injection
    let html = escapeHtml(text)

    // 2. Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // 3. Italics: *text* and _text_
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>")
    html = html.replace(/_(.*?)_/g, "<em>$1</em>")

    // 4. Inline Code: `code`
    html = html.replace(
      /`(.*?)`/g,
      '<code class="font-mono bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-xs md:text-sm">$1</code>',
    )

    // 5. Links: [label](url) — strict validation
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_match, label, rawUrl) => {
      const trimmed = rawUrl.trim()
      const safeUrl = SAFE_URL_SCHEMES.test(trimmed) ? trimmed : "#"
      return `<a href="${escapeAttr(safeUrl)}" target="_blank" rel="noopener noreferrer" class="underline hover:text-accent transition-colors">${label}</a>`
    })

    // 6. Newlines to <br>
    html = html.replace(/\n/g, "<br />")

    return sanitizeHtml(html)
  } catch (err) {
    console.error("[sanitize] renderMarkdownSafe failed:", err)
    return ""
  }
}
