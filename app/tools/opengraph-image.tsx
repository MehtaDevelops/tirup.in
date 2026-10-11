import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Tools by Tirup Mehta";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <OgShell
        kicker="Tools"
        section="Tools"
        title="Small, sharp tools"
        excerpt="QR Studio and the UTM builder — free, private, no sign-up."
        meta={["Free forever"]}
      />
    ),
    { ...OG_SIZE, fonts }
  );
}
