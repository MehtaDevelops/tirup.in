import { MetadataRoute } from "next"
import { projectsData } from "@/lib/projects-data"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tirup.in"
  // No <lastmod> for pages whose change date we do not track: an omitted
  // value is honest, a build-time or hardcoded one is a false claim.

  // 1. Static Pages
  // /github is indexable again (see app/github/page.tsx) and self-canonical, so
  // it belongs here. It is deliberately no longer `noindex`.
  const staticRoutes = ["", "/work", "/skills", "/writing", "/about", "/contact", "/tools", "/tools/utm-builder", "/tool/qr", "/privacy", "/github"]
  const staticPages = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }))

  // 2. Dynamic Projects (from lib/projects-data.ts -- static data, rarely changes)
  const projectSlugs = Object.keys(projectsData)
  const projectPages = projectSlugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // Articles are syndicated copies. Their canonical URLs and sitemap live on blogs.tirup.in.

  // 3. Components library -- served natively by this app at app/components/,
  //    part of this same deployment and site. Listed here for direct discovery.
  const libraryDate = new Date("2026-10-19T00:00:00Z")
  const componentsApp = [
    { route: "", priority: 0.9, frequency: "weekly" as const },
    { route: "/all", priority: 0.8, frequency: "weekly" as const },
    { route: "/liquid-ascii", priority: 0.9, frequency: "weekly" as const },
    { route: "/song-bubble", priority: 0.9, frequency: "weekly" as const },
  ]
  const componentsPages = componentsApp.map(({ route, priority, frequency }) => ({
    url: `${baseUrl}/components${route}`,
    lastModified: libraryDate,
    changeFrequency: frequency,
    priority,
  }))

  return [...staticPages, ...projectPages, ...componentsPages]
}
