import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";
import { projectsData } from "@/lib/projects-data";

export const runtime = "nodejs";
export const alt = "Selected work by Tirup Mehta";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  const count = Object.keys(projectsData).length;
  return new ImageResponse(
    (
      <OgShell
        kicker="Selected Work"
        section="Work"
        title="Things I've built"
        excerpt="Projects, developer tools, and security libraries: shipped, not slideware."
        meta={[`${count} projects`]}
      />
    ),
    { ...OG_SIZE, fonts }
  );
}
