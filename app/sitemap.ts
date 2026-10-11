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

  // 2. Dynamic Projects (from lib/projects-data.ts — static data, rarely changes)
  const projectSlugs = Object.keys(projectsData)
  const projectPages = projectSlugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: buildDate,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // Articles are syndicated copies. Their canonical URLs and sitemap live on blogs.tirup.in.
  return [...staticPages, ...projectPages]
}
