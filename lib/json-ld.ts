/**
 * Serialize structured data for a <script type="application/ld+json"> block.
 *
 * `JSON.stringify` does not escape `<`, so a title containing `</script>`
 * closes the script element and injects live markup into the page. That
 * bypasses `sanitizeHtml` entirely, because the payload never goes through the
 * article renderer.
 *
 * Escaping `<`, `>` and `&` as JSON unicode escapes is invisible to
 * `JSON.parse` and to every crawler that reads the block, so the structured
 * data is unchanged while the tag can no longer be broken out of.
 *
 * Keep this file byte-identical with blogs/src/lib/json-ld.ts (Rule #1).
 */

const REPLACEMENTS: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  // U+2028/U+2029 are valid in JSON but terminate a line in some JS parsers.
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    (char) => REPLACEMENTS[char] ?? char
  )
}
