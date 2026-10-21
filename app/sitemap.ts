import { MetadataRoute } from "next"
import { projectsData } from "@/lib/projects-data"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tirup.in"
  // Fixed build-time date so CDN can cache the sitemap (new Date() every
  // request defeats caching). Bump only when routes change.
  const buildDate = new Date("2026-10-11T00:00:00Z")

  // 1. Static Pages
  const staticRoutes = ["", "/work", "/skills", "/writing", "/about", "/contact", "/tools", "/tools/utm-builder", "/tool/qr"]
  const staticPages = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: buildDate,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }))

  // 2. Dynamic Projects (from lib/projects-data.ts -- static data, rarely changes)
  const projectSlugs = Object.keys(projectsData)
  const projectPages = projectSlugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: buildDate,
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
    { route: "/r/liquid-ascii/source", priority: 0.4, frequency: "monthly" as const },
    { route: "/song-bubble", priority: 0.9, frequency: "weekly" as const },
    { route: "/r/song-bubble/source", priority: 0.4, frequency: "monthly" as const },
    { route: "/docs", priority: 0.6, frequency: "monthly" as const },
  ]
  const componentsPages = componentsApp.map(({ route, priority, frequency }) => ({
    url: `${baseUrl}/components${route}`,
    lastModified: libraryDate,
    changeFrequency: frequency,
    priority,
  }))

  return [...staticPages, ...projectPages, ...componentsPages]
}
