import { NextResponse } from "next/server"

/**
 * TEMPORARY DIAGNOSTIC. Remove after the /writing/[slug] runtime failure is
 * understood. Read-only: it imports the same modules the article page uses and
 * reports which one throws inside the serverless runtime.
 *
 * GET /api/writing-diag?key=<DIAG_KEY>
 */

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const DIAG_KEY = "diag-7f3a91c4"

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key")
  if (key !== DIAG_KEY) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const out: Record<string, unknown> = {
    node: process.version,
    region: process.env.VERCEL_REGION ?? null,
    deployedAt: process.env.VERCEL_DEPLOYMENT_ID ?? null,
  }

  async function step(name: string, fn: () => Promise<unknown>) {
    try {
      out[name] = await fn()
    } catch (error) {
      const e = error as Error
      out[name] = `THREW ${e.name}: ${e.message}`.slice(0, 400)
    }
  }

  await step("dompurifyImport", async () => {
    const mod = (await import("isomorphic-dompurify")) as unknown as {
      default?: { sanitize: (s: string) => string }
      sanitize?: (s: string) => string
    }
    const purify = mod.default ?? (mod as unknown as { sanitize: (s: string) => string })
    return String(purify.sanitize('<p onclick="x()">ok</p>'))
  })

  await step("sanitizeHtml", async () => {
    const { sanitizeHtml } = await import("@/lib/sanitize")
    return sanitizeHtml('<p class="ok">ok</p><script>bad()</script>')
  })

  await step("pageModuleImport", async () => {
    const mod = await import("@/app/writing/[slug]/page")
    return Object.keys(mod).join(",")
  })

  await step("convexFetch", async () => {
    const { CONVEX_API_URL } = await import("@/lib/utils")
    const res = await fetch(
      `${CONVEX_API_URL}/api/post?slug=self-hosting-fonts-why-your-deploy-fails-when-google-fonts-is-slow`,
      { cache: "no-store" },
    )
    const data = (await res.json()) as { contentHtml?: string }
    return `status ${res.status}, html ${String(data.contentHtml ?? "").length} chars`
  })

  return NextResponse.json(out, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  })
}
