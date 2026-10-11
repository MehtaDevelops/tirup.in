import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "UTM Builder — Tirup Mehta";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <OgShell
        kicker="UTM Builder"
        section="Tools"
        title="Campaign URLs, done right"
        excerpt="Build, audit, and export GA4-ready tracking links with QR codes."
        meta={["Free", "Private"]}
      />
    ),
    { ...OG_SIZE, fonts }
  );
}
