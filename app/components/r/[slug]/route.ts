import { NextResponse } from "next/server"
import { readFileSync } from "node:fs"
import { join } from "node:path"

/**
 * Registry item endpoint exposing each generated JSON from generated/registry
 * (built by scripts/build-registry.mjs) while quietly splitting the audience:
 *
 *  - The shadcn CLI and scripts fetch this URL and must always receive the
 *    exact raw registry JSON: no redirect, no refresh, no viewer.
 *  - A human who opens it in a browser sees a 20k-char escaped string wall;
 *    those navigations are forwarded to the source viewer at
 *    /components/r/<name>/source, which renders the same item in the site's
 *    own code reader.
 *
 * The split reads sec-fetch-dest: real top-level navigation always sends
 * "document"; programmatic fetch (the CLI) sends no such header. The index
 * (registry.json) stays a raw dump in every client — it is a machine file.
 */
const registryDir = join(process.cwd(), "generated", "registry")

// Traversal guard + classic shape: lowercase name, optional .json suffix.
const itemName = (slug: string) => (/^[a-z0-9-]+(\.json)?$/i.exec(slug) ? slug.replace(/\.json$/i, "") : null)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const name = itemName((await params).slug)
  if (!name) {
    return NextResponse.json({ error: "invalid registry item name" }, { status: 400 })
  }

  let raw: string
  try {
    raw = readFileSync(join(registryDir, `${name}.json`), "utf8")
  } catch {
    return NextResponse.json({ error: `registry item "${name}" not found` }, { status: 404 })
  }

  // Only true install items carry a files array — that is what the viewer
  // renders; the index has no files and stays raw for every client.
  const isInstallItem = /"files"\s*:/.test(raw)
  if (isInstallItem && request.headers.get("sec-fetch-dest") === "document") {
    return NextResponse.redirect(new URL(`/components/r/${name}/source`, request.url), 307)
  }

  return new Response(raw, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Items are generated at build time and change only on deploy; let
      // CDN/fetch caches hold them briefly and revalidate in the background.
      "cache-control": "public, max-age=300, stale-while-revalidate=86400",
    },
  })
}
