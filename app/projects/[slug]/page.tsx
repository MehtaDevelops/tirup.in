import type { Metadata } from "next"
import Link from "next/link"
import TextWithBlur from "@/components/text-with-blur"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { projectsData } from "@/lib/projects-data"

interface PageProps {
  params: Promise<{ slug: string }>
}

interface Project {
  title: string
  description: string
  fullDescription: string
  liveUrl?: string
  github?: string
  isPrivate?: boolean
  documentationUrl?: string
  techStack?: string[]
  engine?: string
  stats: Record<string, string>
  details?: { title: string; content: string }[]
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const normalizedSlug = slug?.toLowerCase()
  const project = projectsData[normalizedSlug as keyof typeof projectsData] as Project | undefined
  
  if (project) {
    return {
      title: `${project.title} | Tirup Mehta`,
      description: project.description,
    }
  }
  return {
    title: "Project Not Found | Tirup Mehta",
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const normalizedSlug = slug?.toLowerCase()
  const project = projectsData[normalizedSlug as keyof typeof projectsData] as Project | undefined

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-light mb-4">Project Not Found</h1>
        <p className="text-black/50 dark:text-white/50 mb-8">The project you're looking for doesn't exist or has been moved.</p>
        <Link href="/work" className="text-accent hover:underline flex items-center gap-2 text-sm">
          <ArrowLeft size={14} />
          Back to Work
        </Link>
      </div>
    )
  }

  // Calculate next project slug
  const projectKeys = Object.keys(projectsData)
  const currentIndex = projectKeys.indexOf(normalizedSlug)
  const nextIndex = (currentIndex + 1) % projectKeys.length
  const nextSlug = projectKeys[nextIndex]
  const nextProject = projectsData[nextSlug as keyof typeof projectsData] as Project | undefined

  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <div className="section px-6 md:px-20 pt-28 pb-20 max-w-4xl mx-auto w-full">

        {/* Back link */}
        <TextWithBlur>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-xs md:text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors mb-10"
          >
            <ArrowLeft size={13} />
            Work
          </Link>
        </TextWithBlur>

        {/* Project label + title */}
        <TextWithBlur delay={50}>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-4">
            Project
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white mb-6">
            {project.title}
          </h1>
        </TextWithBlur>

        {/* Links row */}
        <TextWithBlur delay={80}>
          <div className="flex gap-6 text-sm md:text-base font-light text-black/40 dark:text-white/40 mb-12 border-b border-black/5 dark:border-white/5 pb-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
              >
                Live Demo <ArrowUpRight size={12} />
              </a>
            )}
            {project.github && !project.isPrivate && (
              <a
                href={`https://${project.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
              >
                Source Code <ArrowUpRight size={12} />
              </a>
            )}
            {project.documentationUrl && (
              <a
                href={project.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
              >
                Docs <ArrowUpRight size={12} />
              </a>
            )}
          </div>
        </TextWithBlur>

        {/* Description */}
        <TextWithBlur delay={100}>
          <div className="space-y-4 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl mb-16">
            <p>{project.fullDescription}</p>
          </div>
        </TextWithBlur>

        {/* Details */}
        <div className="flex flex-col">
          {project.techStack && (
            <TextWithBlur>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-12">
                <div className="col-span-1 flex items-baseline gap-2">
                  <span className="font-mono text-xs text-black/30 dark:text-white/30 select-none">01</span>
                  <h3 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Tech Stack</h3>
                </div>
                <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2">
                  {project.techStack.map((tech: string) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-black/5 dark:bg-white/5 text-xs font-light border border-black/5 dark:border-white/5 text-black/70 dark:text-white/70"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </TextWithBlur>
          )}

          {project.engine && (
            <TextWithBlur>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-12">
                <div className="col-span-1 flex items-baseline gap-2">
                  <span className="font-mono text-xs text-black/30 dark:text-white/30 select-none">02</span>
                  <h3 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Core Engine</h3>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">{project.engine}</p>
                </div>
              </div>
            </TextWithBlur>
          )}

          {project.details && project.details.map((detail: any, index: number) => {
            const baseIndex = (project.techStack ? 1 : 0) + (project.engine ? 1 : 0)
            const displayIndex = String(baseIndex + index + 1).padStart(2, "0")

            return (
              <TextWithBlur key={index} delay={index * 40}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-12">
                  <div className="col-span-1 flex items-baseline gap-2">
                    <span className="font-mono text-xs text-black/30 dark:text-white/30 select-none">{displayIndex}</span>
                    <h3 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40">{detail.title}</h3>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">{detail.content}</p>
                  </div>
                </div>
              </TextWithBlur>
            )
          })}

          {project.stats && (
            <TextWithBlur>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-12">
                <div className="col-span-1 flex items-baseline gap-2">
                  <span className="font-mono text-xs text-black/30 dark:text-white/30 select-none">
                    {String((project.techStack ? 1 : 0) + (project.engine ? 1 : 0) + (project.details ? project.details.length : 0) + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Metrics</h3>
                </div>
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6 md:gap-8">
                  {Object.entries(project.stats).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <h4 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-1">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <p className="text-2xl md:text-3xl font-light text-accent tracking-tighter">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TextWithBlur>
          )}

          {/* End border */}
          <div className="border-t border-black/10 dark:border-white/10" />
        </div>

        {/* Next Project */}
        {nextProject && (
          <TextWithBlur>
            <div className="pt-16 pb-4">
              <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-8">
                Next
              </p>
              <Link
                href={`/projects/${nextSlug}`}
                className="group block py-5 border-t border-black/10 dark:border-white/10"
              >
                <div className="flex items-baseline gap-4 md:gap-6">
                  <span className="font-mono text-xs md:text-sm text-black/30 dark:text-white/30 select-none w-6 shrink-0">→</span>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed">
                    <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300">
                      {nextProject.title}
                    </span>
                    <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                    <span className="text-black/40 dark:text-white/40 font-light group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-300 text-sm">
                      {nextProject.description}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="border-t border-black/10 dark:border-white/10" />
            </div>
          </TextWithBlur>
        )}

        {/* Footer */}
        <footer className="py-6 text-center border-t border-black/10 dark:border-white/10 mt-4">
          <p className="text-sm text-black/50 dark:text-white/50">© {currentYear} Tirup Mehta. All rights reserved.</p>
        </footer>

      </div>
    </main>
  )
}
