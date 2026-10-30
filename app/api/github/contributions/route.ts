import { revalidatePath } from "next/cache"
import { getMergedGitHubContributions } from "@/lib/github-contributions"

/**
 * Fresh contribution data for the Refresh button on /github.
 *
 * The page itself is ISR-cached for an hour, which is right for a normal visit
 * but wrong for a deliberate click. This route re-fetches upstream with
 * `cache: "no-store"` and answers with cache headers that make each press a
 * real request: no CDN copy, no stale payload.
 *
 * Failures are explicit (502) rather than an all-zero calendar, so the client
 * keeps whatever it is already showing instead of blanking the graph.
 */

// Every request must reach the handler; nothing may be prerendered or cached.
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const data = await getMergedGitHubContributions({ fresh: true })

    // A payload with zero days across both accounts is a failed fetch wearing
    // a success code: GitHub always has a year of dates to report.
    if (data.combined.days.length === 0) {
      throw new Error("Empty contribution series")
    }

    // Let the next visitor to /github get this payload too instead of waiting
    // out the hour of ISR. Failure here must not lose the fresh response.
    try {
      revalidatePath("/github")
    } catch {
      /* cache refresh is a bonus, not part of the answer */
    }

    return Response.json(
      { data },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    )
  } catch (error) {
    console.error("[GitHub Contributions] Refresh failed:", error)

    return Response.json(
      {
        error: "Could not reach GitHub. Try again in a moment.",
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    )
  }
}
