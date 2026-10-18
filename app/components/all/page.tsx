import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { LiquidAsciiDemo } from "@/components/library/liquid-ascii-demo"
import { Reveal } from "@/components/library/reveal"

import { absoluteUrl } from "@/lib/components-site"

export const metadata: Metadata = {
  title: "All components",
  description: "Unique React components I built. Live, self-owned, dependency-free.",
  alternates: { canonical: absoluteUrl("/all") },
}

export default function ComponentsPage() {
  return (
    <>
      <section className="px-5 md:px-8 pt-12 md:pt-20 pb-10 max-w-6xl mx-auto w-full">
        <Reveal>
          <p className="font-mono text-[11px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-5">
            Index — 01 live
          </p>
        </Reveal>
        <Reveal delay={60}>
        <h1 className="font-semibold tracking-[-0.04em] leading-[0.95] text-zinc-900 dark:text-zinc-50 text-[12vw] sm:text-7xl md:text-8xl">
          all components
        </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-7 text-base md:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
            Uncommon components I build and post here. Self-owned single files.
            Read the source, tune the playground, copy the code.
          </p>
        </Reveal>
      </section>

      <section className="px-5 md:px-8 pb-6 max-w-6xl mx-auto w-full">
        <Reveal>
          <div className="flex items-end justify-between border-t border-zinc-900/10 dark:border-white/10 pt-6 mb-2">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              01 — Outstanding component
            </h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            No extra packages — just one file per component. Use directly.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <Link
            href="/components/liquid-ascii"
            className="card-hover group block rounded-2xl border border-zinc-900/10 dark:border-white/10 overflow-hidden bg-zinc-900/[0.015] dark:bg-white/[0.02]"
          >
            <div className="h-[280px] md:h-[360px] relative">
              <LiquidAsciiDemo autoWave cellSize={10} />
              <p className="pointer-events-none absolute top-3 left-3 rounded-full bg-zinc-900/80 dark:bg-black/60 text-white backdrop-blur px-3 py-1 text-[11px] font-mono">
                drag to stir
              </p>
              <span className="absolute top-3 right-3 rounded-full border border-zinc-900/10 dark:border-white/15 bg-white/85 dark:bg-zinc-900/85 backdrop-blur px-2.5 py-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                Free
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-900/10 dark:border-white/10">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">Liquid Ascii</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  FLIP fluid simulation rendered as ASCII characters
                </p>
              </div>
              <ArrowUpRight size={16} className="text-zinc-400 icon-arrow-hover" />
            </div>
          </Link>
        </Reveal>

        <Reveal delay={100}>
          <p className="mt-8 text-sm text-zinc-400 dark:text-zinc-500">
            New components land here as I build them. Each one ships with a
            live playground and build notes.
          </p>
        </Reveal>
      </section>
    </>
  )
}
