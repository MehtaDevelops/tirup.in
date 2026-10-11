import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Skills — Tirup Mehta";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <OgShell
        kicker="Skills"
        section="Skills"
        title="What I work with"
        excerpt="Frontend engineering, web security, and systems — the stack behind the work."
        meta={["Always learning"]}
      />
    ),
    { ...OG_SIZE, fonts }
  );
}
