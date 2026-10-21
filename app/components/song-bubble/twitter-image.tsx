import { ImageResponse } from "next/og"
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og"
import { SITE } from "@/lib/components-site"

/* Twitter variant of the Song Bubble card, mirroring opengraph-image.tsx. */

export const runtime = "nodejs"
export const alt = "Song Bubble: React component that renders a Spotify-style floating mini player with a real YouTube engine inside, by Tirup Mehta"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image() {
  const fonts = await loadOgFonts()
  return new ImageResponse(
    (
      <OgShell
        kicker="React Component"
        title="Song Bubble"
        excerpt="A Spotify-style floating mini player: an orb that springs into a draggable song card. A real YouTube engine inside. Zero dependencies: one file you own forever."
        section="Song Bubble"
        meta={["YouTube iframe engine", "Drag + park", "React + TypeScript"]}
        domain={`${SITE.url.replace(/\/$/, "")}/song-bubble`}
      />
    ),
    { ...OG_SIZE, fonts },
  )
}
