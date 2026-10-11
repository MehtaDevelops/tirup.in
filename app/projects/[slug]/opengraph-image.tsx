import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";
import { projectsData } from "@/lib/projects-data";

export const runtime = "nodejs";
export const alt = "Project by Tirup Mehta";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return Object.keys(projectsData).map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const fonts = await loadOgFonts();
  const { slug } = await params;
  const normalized = String(slug || "").toLowerCase();
  const project = Object.prototype.hasOwnProperty.call(projectsData, normalized)
    ? (projectsData[normalized as keyof typeof projectsData] as {
        title: string;
        description: string;
        techStack?: string[];
      })
    : null;

  return new ImageResponse(
    (
      <OgShell
        kicker="Project"
        section="Work"
        title={project?.title ?? "Project"}
        excerpt={project?.description ?? "A project by Tirup Mehta."}
        meta={(project?.techStack ?? []).slice(0, 3)}
      />
    ),
    { ...OG_SIZE, fonts }
  );
}
