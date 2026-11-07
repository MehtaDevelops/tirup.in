import type { Metadata } from "next"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import HeroDots from "@/components/hero-dots"
import { ArrowUpRight } from "lucide-react"

export const metadata: Metadata = {
  title: {
    absolute: "Tirup Mehta",
  },
  description: "Tirup Mehta is a software engineering student building secure, high-performance web interfaces. Frontend, cryptography, and systems security. Based in Gujarat, India.",
  alternates: {
    canonical: "https://tirup.in"
  }
}

export default function Home() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen flex flex-col">
      <Header />

      {/*
        SSR content block for AI crawlers and agents that do not execute JavaScript.
        <noscript> is hidden from JS-enabled browsers but present in raw HTML.
      */}
      <noscript>
        <article style={{ maxWidth: "48rem", margin: "0 auto", padding: "2rem 1.5rem", fontFamily: "sans-serif", lineHeight: 1.7, color: "#111" }}>
          <h2>Tirup Mehta, Software Engineer</h2>
          <p>
            Tirup Mehta is a software engineering student building secure, high-performance web interfaces. Frontend, cryptography, and systems security. Based in Gujarat, India.
          </p>

          <h2>About</h2>
          <p>
            I&apos;m a software engineering student in Gujarat who builds user-facing products, from web interfaces to privacy-focused desktop software. I focus on making them clear to use and dependable underneath.
          </p>
          <p>
            I built <a href="/projects/modelregistry">ModelRegistry</a>, an open AI model registry with a public API and RSS feed, and <a href="/projects/draft">Draft</a>, an offline Windows dictation app that transcribes on-device without sending audio to the cloud.
          </p>
          <p>
            I write about building and securing software on my <a href="https://blogs.tirup.in">engineering blog</a> and share code on <a href="/github">GitHub</a>. Hiring for frontend or product engineering? <a href="/contact">Get in touch</a>.
          </p>

          <h2>Technical Stack</h2>
          <ul>
            <li><strong>Languages:</strong> TypeScript, JavaScript</li>
            <li><strong>Frameworks:</strong> React, Next.js</li>
            <li><strong>Styling &amp; UI:</strong> Tailwind CSS, Motion, shadcn/ui, Base UI</li>
            <li><strong>Backend &amp; Databases:</strong> Convex, Supabase, Redis, MongoDB</li>
            <li><strong>Security focus:</strong> Secure key exchange, CSP, cryptographic protocols, data protection</li>
          </ul>

          <h2>Navigation</h2>
          <ul>
            <li><a href="/work">Work &amp; Projects</a></li>
            <li><a href="/skills">Technical Skills</a></li>
            <li><a href="/writing">Writing</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>

          <h2>Connect</h2>
          <ul>
            <li><a href="https://github.com/TirupMehta" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/TirupMehta" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href="https://blogs.tirup.in" rel="noopener noreferrer">Engineering Blog</a></li>
            <li><a href="https://peerlist.io/tirupmehta" rel="noopener noreferrer">Peerlist</a></li>
            <li><a href="https://x.com/TirupMehta" rel="noopener noreferrer">X (Twitter)</a></li>
          </ul>

          <p>
            Agent resources: <a href="/llms.txt">llms.txt</a>, <a href="/sitemap.xml">sitemap.xml</a>
          </p>
        </article>
      </noscript>

      {/* Intro/Hero Section */}
      <section className="section px-6 md:px-20 pb-8 max-w-4xl mx-auto w-full">
        {/* Story Description Paragraphs */}
        <div className="space-y-6 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
          <TextWithBlur delay={150}>
            <p>
              I&apos;m a software engineering student in Gujarat who builds user-facing products, from web interfaces to privacy-focused desktop software. I focus on making them clear to use and dependable underneath.
            </p>
          </TextWithBlur>

          <TextWithBlur delay={200}>
            <p>
              I built <a href="/projects/modelregistry" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">ModelRegistry</a>, an open AI model registry with a public API and RSS feed, and <a href="/projects/draft" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">Draft</a>, an offline Windows dictation app that transcribes on-device without sending audio to the cloud.
            </p>
          </TextWithBlur>

          <TextWithBlur delay={250}>
            <p>
              I write about building and securing software on my <a href="https://blogs.tirup.in" target="_blank" rel="noopener noreferrer" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">engineering blog</a> and share code on <a href="/github" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">GitHub</a>. Hiring for frontend or product engineering? <a href="/contact" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">Get in touch</a>.
            </p>
          </TextWithBlur>
        </div>

        {/* Connect Links */}
        <TextWithBlur delay={300}>
          <div className="mt-8 border-t border-black/5 dark:border-white/5 pt-6">
            <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-6">
              Connect
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4 text-xs md:text-sm font-light text-black/55 dark:text-white/55">
              <a href="https://github.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-60 group-hover:opacity-100 icon-arrow-hover" /> GitHub
              </a>
              <a href="https://www.linkedin.com/in/TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-60 group-hover:opacity-100 icon-arrow-hover" /> LinkedIn
              </a>
              <a href="https://peerlist.io/tirupmehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-60 group-hover:opacity-100 icon-arrow-hover" /> Peerlist
              </a>
              <a href="https://happenstance.ai/u/tirupmehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-60 group-hover:opacity-100 icon-arrow-hover" /> Happenstance
              </a>
              <a href="https://x.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-60 group-hover:opacity-100 icon-arrow-hover" /> X (Twitter)
              </a>
              <a href="https://www.kaggle.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-60 group-hover:opacity-100 icon-arrow-hover" /> Kaggle
              </a>
              <a href="https://g.dev/Tirup" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-60 group-hover:opacity-100 icon-arrow-hover" /> Google Dev
              </a>
              <a href="https://www.cloudskillsboost.google/public_profiles/5de29c1c-84d0-46a5-a4eb-5fa999499184" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-60 group-hover:opacity-100 icon-arrow-hover" /> Google Cloud
              </a>
              <a href="https://medium.com/@TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-60 group-hover:opacity-100 icon-arrow-hover" /> Medium
              </a>
              <a href="https://instagram.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-60 group-hover:opacity-100 icon-arrow-hover" /> Instagram
              </a>
              <a href="https://youtube.com/@TirupMehta" target="_blank" rel="noopener noreferrer" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 w-fit">
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-60 group-hover:opacity-100 icon-arrow-hover" /> YouTube
              </a>
            </div>
          </div>
        </TextWithBlur>

        {/* Developer & Agent Resources */}
        <TextWithBlur delay={350}>
          <div className="mt-10 border-t border-black/5 dark:border-white/5 pt-6">
            <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-6">
              Developer &amp; Agent Resources
            </h2>
            <div className="space-y-4 text-xs md:text-sm font-light text-black/55 dark:text-white/55 max-w-3xl">
              <p className="leading-relaxed">
                The tirup.in API is public, read-only, and needs no key. It returns this
                site&apos;s profile, project index, and published article list as JSON,
                with an OpenAPI 3.1 description, RFC 9457 problem errors, and RFC RateLimit
                headers. Everything here is meant to be fetched by a script or an agent as
                much as read by a person.
              </p>
              <p className="leading-relaxed">
                Every response is JSON with an explicit schema, and every failure is a
                problem document you can branch on, so an integration never has to scrape
                HTML or guess at error text.
              </p>
              <p className="leading-relaxed">
                No authentication is required, so a request against this host cannot mutate
                anything and the production API doubles as the sandbox. The same facts are
                also published as JSON-LD on every page, so a crawler that runs JavaScript
                and one that does not see the same identity.
              </p>
              <ul className="space-y-2">
                <li>
                  <a href="/docs" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">
                    API documentation
                  </a>{" "}
                  — four endpoints, JSON response schemas, error codes, rate limits,
                  versioning, and the deprecation policy.
                </li>
                <li>
                  <a href="/developers" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">
                    Developer portal
                  </a>{" "}
                  — quickstart, API keys, sandbox guidance, and support channels.
                </li>
                <li>
                  <a href="/cli" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">
                    tirup CLI
                  </a>{" "}
                  — zero-dependency command-line client for the API, with JSON output for
                  agents.
                </li>
                <li>
                  <a href="/openapi.json" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">
                    OpenAPI 3.1 description
                  </a>{" "}
                  — import the whole API into Postman, Insomnia, or an agent tool registry.
                </li>
                <li>
                  <a href="/llms.txt" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">
                    llms.txt
                  </a>{" "}
                  — plain-text site summary written for language models.
                </li>
                <li>
                  <a href="/sitemap.xml" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">
                    Sitemap
                  </a>{" "}
                  — every indexable URL on this host.
                </li>
                <li>
                  <a href="https://github.com/TirupMehta" target="_blank" rel="noopener noreferrer" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">
                    GitHub
                  </a>{" "}
                  — source for this site, the CLI, and the projects above.
                </li>
              </ul>
              <p className="leading-relaxed">
                Machine-readable discovery is advertised in this page&apos;s response
                headers too: the API catalog at{" "}
                <a href="/.well-known/api-catalog" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">
                  /.well-known/api-catalog
                </a>{" "}
                (RFC 9727) and the agent guide at{" "}
                <a href="/llms.txt" className="underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors">
                  /llms.txt
                </a>
                .
              </p>
            </div>
          </div>
        </TextWithBlur>

        {/* Dynamic Indicator Dots at the bottom of hero */}
        <HeroDots />
      </section>

      {/* Footer */}
      <footer className="py-4 px-6 text-center border-t border-black/10 dark:border-white/10 mt-auto">
        <p className="text-xs md:text-sm text-black/40 dark:text-white/40" suppressHydrationWarning>© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
