"use client"

import { useEffect } from "react"
import Link from "next/link"
import InteractiveText from "@/components/interactive-text"
import SkillsSection from "@/components/skills-section"
import TextWithBlur from "@/components/text-with-blur"
import AIProjectRecommender from "@/components/ai-project-recommender"
import SocialMediaButtons from "@/components/social-media-buttons"

export default function Home() {
  // Improve scroll smoothness
  useEffect(() => {
    // Add smooth scrolling with higher quality
    document.documentElement.style.scrollBehavior = "smooth"

    return () => {
      document.documentElement.style.scrollBehavior = ""
    }
  }, [])

  // Update the projects array with correct GitHub links
  const projects = [
    {
      title: "Begins AI API",
      description:
        "Free AI API service for small companies to integrate powerful AI capabilities into their websites with zero setup.",
      slug: "begins-ai-api",
      liveUrl: "https://api.begins.site",
      isPrivate: true,
    },
    {
      title: "Begins Insights",
      description:
        "Real-time website analytics platform providing detailed traffic insights with a simple script integration.",
      slug: "begins-insights",
      liveUrl: "https://insights.begins.site",
      isPrivate: true,
    },
    {
      title: "Philosophy to Python",
      description:
        "AI-powered tool that transforms philosophical quotes into beautifully formatted Python code syntax.",
      slug: "philosophy-to-python",
      liveUrl: "https://philosophy-to-python.begins.site",
      isPrivate: true,
    },
    {
      title: "StartCrypt",
      description: "A cybersecurity tool for encrypting startup data with military-grade protection.",
      slug: "startcrypt",
      github: "github.com/TirupMehta/startcrypt",
    },
    {
      title: "Jarvis",
      description: "Advanced AI-powered personal assistant with desktop system integration for intelligent automation.",
      slug: "jarvis",
      github: "github.com/TirupMehta/jarvis",
    },
    {
      title: "LocalVault",
      description: "Secure, browser-based file storage solution that prioritizes privacy with local IndexedDB storage.",
      slug: "localvault",
      github: "github.com/TirupMehta/LocalVault",
      liveUrl: "https://vault.begins.site",
    },
    {
      title: "Portal",
      description:
        "Lightweight Electron app displaying real-time system, browser, and network details with built-in speed test.",
      slug: "portal",
      github: "github.com/TirupMehta/Portal",
    },
    {
      title: "QUOTT",
      description:
        "Daily inspiration platform with hand-picked quotes on life, success, and love—beautifully presented and shareable.",
      slug: "quott",
      github: "github.com/TirupMehta/QUOTT",
    },
    {
      title: "VisitorIP",
      description: "Advanced IP tracking and analytics for enterprise security solutions.",
      slug: "visitorip",
      github: "github.com/TirupMehta/Begins/blob/main/visitorip.html",
    },
    {
      title: "LinkHarvest",
      description: "AI-powered web scraping tool for cybersecurity researchers.",
      slug: "linkharvest",
      github: "github.com/TirupMehta/linkharvest",
    },
  ]

  return (
    <main className="relative min-h-screen">
      {/* Intro Section */}
      <section className="section min-h-screen flex flex-col justify-center items-center px-6 md:px-20 py-20">
        <InteractiveText className="text-6xl md:text-8xl font-light tracking-tight mb-6 text-center">
          Tirup Mehta
        </InteractiveText>
        <TextWithBlur>
          <p className="text-xl md:text-2xl font-light text-center max-w-2xl text-black/70">
            Front-end developer, cybersecurity enthusiast, and UI/UX designer from Gujarat, India.
          </p>
        </TextWithBlur>
        <TextWithBlur delay={100}>
          <SocialMediaButtons />
        </TextWithBlur>
        <TextWithBlur delay={200}>
          <div className="mt-12 text-sm text-black/50">
            <p>Scroll to explore</p>
          </div>
        </TextWithBlur>
      </section>

      {/* Skills Section */}
      <section className="section min-h-screen flex flex-col justify-center px-6 md:px-20 py-20">
        <TextWithBlur>
          <SkillsSection />
        </TextWithBlur>
      </section>

      {/* Projects Section */}
      <section className="section py-20 px-6 md:px-20">
        <InteractiveText className="text-5xl md:text-6xl font-light mb-20 text-center">Selected Work</InteractiveText>

        <div className="space-y-32">
          {projects.map((project, index) => (
            <TextWithBlur key={index} delay={index * 100}>
              <div className="card-hover p-10 border border-black/5 rounded-sm">
                <div className="max-w-3xl mx-auto">
                  <InteractiveText className="text-4xl md:text-5xl font-light tracking-tight mb-6">
                    {project.title}
                  </InteractiveText>
                  <TextWithBlur>
                    <p className="text-xl font-light text-black/70 mb-8">{project.description}</p>
                  </TextWithBlur>
                  <TextWithBlur>
                    <div className="flex flex-wrap gap-4">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-block text-sm font-light text-black/80 pb-1 link-hover"
                      >
                        View Project
                      </Link>
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
                    </div>
                  </TextWithBlur>
                </div>
              </div>
            </TextWithBlur>
          ))}
        </div>
      </section>

      {/* AI Project Recommender Section
      <section className="section py-20 px-6 md:px-20">
        <AIProjectRecommender />
      </section>*}

      {/* Contact Section */}
      <section className="section min-h-screen flex flex-col justify-center items-center px-6 md:px-20 py-20">
        <InteractiveText className="text-5xl md:text-6xl font-light tracking-tight mb-6 text-center">
          Let's Connect
        </InteractiveText>
        <TextWithBlur>
          <p className="text-xl font-light text-center max-w-2xl text-black/70 mb-12">
            Interested in working together? Feel free to reach out.
          </p>
        </TextWithBlur>
        <TextWithBlur>
          <a
            href="mailto:contact@tirup.in"
            className="text-lg font-light border-b border-accent text-black/80 pb-1 hover:text-accent transition-colors"
          >
            contact@tirup.in
          </a>
        </TextWithBlur>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center border-t border-black/10">
        <p className="text-black/50">© {new Date().getFullYear()} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
