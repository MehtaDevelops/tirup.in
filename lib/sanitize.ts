import DOMPurify from "isomorphic-dompurify"

// Setup DOMPurify hooks to process elements (runs in browser and server)
if (typeof window === "undefined" || DOMPurify.isSupported) {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.nodeType === 1) { // Element node
      const tagName = node.tagName.toLowerCase()
      // Enforce noopener noreferrer on blank target links
      if (tagName === "a" && node.getAttribute("target") === "_blank") {
        node.setAttribute("rel", "noopener noreferrer")
      }
      // Force lazy loading on images
      if (tagName === "img" && !node.hasAttribute("loading")) {
        node.setAttribute("loading", "lazy")
      }
    }
  })
}

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
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
  ],
  ALLOWED_ATTR: [
    "class", "id", "style",
    "href", "title", "target", "rel",
    "src", "alt", "width", "height", "loading",
    "colspan", "rowspan", "scope",
    "start", "type",
    "value"
  ],
  RETURN_TRUSTED_TYPE: false,
}

/**
 * Main sanitizer: strips disallowed tags/attributes from arbitrary HTML using DOMPurify.
 * Enforces noopener noreferrer on external links.
 *
 * @param dirty - Raw HTML string from an external source
 * @returns Sanitized HTML safe for dangerouslySetInnerHTML
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ""
  return DOMPurify.sanitize(dirty, SANITIZE_CONFIG) as string
}

/** URL schemes allowed in href/src attributes for markdown links */
const SAFE_URL_SCHEMES = /^(https?:|mailto:|#|\/)/i

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
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

  // 7. Defense-in-depth: run output through DOMPurify to guarantee safety
  return DOMPurify.sanitize(html, SANITIZE_CONFIG) as string
}
