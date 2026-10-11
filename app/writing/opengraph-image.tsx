import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Writing by Tirup Mehta";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <OgShell
        kicker="Writing"
        section="Writing"
        title="Essays & notes"
        excerpt="On interfaces, security, and systems — mirrored from blogs.tirup.in."
        meta={["Newest first"]}
      />
    ),
    { ...OG_SIZE, fonts }
  );
}
