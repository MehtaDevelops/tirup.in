"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"

export default function WorkPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.documentElement.style.scrollBehavior = "smooth"
    return () => {
      document.documentElement.style.scrollBehavior = ""
    }
  }, [])

  const projects = [
    {
      title: "Trace Guard",
      description: "Bot-resistant behavioral security engine and NPM package.",
      slug: "trace-guard",
      liveUrl: "https://www.npmjs.com/package/trace-guard",
    },
    {
      title: "Peace",
      description: "AI therapist with mental health support in English and Gujarati.",
      slug: "peace",
      liveUrl: "https://peace.tirup.in",
      isPrivate: true,
    },
    {
      title: "Vectorize AI API",
      description: "Free AI API for small companies — powerful capabilities, zero setup.",
      slug: "vectorize-ai-api",
      liveUrl: "https://vectorize.in",
      isPrivate: true,
    },
    {
      title: "QUOTT",
      description: "Daily inspiration Android app with hand-picked shareable quotes.",
      slug: "quott",
      github: "github.com/TirupMehta/QUOTT",
      liveUrl: "https://quott.tirup.in",
    },
    {
      title: "Typing Challenge",
      description: "Fast-paced typing challenge app to test and improve typing speed.",
      slug: "typing-challenge",
      liveUrl: "https://typing-challenge.tirup.in/",
      isPrivate: true,
    },
    {
      title: "Discuss",
      description: "AI-moderated group debate platform on any topic.",
      slug: "discuss",
      liveUrl: "https://discuss.tirup.in",
      isPrivate: true,
    },
    {
      title: "DevGathering",
      description: "Developer community for AI, Cybersecurity, and programming events.",
      slug: "devgathering",
      liveUrl: "https://devgathering.in",
      isPrivate: true,
    },
    {
      title: "Aperture",
      description: "Cryptographic challenge — decrypt the message to prove your skills.",
      slug: "aperture",
      liveUrl: "https://aperture.tirup.in",
      isPrivate: true,
    },
    {
      title: "StartCrypt",
      description: "Encrypts startup data with military-grade protection.",
      slug: "startcrypt",
      github: "github.com/TirupMehta/startcrypt",
    },
    {
      title: "Jarvis",
      description: "AI personal assistant with desktop system integration.",
      slug: "jarvis",
      github: "github.com/TirupMehta/jarvis",
    },
    {
      title: "LocalVault",
      description: "Private browser-based file storage using local IndexedDB.",
      slug: "localvault",
      github: "github.com/TirupMehta/LocalVault",
    },
    {
      title: "Portal",
      description: "Electron app showing real-time system, network info, and speed test.",
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
      <Header />

      {/* Projects Section */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20">
        <div className="flex flex-col">
          {projects.map((project, index) => {
            return (
              <TextWithBlur key={index} delay={index * 50}>
                <Link
                  href={`/projects/${project.slug}`}
                  className={`group block py-5 ${index > 0 ? "border-t" : ""} border-black/10 dark:border-white/10`}
                  suppressHydrationWarning
                >
                  <div className="flex items-baseline gap-4 md:gap-6">
                    {/* Index Number */}
                    <span className="font-mono text-xs md:text-sm text-black/30 dark:text-white/30 select-none w-6 shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {/* Content Row */}
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed">
                      <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300">
                        {project.title}
                      </span>
                      <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                      <span className="text-black/40 dark:text-white/40 font-light group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-300 text-sm">
                        {project.description}
                      </span>
                    </div>
                  </div>
                </Link>
              </TextWithBlur>
            )
          })}
          {/* End of list bottom border */}
          <div className="border-t border-black/10 dark:border-white/10" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-black/10">
        <p className="text-black/50 dark:text-white/50">© {mounted ? new Date().getFullYear() : "2025"} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
