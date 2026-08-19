import { MetadataRoute } from "next"
import { projectsData } from "@/lib/projects-data"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tirup.in"

  // 1. Static Pages
  const staticRoutes = ["", "/work", "/skills", "/blogs", "/tools/utm-builder", "/tool/qr"]
  const staticPages = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }))

  // 2. Dynamic Projects (from lib/projects-data.ts)
  const projectSlugs = Object.keys(projectsData)
  const projectPages = projectSlugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Articles are syndicated copies. Their canonical URLs and sitemap live on blogs.tirup.in.
  return [...staticPages, ...projectPages]
}
