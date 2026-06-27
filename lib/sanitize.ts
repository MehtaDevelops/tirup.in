/**
 * HTML sanitizer for blog content received from external APIs.
 *
 * Strategy: allowlist-based tag/attribute filtering.
 * We NEVER trust `contentHtml` from the Convex API — it is server-rendered
 * content that must be sanitised before being injected via dangerouslySetInnerHTML.
 *
 * This runs server-side in Next.js RSC, so no client-side sanitization library
 * weight is added to the bundle.
 */

/** Tags that are safe to render in blog content */
const ALLOWED_TAGS = new Set([
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "del", "ins",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a",
  "img",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "div", "span", "section", "article", "aside", "header", "footer",
  "figure", "figcaption",
  "mark", "small", "sub", "sup",
  "details", "summary",
])

/** Attributes allowed on any tag */
const ALLOWED_ATTRS_GLOBAL = new Set([
  "class", "id", "style",
])

/** Per-tag attribute allowlists (merged with global) */
const ALLOWED_ATTRS_PER_TAG: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height", "loading"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  ol: new Set(["start", "type"]),
  li: new Set(["value"]),
}

/** URL schemes allowed in href/src attributes */
const SAFE_URL_SCHEMES = /^(https?:|mailto:|#|\/)/i

/** Strip dangerous CSS from style attributes */
function sanitizeStyle(style: string): string {
  return style
    .replace(/url\s*\(.*?\)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/@import/gi, "")
}

/**
 * Sanitize a URL value — only allow safe schemes.
 */
function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  if (SAFE_URL_SCHEMES.test(trimmed)) return trimmed
  return "#"
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * Parse attribute string into a Map<name, value>.
 */
function parseAttrs(attrStr: string): Map<string, string> {
  const attrs = new Map<string, string>()
  const re = /([a-zA-Z][a-zA-Z0-9\-_:]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(attrStr)) !== null) {
    const name = m[1].toLowerCase()
    const value = m[2] ?? m[3] ?? m[4] ?? ""
    attrs.set(name, value)
  }
  return attrs
}

/**
 * Serialise a Map of attributes back to a string, enforcing per-tag allowlists.
 */
function serialiseAttrs(tag: string, attrs: Map<string, string>): string {
  const perTag = ALLOWED_ATTRS_PER_TAG[tag] ?? new Set<string>()
  let result = ""

  for (const [name, value] of attrs) {
    if (!ALLOWED_ATTRS_GLOBAL.has(name) && !perTag.has(name)) continue
    if (/^on/i.test(name)) continue // block event handlers

    if (name === "style") {
      const safe = sanitizeStyle(value)
      if (safe) result += ` ${name}="${escapeAttr(safe)}"`
      continue
    }
    if (name === "href" || name === "src") {
      result += ` ${name}="${escapeAttr(sanitizeUrl(value))}"`
      continue
    }
    result += ` ${name}="${escapeAttr(value)}"`
  }
  return result
}

/**
 * Main sanitizer: strips disallowed tags/attributes from arbitrary HTML.
 * Enforces noopener noreferrer on external links.
 *
 * @param dirty - Raw HTML string from an external source
 * @returns Sanitized HTML safe for dangerouslySetInnerHTML
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ""

  return dirty.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?(\/?)>/g,
    (_match, closingSlash, rawTag, rawAttrs, selfClose) => {
      const tag = rawTag.toLowerCase()
      if (!ALLOWED_TAGS.has(tag)) return ""
      if (closingSlash) return `</${tag}>`

      let attrs = parseAttrs(rawAttrs ?? "")

      // Remove ALL event handler attributes
      for (const name of [...attrs.keys()]) {
        if (/^on/i.test(name)) attrs.delete(name)
      }

      // Enforce safe links
      if (tag === "a") {
        const href = attrs.get("href") ?? ""
        attrs.set("href", sanitizeUrl(href))
        if (attrs.get("target") === "_blank") {
          attrs.set("rel", "noopener noreferrer")
        }
      }

      // Enforce safe image sources
      if (tag === "img") {
        const src = attrs.get("src") ?? ""
        attrs.set("src", sanitizeUrl(src))
        // Force lazy loading on images
        if (!attrs.has("loading")) attrs.set("loading", "lazy")
      }

      const attrStr = serialiseAttrs(tag, attrs)
      const sc = selfClose ? " /" : ""
      return `<${tag}${attrStr}${sc}>`
    },
  )
}

/**
 * Safe renderMarkdown: converts lightweight markdown to HTML, then sanitizes.
 *
 * Protects against:
 * - XSS via javascript: URLs in links
 * - HTML injection via markdown link labels or inline code
 * - Script/event-handler injection
 */
export function renderMarkdownSafe(text: string): string {
  if (!text) return ""

  // 1. Escape raw HTML first (prevents injection through markdown)
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

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

  // 5. Links: [label](url) — sanitize URL strictly
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_match, label, rawUrl) => {
    const safeUrl = SAFE_URL_SCHEMES.test(rawUrl.trim()) ? rawUrl.trim() : "#"
    return `<a href="${escapeAttr(safeUrl)}" target="_blank" rel="noopener noreferrer" class="underline hover:text-accent transition-colors">${label}</a>`
  })

  // 6. Newlines → <br>
  html = html.replace(/\n/g, "<br />")

  return html
}
