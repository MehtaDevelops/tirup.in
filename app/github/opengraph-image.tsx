import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "GitHub activity · Tirup Mehta";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <OgShell
        kicker="GitHub"
        section="GitHub"
        title="Activity & contributions"
        excerpt="Commits, streaks, and the 3D contribution wall: live from GitHub."
        meta={["Updated hourly"]}
      />
    ),
    { ...OG_SIZE, fonts }
  );
}
