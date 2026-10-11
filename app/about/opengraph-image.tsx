import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "About Tirup Mehta";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <OgShell
        kicker="About"
        section="About"
        title="Tirup Mehta"
        excerpt="Software engineering student building secure, fast interfaces. Curious about cryptography and systems security."
        meta={["Gujarat, India"]}
      />
    ),
    { ...OG_SIZE, fonts }
  );
}
