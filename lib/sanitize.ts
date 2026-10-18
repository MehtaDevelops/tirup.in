/**
 * Production-hardened HTML sanitizer backed by DOMPurify (isomorphic-dompurify).
 * Falls back to a tight regex scrubber if DOMPurify cannot load (e.g. edge).
 */

import DOMPurify from "isomorphic-dompurify";

// Fallback regexes (kept tight) if DOMPurify throws
const FALLBACK_TAGS_RE = /<\/?(?:script|style|iframe|object|embed|applet|form|input|button|textarea|select|option|base|meta|link|template|noscript)\b[^>]*>/gi;
const FALLBACK_ON_RE = /\s*(?:on[a-z]+|formaction|action)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

// Decode numeric/hex entities before scheme checks so &#x6A;avascript: can't bypass
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);?/g, (_, h) => {
      try {
        return String.fromCharCode(parseInt(h, 16));
      } catch {
        return "";
      }
    })
    .replace(/&#(\d+);?/g, (_, d) => {
      try {
        return String.fromCharCode(parseInt(d, 10));
      } catch {
        return "";
      }
    })
    .replace(/&(colon|semi|lpar|rpar|newline|tab);?/gi, " ");
}

function fallbackScrub(dirty: string): string {
  let clean = decodeEntities(dirty)
    .replace(FALLBACK_TAGS_RE, "")
    .replace(FALLBACK_ON_RE, "");
  // strip style attributes entirely (expression()/javascript: vectors)
  clean = clean.replace(/\s*style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // neutralize javascript:/vbscript:/data:(non-image) after entity decode
  clean = clean.replace(
    /(href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data:(?!image\/[a-z0-9+.-]+;base64,))[^"'>]*\2/gi,
    '$1="#"',
  );
  return clean;
}

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "b", "i", "u", "s", "code", "pre",
  "h2", "h3", "h4", "ul", "ol", "li", "blockquote",
  "a", "img", "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "div", "span", "figure", "figcaption", "hr",
];

/**
 * Sanitizes raw HTML from external sources (e.g., Convex CMS / TipTap editor)
 * for safe rendering via dangerouslySetInnerHTML.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";

  try {
    const decoded = decodeEntities(dirty);
    const clean = DOMPurify.sanitize(decoded, {
      ALLOWED_TAGS: ALLOWED_TAGS as never[],
      ALLOWED_ATTR: [
        "href", "src", "alt", "title", "target", "rel",
        "class", "id", "colspan", "rowspan", "loading", "width", "height",
      ],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form", "svg", "math"],
      FORBID_ATTR: ["style", "onerror", "onload"],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|#|\/[^/]|$)/i,
    });
    let out = String(clean);
    // Enforce noopener on _blank + lazy images (DOMPurify keeps attrs; ensure)
    out = out.replace(/<a\b([^>]*)>/gi, (match, attrs: string) => {
      if (/target\s*=\s*["']_blank["']/i.test(attrs)) {
        if (/rel\s*=\s*["'][^"']*["']/i.test(attrs)) {
          attrs = attrs.replace(/rel\s*=\s*["']([^"']*)["']/i, (_: string, existing: string) => {
            const rels = new Set(existing.split(/\s+/).filter(Boolean));
            rels.add("noopener");
            rels.add("noreferrer");
            return `rel="${Array.from(rels).join(" ")}"`;
          });
        } else {
          attrs += ' rel="noopener noreferrer"';
        }
      }
      return `<a${attrs}>`;
    });
    out = out.replace(/<img\b([^>]*)>/gi, (match, attrs: string) => {
      if (!/loading\s*=/i.test(attrs)) attrs += ' loading="lazy"';
      return `<img${attrs}>`;
    });
    return out;
  } catch (err) {
    console.error("[sanitize] DOMPurify failed, fallback scrub:", err);
    try {
      return fallbackScrub(dirty);
    } catch {
      return "";
    }
  }
}

/** URL schemes allowed in href attributes for markdown links */
const SAFE_URL_SCHEMES = /^(https?:|mailto:|tel:|#|\/)/i;

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Converts lightweight markdown strings (TL;DR summaries, author bios) to safe HTML.
 */
export function renderMarkdownSafe(text: string): string {
  if (!text || typeof text !== "string") return "";

  try {
    let html = escapeHtml(text);

    // Bold first
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Inline code before italics so * inside code isn't parsed
    html = html.replace(
      /`(.+?)`/g,
      '<code class="font-mono bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-xs md:text-sm">$1</code>',
    );
    // Italics: *text* only (avoid snake_case corruption); require non-space boundaries
    html = html.replace(/(^|\W)\*([^*\n]+?)\*(?=\W|$)/g, "$1<em>$2</em>");

    // Links: [label](url): strict validation
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_match, label, rawUrl) => {
      const trimmed = String(rawUrl).trim();
      const safeUrl = SAFE_URL_SCHEMES.test(trimmed) ? trimmed : "#";
      return `<a href="${escapeAttr(safeUrl)}" target="_blank" rel="noopener noreferrer" class="underline hover:text-accent transition-colors">${label}</a>`;
    });

    html = html.replace(/\n/g, "<br />");

    return sanitizeHtml(html);
  } catch (err) {
    console.error("[sanitize] renderMarkdownSafe failed:", err);
    return "";
  }
}
