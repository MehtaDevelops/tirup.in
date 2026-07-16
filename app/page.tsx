import type { Metadata } from "next"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import { ArrowUpRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Tirup Mehta — Designer & Frontend Developer",
  description: "Official portfolio of Tirup Mehta, a front-end web developer, cybersecurity enthusiast, and UI/UX designer from Gujarat, India.",
  alternates: {
    canonical: "https://tirup.in"
  }
}

export default function Home() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      {/* Intro/Hero Section */}
      <section className="section px-6 md:px-20 pb-20 max-w-4xl mx-auto w-full">
        {/* Story Description Paragraphs */}
        <div className="space-y-6 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
          <TextWithBlur delay={150}>
            <p>
              I build interfaces where visual clarity meets system performance. Working at the intersection of design and front-end engineering, I focus on creating fast, robust web applications that feel natural to use.
            </p>
          </TextWithBlur>

          <TextWithBlur delay={200}>
            <p>
              Driven by a strong curiosity for cryptography and systems security, I design software with data safety built into its foundation, bridging the gap between secure backend architecture and polished visual flows.
            </p>
          </TextWithBlur>

          <TextWithBlur delay={250}>
            <p>
              I write about interface design and web security on my <a href="https://blogs.tirup.in" target="_blank" rel="noopener noreferrer" className="link-hover hover:text-accent transition-colors">blogs</a>, share active experiments on <a href="https://github.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="link-hover hover:text-accent transition-colors">GitHub</a>, and am always open to fresh ideas. Let's connect.
            </p>
          </TextWithBlur>
        </div>

        {/* Connect Links */}
        <TextWithBlur delay={300}>
          <div className="mt-8 border-t border-black/5 dark:border-white/5 pt-6">
            <h3 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-6">
              Connect
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4 text-xs md:text-sm font-light text-black/55 dark:text-white/55">
              <a href="https://github.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                GitHub <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
              <a href="https://www.linkedin.com/in/TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                LinkedIn <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
              <a href="https://peerlist.io/tirupmehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                Peerlist <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
              <a href="https://happenstance.ai/u/tirupmehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                Happenstance <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
              <a href="https://x.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                X (Twitter) <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
              <a href="https://www.kaggle.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                Kaggle <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
              <a href="https://g.dev/Tirup" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                Google Dev <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
              <a href="https://www.cloudskillsboost.google/public_profiles/5de29c1c-84d0-46a5-a4eb-5fa999499184" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                Google Cloud <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
              <a href="https://medium.com/@TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                Medium <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
              <a href="https://instagram.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                Instagram <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
              <a href="https://youtube.com/@TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                YouTube <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
            </div>
          </div>
        </TextWithBlur>

        {/* Dynamic Indicator Dots at the bottom of hero */}
        <TextWithBlur delay={350}>
          <div className="flex gap-2 mt-8 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]/60 transition-all duration-300 hover:scale-125 hover:shadow-[0_0_8px_#ff6b6b] hover:opacity-100 cursor-pointer" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#feca57]/60 transition-all duration-300 hover:scale-125 hover:shadow-[0_0_8px_#feca57] hover:opacity-100 cursor-pointer" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#1dd1a1]/60 transition-all duration-300 hover:scale-125 hover:shadow-[0_0_8px_#1dd1a1] hover:opacity-100 cursor-pointer" />
          </div>
        </TextWithBlur>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-black/10">
        <p className="text-black/50 dark:text-white/50" suppressHydrationWarning>© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
