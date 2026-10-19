import { ImageResponse } from "next/og"
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og"
import { SITE } from "@/lib/components-site"

/* Twitter variant of the components library index card, mirroring
   opengraph-image.tsx so X and Slack previews match the site's card. */

export const runtime = "nodejs"
export const alt = `${SITE.name}: free single-file React components with live playgrounds, by Tirup Mehta`
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image() {
  const fonts = await loadOgFonts()
  return new ImageResponse(
    (
      <OgShell
        kicker="Free React Components"
        title="Copy the code, own it forever"
        excerpt="Unique single-file React components with live playgrounds. Zero dependencies, MIT licensed, straight from the shadcn registry."
        section="Components"
        meta={["React", "TypeScript", "Zero deps"]}
      />
    ),
    { ...OG_SIZE, fonts },
  )
}
