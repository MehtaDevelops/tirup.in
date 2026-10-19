import { ImageResponse } from "next/og"
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og"
import { SITE } from "@/lib/components-site"

/* Share card for the Liquid Ascii component page (and its source viewer);
   overrides the library-wide card for every route under this segment. */

export const runtime = "nodejs"
export const alt = "Liquid Ascii: React component that renders a real-time FLIP fluid simulation as ASCII text, by Tirup Mehta"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image() {
  const fonts = await loadOgFonts()
  return new ImageResponse(
    (
      <OgShell
        kicker="React Component"
        title="Liquid Ascii"
        excerpt="A real-time FLIP fluid simulation rendered as ASCII text. Splash it with your cursor. Zero dependencies: one file you own forever."
        section="Liquid Ascii"
        meta={["FLIP fluid sim", "ASCII text", "React + TypeScript"]}
        domain={`${SITE.url.replace(/\/$/, "")}/liquid-ascii`}
      />
    ),
    { ...OG_SIZE, fonts },
  )
}
