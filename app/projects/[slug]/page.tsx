"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import InteractiveText from "@/components/interactive-text"
import TextWithBlur from "@/components/text-with-blur"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { projectsData } from "@/lib/projects-data"

export default function ProjectPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [project, setProject] = useState<any>(null)
  const [nextProject, setNextProject] = useState<any>(null)
  const [nextSlug, setNextSlug] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Improve scroll smoothness
  useEffect(() => {
    setMounted(true)
    document.documentElement.style.scrollBehavior = "smooth"
    return () => {
      document.documentElement.style.scrollBehavior = ""
    }
  }, [])

  // Get project data based on slug
  useEffect(() => {
    if (slug) {
      // Normalize slug to lowercase for matching
      const normalizedSlug = slug.toLowerCase()
      const foundProject = projectsData[normalizedSlug as keyof typeof projectsData]
      
      if (foundProject) {
        setProject(foundProject)
        setNotFound(false)
        document.title = `${foundProject.title} | Tirup Mehta`

        // Determine next project
        const projectKeys = Object.keys(projectsData)
        const currentIndex = projectKeys.indexOf(normalizedSlug)
        const nextIndex = (currentIndex + 1) % projectKeys.length
        setNextSlug(projectKeys[nextIndex])
        setNextProject(projectsData[projectKeys[nextIndex] as keyof typeof projectsData])
      } else {
        setNotFound(true)
      }
    }
  }, [slug])

  // Loading state
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-light mb-4">Project Not Found</h1>
        <p className="text-black/50 dark:text-white/50 mb-8">The project you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="text-accent hover:underline flex items-center">
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Link>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-black/50 dark:text-white/50">Loading...</p>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen px-6 md:px-20 pt-40 md:pt-64 pb-8 md:pb-2">
      {/* Back button */}
      <div className="absolute top-8 md:top-24 left-6 md:left-20">
        <TextWithBlur>
          <Link href="/" className="inline-flex items-center text-sm md:text-base text-black/50 dark:text-white/50 hover:text-accent dark:hover:text-accent transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Overview
          </Link>
        </TextWithBlur>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 md:px-0">

      {/* Hero Section */}
      <section className="section mb-10 md:mb-20">
        <InteractiveText className="text-4xl md:text-5xl font-light tracking-tight mb-8">
          {project.title}
        </InteractiveText>
        <TextWithBlur>
          <p className="text-lg md:text-xl font-light text-black/70 dark:text-white/70 leading-relaxed mb-8">{project.fullDescription}</p>
        </TextWithBlur>
        <TextWithBlur>
          <div className="flex flex-wrap gap-6 text-sm md:text-base font-light">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-black/80 dark:text-white/80 pb-1 link-hover"
              >
                Live Demo
              </a>
            )}
            {project.github && !project.isPrivate && (
              <a
                href={`https://${project.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-black/80 dark:text-white/80 pb-1 link-hover"
              >
                Source Code
              </a>
            )}
            {project.documentationUrl && (
              <a
                href={project.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-black/80 dark:text-white/80 pb-1 link-hover"
              >
                Documentation
              </a>
            )}
          </div>
        </TextWithBlur>
      </section>

      {/* Project Details List */}
      <section className="section py-16">
        <div className="flex flex-col">
          {/* Row 1: Technical Stack */}
          {project.techStack && (
            <TextWithBlur>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-14">
                <div className="col-span-1 flex items-baseline gap-2">
                  <span className="font-mono text-xs md:text-sm text-black/40 dark:text-white/40 select-none">01</span>
                  <h3 className="text-lg md:text-xl font-light tracking-tight text-black dark:text-white">Tech Stack</h3>
                </div>
                <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2">
                  {project.techStack.map((tech: string) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-black/5 dark:bg-white/10 text-xs md:text-sm font-light rounded-sm border border-black/5 dark:border-white/5 text-black dark:text-white"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </TextWithBlur>
          )}

          {/* Row 2: Core Engine */}
          {project.engine && (
            <TextWithBlur>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-14">
                <div className="col-span-1 flex items-baseline gap-2">
                  <span className="font-mono text-xs md:text-sm text-black/40 dark:text-white/40 select-none">02</span>
                  <h3 className="text-lg md:text-xl font-light tracking-tight text-black dark:text-white">Core Engine</h3>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed">{project.engine}</p>
                </div>
              </div>
            </TextWithBlur>
          )}

          {/* Details Rows */}
          {project.details.map((detail: any, index: number) => {
            const baseIndex = (project.techStack ? 1 : 0) + (project.engine ? 1 : 0)
            const displayIndex = String(baseIndex + index + 1).padStart(2, "0")

            return (
              <TextWithBlur key={index}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-14">
                  <div className="col-span-1 flex items-baseline gap-2">
                    <span className="font-mono text-xs md:text-sm text-black/40 dark:text-white/40 select-none">{displayIndex}</span>
                    <h3 className="text-lg md:text-xl font-light tracking-tight text-black dark:text-white">{detail.title}</h3>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed">{detail.content}</p>
                  </div>
                </div>
              </TextWithBlur>
            )
          })}

          {/* Stats Row */}
          {project.stats && (
            <TextWithBlur>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-14">
                <div className="col-span-1 flex items-baseline gap-2">
                  <span className="font-mono text-xs md:text-sm text-black/40 dark:text-white/40 select-none">
                    {String((project.techStack ? 1 : 0) + (project.engine ? 1 : 0) + project.details.length + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg md:text-xl font-light tracking-tight text-black dark:text-white">Metrics</h3>
                </div>
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  {Object.entries(project.stats).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <h4 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-1">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <p className="text-2xl md:text-3xl font-light text-accent tracking-tighter">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TextWithBlur>
          )}

          {/* End of list bottom border */}
          <div className="border-t border-black/10 dark:border-white/10" />
        </div>
      </section>

      {/* Next Project */}
      <section className="section py-8 md:py-10 text-center border-t border-black/10 dark:border-white/10 mt-6 md:mt-8">
        <h2 className="text-3xl font-light mb-8 tracking-tight text-black dark:text-white">
          Next Project
        </h2>
        {nextProject && (
          <TextWithBlur>
            <Link
              href={`/projects/${nextSlug}`}
              className="group inline-block"
            >
              <span className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white group-hover:text-accent transition-colors inline-flex items-center gap-3">
                <span>{nextProject.title}</span>
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 transform group-hover:translate-x-2 transition-transform text-black/40 dark:text-white/40 group-hover:text-accent" />
              </span>
              <p className="text-sm md:text-lg font-light text-black/50 dark:text-white/50 mt-4 max-w-xl mx-auto">
                {nextProject.description}
              </p>
            </Link>
          </TextWithBlur>
        )}
      </section>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-black/10 dark:border-white/10">
        <p className="text-sm md:text-base text-black/50 dark:text-white/50">© {mounted ? new Date().getFullYear() : "2025"} Tirup Mehta. All rights reserved.</p>
      </footer>
      </div>
    </main>
  )
}
