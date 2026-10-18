import type { Metadata } from "next"
import Link from "next/link"
import TextWithBlur from "@/components/text-with-blur"
import ExpressionAvatar from "@/components/expression-avatar"
import { CodeDemo } from "@/components/library/code-demo"
import { SITE, installCommand, namespaceAddCommand } from "@/lib/components-site"

export const metadata: Metadata = {
  title: "Component Docs",
  description: "Install the components I built: registry setup, theming, mobile, performance.",
  alternates: { canonical: "/components/docs" },
  openGraph: { url: "/components/docs" },
}

const STEPS: Array<{ title: string; body: React.ReactNode }> = [
  {
    title: "Pick a component",
    body: (
      <>
        Browse{" "}
        <Link href="/components/all" className="link-hover hover:text-accent transition-colors">
          the index
        </Link>
        , open one, tune the playground until it feels right, then copy the
        usage snippet. It follows your settings live.
      </>
    ),
  },
  {
    title: "Theming",
    body: (
      <>
        Components read the <code>dark</code> class on <code>&lt;html&gt;</code>{" "}
        and adapt automatically. Reduced-motion users get a still frame, and
        simulations sleep when settled.
      </>
    ),
  },
  {
    title: "Mobile",
    body: (
      <>
        Interactive demos are desktop-first. Gate heavy components behind a
        pointer or screen-size check, load them client-side only, and skip them
        entirely on small screens.
      </>
    ),
  },
  {
    title: "Performance",
    body: (
      <>
        Cost scales with the size of the box. Demos sleep when settled, pause
        offscreen and in hidden tabs, and render one still frame for
        reduced-motion users.
      </>
    ),
  },
  {
    title: "License",
    body: (
      <>
        MIT. Free forever. Every component is yours once installed: copy it,
        modify it, ship it. No keys, no lock-in, no paid core.
      </>
    ),
  },
  {
    title: "Credit",
    body: (
      <>
        Liquid Ascii was inspired by{" "}
        <a
          href="https://pro.reactbits.dev/docs/components/liquid-ascii"
          target="_blank"
          rel="noopener noreferrer"
          className="link-hover hover:text-accent transition-colors"
        >
          React Bits&apos; Liquid ASCII
        </a>
        . The implementation here is my own, written from scratch.
      </>
    ),
  },
]

export default function DocsPage() {
  const currentYear = new Date().getFullYear()
  let blockIndex = 0

  return (
    <main className="relative min-h-screen">
      <div className="section px-6 md:px-20 pt-8 sm:pt-10 md:pt-14 pb-16 max-w-4xl mx-auto w-full">

        {/* Breadcrumb — same as writing detail pages */}
        <TextWithBlur>
          <div className="flex items-center gap-2 text-xs md:text-sm text-black/40 dark:text-white/40 mb-5 sm:mb-7 select-none flex-wrap">
            <Link href="/" className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors">
              <div className="shrink-0">
                <ExpressionAvatar size={20} interactive={false} face="laugh" />
              </div>
              <span className="font-light">Tirup Mehta</span>
            </Link>
            <span className="text-black/20 dark:text-white/20 select-none">›</span>
            <Link href="/components" className="hover:text-black dark:hover:text-white transition-colors font-light">
              Components
            </Link>
            <span className="text-black/20 dark:text-white/20 select-none">›</span>
            <span className="truncate max-w-[200px] sm:max-w-xs font-light text-black/30 dark:text-white/30">Docs</span>
          </div>
        </TextWithBlur>

        {/* Title — same serif treatment as writing detail pages */}
        <TextWithBlur delay={50}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-serif italic text-black dark:text-white mb-5 leading-[1.18] lg:leading-none max-w-3xl font-medium break-words">
            Installing my components
          </h1>
        </TextWithBlur>

        {/* Meta row — same as writing detail pages */}
        <TextWithBlur delay={50}>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs md:text-sm text-black/40 dark:text-white/40 mb-3">
            <span>Components</span>
            <span className="select-none text-black/20 dark:text-white/20">/</span>
            <span>Guide</span>
            <span className="select-none text-black/20 dark:text-white/20">/</span>
            <span className="tabular-nums">2 min read</span>
          </div>
        </TextWithBlur>

        {/* Separator line — same as writing detail pages */}
        <TextWithBlur delay={80}>
          <div className="border-b border-black/5 dark:border-white/5 mb-8 sm:mb-10 pb-2 flex justify-between items-center max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {["shadcn", "registry", "guide"].map((tag) => (
                <span key={tag} className="text-xs font-light text-black/40 dark:text-white/40">
                  #{tag}
                </span>
              ))}
            </div>
            <Link
              href="/components"
              className="group text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-0.5"
            >
              <span className="link-hover pb-0.5">All components</span>
            </Link>
          </div>
        </TextWithBlur>

        {/* Intro — prose in the article voice */}
        <TextWithBlur delay={100}>
          <div className="space-y-4 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl mb-16">
            <p>
              From zero to a running component in under a minute. No setup, no
              config — one command per component.
            </p>
          </div>
        </TextWithBlur>

        {/* Numbered sections — same corridor system as everywhere else.
            Code takes the full-width row: the corridor's content column is
            sized for prose, and commands only read right at article width. */}
        <div className="flex flex-col">
          <TextWithBlur>
            <div className="border-t border-black/10 dark:border-white/10 py-10 md:py-12">
              <div className="flex items-baseline gap-2">
                <span className="font-mono tabular-nums text-xs text-black/45 dark:text-white/45 select-none">
                  {String(++blockIndex).padStart(2, "0")}
                </span>
                <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45">Install</h2>
              </div>
              <div className="mt-6 min-w-0">
                <CodeDemo
                  blocks={[
                    { lang: "bash", code: installCommand("<name>") },
                    {
                      lang: "bash",
                      code: `${namespaceAddCommand}\nnpx shadcn@latest add ${SITE.namespace}/<name>`,
                    },
                  ]}
                />
                <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">
                  The first command drops the component straight into your
                  project as a single file with zero third-party dependencies.
                  Replace <code className="font-mono">&lt;name&gt;</code> with any component.
                  The second registers the namespace once, so afterwards you can
                  add things by short name.
                </p>
              </div>
            </div>
          </TextWithBlur>

          {STEPS.map((s) => (
            <TextWithBlur key={s.title}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-12">
                <div className="col-span-1 flex items-baseline gap-2">
                  <span className="font-mono tabular-nums text-xs text-black/45 dark:text-white/45 select-none">
                    {String(++blockIndex).padStart(2, "0")}
                  </span>
                  <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45">{s.title}</h2>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed max-w-2xl">
                    {s.body}
                  </p>
                </div>
              </div>
            </TextWithBlur>
          ))}

          {/* End border */}
          <div className="border-t border-black/10 dark:border-white/10" />
        </div>

        <footer className="py-4 text-center border-t border-black/10 dark:border-white/10 mt-8">
          <p className="text-xs md:text-sm text-black/40 dark:text-white/40">© {currentYear} Tirup Mehta. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
