import type { Metadata } from "next"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import { ArrowUpRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Tirup Mehta — available for collaboration, freelance engineering work, and conversations about systems security and frontend architecture.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
}

const channels = [
  {
    name: "LinkedIn",
    handle: "linkedin.com/in/TirupMehta",
    href: "https://www.linkedin.com/in/TirupMehta",
    note: "Preferred for professional outreach, partnership proposals, and contract inquiries.",
  },
  {
    name: "Peerlist",
    handle: "peerlist.io/tirupmehta",
    href: "https://peerlist.io/tirupmehta",
    note: "Developer community profile — good for peer-to-peer technical conversations.",
  },
  {
    name: "GitHub",
    handle: "github.com/TirupMehta",
    href: "https://github.com/TirupMehta",
    note: "Open an issue or discussion on any of my public repositories.",
  },
  {
    name: "X",
    handle: "x.com/TirupMehta",
    href: "https://x.com/TirupMehta",
    note: "Quick questions, public technical discussion, and industry conversations.",
  },
  {
    name: "Happenstance",
    handle: "happenstance.ai/u/tirupmehta",
    href: "https://happenstance.ai/u/tirupmehta",
    note: null,
  },
]

export default function ContactPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      <section className="section px-6 md:px-20 pb-20 max-w-4xl mx-auto w-full">

        {/* Intro */}
        <TextWithBlur delay={50}>
          <div className="space-y-3 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl mb-12">
            <p>
              Open to well-scoped freelance work, technical collaboration, and conversations
              about frontend architecture, web security, and cryptographic system design.
            </p>
          </div>
        </TextWithBlur>

        {/* Channels — same row pattern as /work */}
        <TextWithBlur delay={100}>
          <div className="flex flex-col">
            {channels.map((ch, index) => (
              <div
                key={ch.name}
                className={`group py-5 ${index > 0 ? "border-t" : ""} border-black/10 dark:border-white/10`}
              >
                <a
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline gap-4 md:gap-6"
                >
                  {/* Index */}
                  <span className="font-mono tabular-nums text-xs md:text-sm text-black/45 dark:text-white/45 select-none w-6 shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Content */}
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                    <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300">
                      {ch.name}
                    </span>
                    <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                    <span className="text-black/50 dark:text-white/50 font-light group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors duration-300 text-sm">
                      {ch.handle}
                    </span>
                    {ch.note && (
                      <>
                        <span className="text-black/20 dark:text-white/20 select-none font-extralight hidden sm:inline">/</span>
                        <span className="text-black/45 dark:text-white/45 font-light text-sm hidden sm:inline">
                          {ch.note}
                        </span>
                      </>
                    )}
                    <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-40 icon-arrow-hover transition-opacity duration-300" />
                  </div>
                </a>
              </div>
            ))}
            {/* End border */}
            <div className="border-t border-black/10 dark:border-white/10" />
          </div>
        </TextWithBlur>

        {/* Available for */}
        <TextWithBlur delay={200}>
          <div className="mt-12 border-t border-black/5 dark:border-white/5 pt-6">
            <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-6">
              Available for
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-xs md:text-sm font-light text-black/55 dark:text-white/55">
              <span>Freelance frontend &amp; fullstack engineering</span>
              <span>Security review &amp; hardening</span>
              <span>Secure architecture consulting</span>
              <span>Open-source collaboration</span>
              <span>Technical writing &amp; guest contributions</span>
            </div>
          </div>
        </TextWithBlur>

      </section>

      <footer className="py-6 px-6 text-center border-t border-black/10">
        <p className="text-black/50 dark:text-white/50" suppressHydrationWarning>
          © {currentYear} Tirup Mehta. All rights reserved.
        </p>
      </footer>
    </main>
  )
}
