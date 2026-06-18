"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import InteractiveText from "@/components/interactive-text"
import SkillsSection from "@/components/skills-section"
import TextWithBlur from "@/components/text-with-blur"
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
      {/* Intro/Hero Section */}
      <section className="section px-6 md:px-20 pt-28 pb-20 max-w-4xl mx-auto w-full">
        {/* Avatar + Title inline */}
        <TextWithBlur>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 shrink-0">
              <Image
                src="/profile.png"
                alt="Tirup Mehta avatar"
                width={112}
                height={112}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white">
              Tirup Mehta <span className="text-black/40 dark:text-white/30 text-2xl md:text-3xl ml-1"><span className="italic" style={{ fontFamily: "var(--font-playfair)" }}>aka</span> @TirupMehta</span>
            </h1>
          </div>
        </TextWithBlur>


        {/* Nav Links */}
        <TextWithBlur delay={100}>
          <div className="flex gap-6 text-sm md:text-base font-light text-black/40 dark:text-white/40 mb-12 border-b border-black/5 dark:border-white/5 pb-4">
            <a href="#work" className="hover:text-black dark:hover:text-white transition-colors">Work</a>
            <a href="#skills" className="hover:text-black dark:hover:text-white transition-colors">Skills</a>
            <a href="#contact" className="hover:text-black dark:hover:text-white transition-colors">Contact</a>
          </div>
        </TextWithBlur>

        {/* Story Description Paragraphs */}
        <div className="space-y-6 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
          <TextWithBlur delay={150}>
            <p>
              I'm a front-end developer and UI/UX designer building clean, functional interfaces. I focus on creating high-performance web applications that are both intuitive and secure.
            </p>
          </TextWithBlur>

          <TextWithBlur delay={200}>
            <p>
              Deeply interested in cybersecurity, network security, and cryptography, I enjoy building tools that bridge the gap between design and system safety, ensuring data integrity without sacrificing user experience.
            </p>
          </TextWithBlur>

          <TextWithBlur delay={250}>
            <p>
              Always open to interesting conversations about development, security, and design. Feel free to <a href="mailto:contact@tirup.in" className="underline underline-offset-4 decoration-accent hover:text-accent transition-colors">say hello</a> or find me on <a href="https://github.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-accent hover:text-accent transition-colors">GitHub</a>.
            </p>
          </TextWithBlur>
        </div>

        {/* Dynamic Indicator Dots at the bottom of hero */}
        <TextWithBlur delay={300}>
          <div className="flex gap-2 mt-12 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#feca57]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#1dd1a1]/60" />
          </div>
        </TextWithBlur>
      </section>

      {/* Skills Section */}
      <section id="skills" className="section py-20 max-w-4xl mx-auto w-full px-6 md:px-20">
        <SkillsSection />
      </section>

      {/* Projects Section */}
      <section id="work" className="section py-20 max-w-4xl mx-auto w-full px-6 md:px-20">
        <TextWithBlur>
          <h3 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-8">
            Work
          </h3>
        </TextWithBlur>

        <div className="flex flex-col">
          {projects.map((project, index) => {
            return (
              <TextWithBlur key={index} delay={index * 50}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group block py-5 border-t border-black/10 dark:border-white/10"
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

      {/* Contact Section */}
      <section id="contact" className="section py-20 max-w-4xl mx-auto w-full px-6 md:px-20">
        <TextWithBlur>
          <h3 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-8">
            Contact
          </h3>
        </TextWithBlur>
        <div className="space-y-6 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
          <TextWithBlur delay={50}>
            <p>
              I'm always open to new opportunities, collaborations, or simply discussing web development, cryptography, and UI/UX design.
            </p>
          </TextWithBlur>
          <TextWithBlur delay={100}>
            <p>
              Reach out via email at <a href="mailto:contact@tirup.in" className="underline underline-offset-4 decoration-accent hover:text-accent transition-colors duration-300">contact@tirup.in</a>.
            </p>
          </TextWithBlur>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center border-t border-black/10">
        <p className="text-black/50 dark:text-white/50">© {mounted ? new Date().getFullYear() : "2025"} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
