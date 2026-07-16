import { MetadataRoute } from "next"
import { projectsData } from "@/lib/projects-data"
import { CONVEX_API_URL } from "@/lib/utils"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tirup.in"

  // 1. Static Pages
  const staticRoutes = ["", "/work", "/skills", "/blogs"]
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

  // 3. Dynamic Blog Posts (fetched from Convex API)
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${CONVEX_API_URL}/api/posts`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    const posts = await res.json()
    
    if (Array.isArray(posts)) {
      blogPages = posts
        .filter((post) => post.status === "published" || !post.status)
        .map((post: { slug: string; createdAt?: string }) => ({
          url: `${baseUrl}/blogs/${post.slug}`,
          lastModified: post.createdAt ? new Date(post.createdAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }))
    }
  } catch (err) {
    console.error("Failed to generate blog routes for sitemap:", err)
  }

  return [...staticPages, ...projectPages, ...blogPages]
}
