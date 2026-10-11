import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Contact Tirup Mehta";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <OgShell
        kicker="Contact"
        section="Contact"
        title="Let's talk"
        excerpt="Open to fresh ideas, good conversations, and interesting problems."
        meta={["Replies personally"]}
      />
    ),
    { ...OG_SIZE, fonts }
  );
}
