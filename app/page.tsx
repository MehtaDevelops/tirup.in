"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import InteractiveText from "@/components/interactive-text"
import SkillsSection from "@/components/skills-section"
import TextWithBlur from "@/components/text-with-blur"
import AIProjectRecommender from "@/components/ai-project-recommender"
import SocialMediaButtons from "@/components/social-media-buttons"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Improve scroll smoothness
  useEffect(() => {
    setMounted(true)
    // Add smooth scrolling with higher quality
    document.documentElement.style.scrollBehavior = "smooth"

    return () => {
      document.documentElement.style.scrollBehavior = ""
    }
  }, [])

  // Update the projects array with correct GitHub links
  const projects = [
    {
      title: "Trace Guard",
      description: "An advanced, bot-resistant behavioral security engine and NPM package.",
      slug: "trace-guard",
      liveUrl: "https://www.npmjs.com/package/trace-guard",
    },
    {
      title: "Peace",
      description: "An AI-powered therapist offering compassionate mental health support in English and Gujarati.",
      slug: "peace",
      liveUrl: "https://peace.tirup.in",
      isPrivate: true,
    },
    {
      title: "Vectorize AI API",
      description:
        "Free AI API service for small companies to integrate powerful AI capabilities into their websites with zero setup.",
      slug: "vectorize-ai-api",
      liveUrl: "https://vectorize.in",
      isPrivate: true,
    },
    {
      title: "QUOTT",
      description:
        "Daily inspiration Android app with hand-picked quotes on life, success, and love—beautifully presented and shareable.",
      slug: "quott",
      github: "github.com/TirupMehta/QUOTT",
      liveUrl: "https://quott.tirup.in",
    },
    {
      title: "Typing Challenge",
      description: "A fast-paced typing challenge web application inspired by MonkeyType to test and improve typing speed.",
      slug: "typing-challenge",
      liveUrl: "https://typing-challenge.tirup.in/",
      isPrivate: true,
    },
    {
      title: "Discuss",
      description: "An AI-moderated group discussion platform where users can engage in debates on any given topic.",
      slug: "discuss",
      liveUrl: "https://discuss.tirup.in",
      isPrivate: true,
    },
    {
      title: "DevGathering",
      description: "A community platform for developers focusing on AI, Cybersecurity, and programming event updates.",
      slug: "devgathering",
      liveUrl: "https://devgathering.in",
      isPrivate: true,
    },
    {
      title: "Aperture",
      description: "A fun cryptographic challenge featuring custom encryption methods. Decrypt the message to prove your expertise.",
      slug: "aperture",
      liveUrl: "https://aperture.tirup.in",
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
    },
    {
      title: "Portal",
      description:
        "Lightweight Electron app displaying real-time system, browser, and network details with built-in speed test.",
      slug: "portal",
      github: "github.com/TirupMehta/Portal",
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
      <section id="work" className="section py-20 px-6 md:px-20">
        <InteractiveText className="text-2xl md:text-3xl font-light mb-20 text-center">Selected Work</InteractiveText>

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
                        suppressHydrationWarning
                      >
                        View Project
                      </Link>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-sm font-light text-black/80 pb-1 link-hover"
                          suppressHydrationWarning
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
                          suppressHydrationWarning
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



      {/* Contact Section */}
      <section id="contact" className="section min-h-screen flex flex-col justify-center items-center px-6 md:px-20 py-20">
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
        <p className="text-black/50">© {mounted ? new Date().getFullYear() : "2025"} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
