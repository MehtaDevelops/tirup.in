import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import CopyCommand from "@/components/library/copy-command"
import { SITE, installCommand } from "@/lib/components-site"

export const metadata: Metadata = {
  title: "Components",
  description: SITE.description,
  alternates: { canonical: "/components" },
  openGraph: { url: "/components" },
}

const components = [
  {
    title: "Liquid Ascii",
    description: "FLIP fluid simulation rendered as ASCII characters.",
    slug: "/components/liquid-ascii",
  },
]

export default function ComponentsPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20">
        <h1 className="sr-only">Components</h1>

        {/* Intro: same voice and rhythm as the homepage hero */}
        <div className="space-y-6 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
          <TextWithBlur delay={100}>
            <p>
              Components I build and post here. Each one ships as a single
              file with zero third-party dependencies, a live playground, and
              an install command. <Link href="/components/docs" className="link-hover hover:text-accent transition-colors">Getting started.</Link>
            </p>
          </TextWithBlur>
          <TextWithBlur delay={180}>
            <p>
              No registry games and no license keys: read the source, tune the
              props until it feels right, copy the code. What you install is
              yours forever.
            </p>
          </TextWithBlur>
        </div>

        {/* Index: identical row treatment to the tools page */}
        <TextWithBlur delay={220}>
          <div className="mt-12 border-t border-black/10 dark:border-white/10 pt-6">
            <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-6">
              Components
            </h2>
            <div className="flex flex-col">
              {components.map((component, index) => (
                <Link
                  key={component.slug}
                  href={component.slug}
                  className={`group block py-5 ${index > 0 ? "border-t" : ""} border-black/10 dark:border-white/10`}
                  suppressHydrationWarning
                >
                  <div className="flex items-baseline gap-4 md:gap-6">
                    <span className="font-mono tabular-nums text-xs md:text-sm text-black/45 dark:text-white/45 select-none w-6 shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                      <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300">
                        {component.title}
                      </span>
                      <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                      <span className="text-black/45 dark:text-white/45 font-light group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-300 text-sm">
                        {component.description}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="border-t border-black/10 dark:border-white/10" />
            </div>
          </div>
        </TextWithBlur>

        {/* Quick install: same pill treatment as "Read all blogs" */}
        <TextWithBlur delay={280}>
          <div className="pt-8 pb-2 flex flex-wrap items-center gap-3">
            <CopyCommand command={installCommand("<name>")} label="Quick install" />
            <span className="text-xs font-light text-black/35 dark:text-white/35">
              replaces <span className="font-mono">&lt;name&gt;</span> with any component
            </span>
          </div>
        </TextWithBlur>

        {/* Where new components land: quiet note, list-page style */}
        <TextWithBlur delay={320}>
          <div className="pt-8">
            <p className="text-sm font-light text-black/40 dark:text-white/40">
              New components land here as I build them. Everything is MIT
              licensed, free forever.
            </p>
          </div>
        </TextWithBlur>
      </section>

      <footer className="py-4 px-6 text-center border-t border-black/10 dark:border-white/10">
        <p className="text-xs md:text-sm text-black/40 dark:text-white/40" suppressHydrationWarning>© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
