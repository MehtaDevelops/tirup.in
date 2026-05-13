"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import InteractiveText from "@/components/interactive-text"
import TextWithBlur from "@/components/text-with-blur"
import { ArrowLeft } from "lucide-react"
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
        <p className="text-black/50 mb-8">The project you're looking for doesn't exist or has been moved.</p>
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
        <p className="text-xl text-black/50">Loading...</p>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen">
      {/* Back button */}
      <div className="fixed top-8 left-8 z-50">
        <TextWithBlur>
          <Link href="/" className="flex items-center text-sm text-black/70 hover:text-accent transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Link>
        </TextWithBlur>
      </div>

      {/* Hero Section */}
      <section className="section min-h-screen flex flex-col justify-center px-6 md:px-20 py-20">
        <div className="max-w-5xl mx-auto">
          <InteractiveText className="text-6xl md:text-7xl font-light tracking-tight mb-8">
            {project.title}
          </InteractiveText>
          <TextWithBlur>
            <p className="text-xl md:text-2xl font-light text-black/70 max-w-3xl mb-6">{project.fullDescription}</p>
          </TextWithBlur>
          <TextWithBlur>
            <div className="flex flex-wrap gap-4">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-light text-black/80 pb-1 link-hover"
                >
                  View Live Demo
                </a>
              )}
              {project.github && !project.isPrivate && (
                <a
                  href={`https://${project.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-light text-black/80 pb-1 link-hover"
                >
                  View Source on GitHub
                </a>
              )}
              {project.documentationUrl && (
                <a
                  href={project.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-light text-black/80 pb-1 link-hover"
                >
                  View Documentation
                </a>
              )}
            </div>
          </TextWithBlur>
        </div>
      </section>

      {/* Project Details Bento Grid */}
      <section className="section px-6 md:px-20 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 auto-rows-fr">
            
            {/* Tech Stack Module */}
            {project.techStack && (
              <div className="md:col-span-2 bg-black/5 dark:bg-white/5 p-8 rounded-sm border border-black/5 dark:border-white/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-6">Technical Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech: string) => (
                      <span key={tech} className="px-3 py-1 bg-black/5 dark:bg-white/10 text-xs font-light rounded-sm border border-black/5 dark:border-white/5">{tech}</span>
                    ))}
                  </div>
                </div>
                {project.engine && (
                  <div className="mt-8">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-2">Core Engine</h3>
                    <p className="text-xl font-light tracking-tight">{project.engine}</p>
                  </div>
                )}
              </div>
            )}

            {/* Stats Module */}
            {project.stats && (
              <div className="md:col-span-2 bg-black/5 dark:bg-white/5 p-8 rounded-sm border border-black/5 dark:border-white/5 grid grid-cols-2 gap-8 items-center">
                {Object.entries(project.stats).map(([key, value]: [string, any]) => (
                  <div key={key}>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-3xl font-light text-accent tracking-tighter">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Standard Project Details */}
            {project.details.map((detail: any, index: number) => (
              <div key={index} className="md:col-span-2 p-8 rounded-sm border border-black/5 dark:border-white/5 bg-white dark:bg-black flex flex-col">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-4">{detail.title}</h3>
                <p className="text-lg font-light text-black/70 dark:text-white/70 leading-relaxed">{detail.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next Project */}
      <section className="section min-h-screen flex flex-col justify-center items-center px-6 md:px-20 py-20">
        <InteractiveText className="text-4xl md:text-5xl font-light tracking-tight mb-6 text-center">
          Next Project
        </InteractiveText>
        <TextWithBlur>
          <p className="text-xl font-light text-center max-w-2xl text-black/70 mb-12">Continue exploring my work</p>
        </TextWithBlur>

        {nextProject && (
          <TextWithBlur>
            <Link
              href={`/projects/${nextSlug}`}
              className="group flex flex-col items-center p-8 border border-black/5 rounded-sm card-hover"
            >
              <span className="text-2xl font-light group-hover:text-accent transition-colors">{nextProject.title}</span>
              <span className="text-sm text-black/50 mt-2">{nextProject.description}</span>
            </Link>
          </TextWithBlur>
        )}
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center border-t border-black/10">
        <p className="text-black/50">© {mounted ? new Date().getFullYear() : "2025"} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
