import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "QR Studio · Tirup Mehta";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <OgShell
        kicker="QR Studio"
        section="Tools"
        title="Beautiful QR codes"
        excerpt="Private by design: everything runs in your browser, nothing uploads."
        meta={["Free", "No sign-up"]}
      />
    ),
    { ...OG_SIZE, fonts }
  );
}
