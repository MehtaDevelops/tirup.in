import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { CodeBlock } from "@/components/library/code-block"
import { Reveal } from "@/components/library/reveal"
import { SITE, installCommand, namespaceAddCommand, absoluteUrl } from "@/lib/components-site"

export const metadata: Metadata = {
  title: "Docs",
  description: "Install the components I built: registry setup, theming, mobile, performance.",
  alternates: { canonical: absoluteUrl("/docs") },
}

const STEPS: Array<{ title: string; body: React.ReactNode }> = [
  {
    title: "Pick a component",
    body: (
      <>
        Browse{" "}
        <Link href="/components/all" className="link-hover">
          components
        </Link>
        , open one, tune the playground until it feels right, then copy
        the usage snippet. It follows your settings live.
      </>
    ),
  },
  {
    title: "Theming",
    body: (
      <>
        Components read the <code className="font-mono text-[13px] px-1.5 py-0.5 rounded-md bg-zinc-900/[0.05] dark:bg-white/[0.08]">dark</code> class
        on <code className="font-mono text-[13px] px-1.5 py-0.5 rounded-md bg-zinc-900/[0.05] dark:bg-white/[0.08]">{"<html>"}</code> and
        adapt automatically. Reduced-motion users get a still frame, and
        simulations sleep when settled.
      </>
    ),
  },
  {
    title: "Mobile",
    body: (
      <>
        Interactive demos are desktop-first. Gate heavy components behind
        a pointer or screen-size check, load them client-side only, and
        skip them entirely on small screens.
      </>
    ),
  },
  {
    title: "Performance",
    body: (
      <>
        Cost scales with the size of the box. Demos sleep when settled,
        pause offscreen and in hidden tabs, and render one still frame
        for reduced-motion users.
      </>
    ),
  },
  {
    title: "License",
    body: (
      <>
        MIT. Free forever. Every component is yours once installed:
        copy it, modify it, ship it. No keys, no lock-in, no paid core.
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
          className="link-hover"
        >
          React Bits&apos; Liquid ASCII
        </a>
        . The implementation here is my own, written from scratch.
      </>
    ),
  },
]

export default function DocsPage() {
  return (
    <section className="px-5 md:px-8 pt-12 md:pt-16 pb-10 max-w-6xl mx-auto w-full">
      <div className="max-w-3xl">
        <Reveal>
          <p className="font-mono text-[11px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
            Docs
          </p>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="font-semibold tracking-[-0.04em] leading-[0.95] text-zinc-900 dark:text-zinc-50 text-[13vw] sm:text-7xl md:text-8xl">
            quick start
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-5 text-base md:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
            From zero to a running component in under a minute.
            No setup, no config — one command per component.
          </p>
        </Reveal>
      </div>

      <Reveal delay={140}>
        <div className="mt-10 rounded-2xl border border-zinc-900/10 dark:border-white/10 p-5 md:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-1">
            Install
          </p>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            One command, no setup
          </h2>
          <p className="mt-1.5 text-sm md:text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
            This drops the component straight into your project as a single
            file with zero third-party dependencies. Replace{" "}
            <code className="font-mono text-[13px] px-1.5 py-0.5 rounded-md bg-zinc-900/[0.05] dark:bg-white/[0.08]">{"<name>"}</code>{" "}
            with any component, e.g.{" "}
            <code className="font-mono text-[13px] px-1.5 py-0.5 rounded-md bg-zinc-900/[0.05] dark:bg-white/[0.08]">liquid-ascii</code>.
          </p>
          <div className="mt-5 grid lg:grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500 mb-2">
                Single component
              </p>
              <CodeBlock lang="bash" code={installCommand("<name>")} />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500 mb-2">
                Short names via namespace
              </p>
              <CodeBlock lang="bash" code={`${namespaceAddCommand}\nnpx shadcn@latest add ${SITE.namespace}/<name>`} />
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-12 max-w-3xl border-t border-zinc-900/10 dark:border-white/10">
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={Math.min(i * 50, 200)}>
            <div className="grid md:grid-cols-[88px_1fr] gap-1 md:gap-4 py-7 md:py-8 border-b border-zinc-900/10 dark:border-white/10">
              <p className="font-mono text-sm text-zinc-300 dark:text-zinc-600 pt-1.5">
                {String(i + 1).padStart(2, "0")}
              </p>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{s.title}</h2>
                <p className="mt-2 text-[15px] md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {s.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-10 max-w-3xl flex items-center justify-between border-t border-zinc-900/10 dark:border-white/10 pt-6">
          <Link
            href="/components/all"
            className="group inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft size={14} /> All components
          </Link>
          <Link
            href="/components/liquid-ascii"
            className="group inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Open playground <ArrowUpRight size={14} className="icon-arrow-hover" />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
