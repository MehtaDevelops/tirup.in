import { ImageResponse } from "next/og"
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og"
import { SITE } from "@/lib/components-site"

/* Share card for the components library index. Applies to every route under
   /components/* unless a deeper file-convention image overrides it. */

export const runtime = "nodejs"
export const alt = `${SITE.name}: single-file React components with live playgrounds, by Tirup Mehta`
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image() {
  const fonts = await loadOgFonts()
  return new ImageResponse(
    (
      <OgShell
        kicker="React Components"
        title="Copy the code, own it forever"
        excerpt="Unique single-file React components with live playgrounds. Zero dependencies, MIT licensed, straight from the shadcn registry."
        section="Components"
        meta={["React", "TypeScript", "Zero deps"]}
      />
    ),
    { ...OG_SIZE, fonts },
  )
}
