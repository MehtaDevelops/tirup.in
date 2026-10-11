import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Tirup Mehta — portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <OgShell
        kicker="Portfolio"
        title="Tirup Mehta"
        excerpt="Secure, high-performance web interfaces. Frontend, cryptography, systems security."
        meta={["Software Engineering Student", "Gujarat, India"]}
      />
    ),
    { ...OG_SIZE, fonts }
  );
}
