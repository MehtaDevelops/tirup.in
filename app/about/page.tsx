import type { Metadata } from "next"
import Header from "@/components/header"
import { ArrowUpRight } from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Tirup Mehta — software engineer, open-source author, and cryptography enthusiast based in Gujarat, India.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
}

export default function AboutPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      <section className="section px-6 md:px-20 pb-20 max-w-4xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif italic font-medium tracking-tight leading-tight text-black dark:text-white mb-8">
          About Tirup Mehta
        </h1>

        <div className="space-y-8 text-base font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Background</h2>
            <p>
              I am Tirup Mehta, a software engineer based in Gujarat, India, working at the
              intersection of frontend engineering, systems security, and cryptography. My work
              spans building fast, secure web applications and publishing open-source developer
              tools used in production environments around the world.
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">What I build</h2>
            <p>
              My technical focus is on creating interfaces where visual clarity meets system
              performance. I specialise in React and Next.js frontends with secure-by-default
              architectures: strict Content Security Policies, cryptographic data pipelines,
              and stateless session designs that reduce attack surface without degrading user
              experience.
            </p>
            <p className="mt-4">
              On the security side, I have shipped trace-guard — a production-grade
              behavioural security engine that detects and blocks AI agents and Vision-Language
              Model (VLM) bots at the edge. It is available as an npm package and is actively
              maintained. I have also built GleanBox, an open-source structured data harvesting
              and intelligence toolkit for developers.
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Open Source</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.npmjs.com/package/trace-guard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors"
                >
                  trace-guard (npm) <ArrowUpRight size={13} className="opacity-40" />
                </a>
                {" "}— Behavioural security engine, blocks AI/VLM bots at the edge. v3.7.0+.
              </li>
              <li>
                <a
                  href="https://github.com/TirupMehta/GleanBox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors"
                >
                  GleanBox (GitHub) <ArrowUpRight size={13} className="opacity-40" />
                </a>
                {" "}— Structured data harvesting and intelligence toolkit.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Writing</h2>
            <p>
              I write about interface engineering, web performance, cryptographic system design,
              and application security on my engineering blog at{" "}
              <a
                href="https://blogs.tirup.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black dark:hover:text-white transition-colors underline underline-offset-2"
              >
                blogs.tirup.in
              </a>
              . Selected essays are syndicated to the{" "}
              <a href="/blogs" className="hover:text-black dark:hover:text-white transition-colors underline underline-offset-2">
                /blogs
              </a>{" "}
              section of this portfolio.
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Values</h2>
            <p>
              I believe good software is an act of craft — every decision, from type signatures
              to HTTP headers, carries responsibility. Security and privacy should be
              first-class design constraints, not afterthoughts. I am drawn to systems where
              correct behaviour is enforced by structure rather than discipline alone.
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Connect</h2>
            <p className="mb-4">
              I am open to collaboration, freelance engineering work, and conversations about
              systems security and frontend architecture. The best ways to reach me are listed
              on the{" "}
              <a href="/contact" className="hover:text-black dark:hover:text-white transition-colors underline underline-offset-2">
                contact page
              </a>
              .
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a href="https://github.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                GitHub <ArrowUpRight size={12} className="opacity-40" />
              </a>
              <a href="https://www.linkedin.com/in/TirupMehta" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                LinkedIn <ArrowUpRight size={12} className="opacity-40" />
              </a>
              <a href="https://peerlist.io/tirupmehta" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                Peerlist <ArrowUpRight size={12} className="opacity-40" />
              </a>
              <a href="https://x.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                X (Twitter) <ArrowUpRight size={12} className="opacity-40" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-6 px-6 text-center border-t border-black/10">
        <p className="text-black/50 dark:text-white/50" suppressHydrationWarning>
          © {currentYear} Tirup Mehta. All rights reserved.
        </p>
      </footer>
    </main>
  )
}
