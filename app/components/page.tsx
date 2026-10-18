import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { LiquidAsciiDemo } from "@/components/library/liquid-ascii-demo"
import { AnimatedNumber } from "@/components/library/animated-number"
import { Reveal } from "@/components/library/reveal"
import { SITE, absoluteUrl } from "@/lib/components-site"

export const metadata: Metadata = {
  title: `${SITE.name}: Unique React components I built`,
  description: SITE.description,
  alternates: { canonical: absoluteUrl("/") },
}

const SPECS = [
  { value: 20000, start: 0, label: "particles", sub: "FLIP, one file" },
  { value: 60, start: 0, label: "fps", sub: "sleeps when settled" },
  { value: 30, start: 0, label: "solver passes", sub: "per frame" },
  { value: 0, start: 24, label: "dependencies", sub: "zero, counted down" },
]

function Stagger({ text, base = 0 }: { text: string; base?: number }) {
  return (
    <span className="inline-block" aria-label={text} role="text">
      {text.split("").map((ch, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.06em] -mb-[0.06em]">
          <span
            className="hero-char inline-block will-change-transform"
            style={{ animationDelay: `${base + i * 45}ms` }}
          >
            {ch === " " ? " " : ch}
          </span>
        </span>
      ))}
    </span>
  )
}

export default function Home() {
  return (
    <>
      {/* Hero — product drop: kinetic type up top, live demo full-width below */}
      <section className="px-5 md:px-8 pt-10 md:pt-16 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between border-b border-zinc-900/10 dark:border-white/10 pb-4">
          <p className="font-mono text-[11px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            tirup.in/components
          </p>
          <p className="font-mono text-[11px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            vol. 001 — live drop
          </p>
        </div>

        <h1 className="mt-8 font-semibold tracking-[-0.045em] leading-[0.9] text-zinc-900 dark:text-zinc-50 text-[12vw] sm:text-7xl md:text-8xl lg:text-[8.5rem]">
          <Stagger text="liquid ascii" base={100} />
        </h1>

        <Reveal delay={150}>
          <div className="mt-8 flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-12">
            <p className="text-base md:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg">
              A real FLIP fluid simulation rendered as ASCII text.
              Zero dependencies, one file — drag through it below.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/components/liquid-ascii"
                  className="group inline-flex items-center gap-1.5 h-11 pl-6 pr-5 text-sm font-medium rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:opacity-85 transition-opacity active:scale-[0.98]"
                >
                  Open the playground
                  <ArrowRight size={15} className="icon-arrow-hover" />
                </Link>
                <Link
                  href="/components/docs"
                  className="inline-flex items-center h-11 px-6 text-sm rounded-full border border-zinc-900/15 dark:border-white/15 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-900/[0.04] dark:hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
                >
                  Quick start
                </Link>
              </div>
              <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                <span>v0.1.0</span>
                <span aria-hidden="true">·</span>
                <span>MIT</span>
                <span aria-hidden="true">·</span>
                <span>0 deps</span>
                <span aria-hidden="true">·</span>
                <span>60 fps</span>
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Link
            href="/components/liquid-ascii"
            className="card-hover group mt-10 block relative overflow-hidden rounded-3xl border border-zinc-900/10 dark:border-white/10 h-[340px] md:h-[460px] bg-zinc-900/[0.015] dark:bg-white/[0.02]"
          >
            <LiquidAsciiDemo autoWave cellSize={11} />
            <p className="pointer-events-none absolute top-4 left-4 rounded-full bg-zinc-900/80 dark:bg-black/60 text-white backdrop-blur px-3.5 py-1.5 text-[11px] font-mono">
              drag to stir — live
            </p>
            <span className="absolute top-4 right-4 rounded-full border border-zinc-900/10 dark:border-white/15 bg-white/85 dark:bg-zinc-900/85 backdrop-blur px-3 py-1.5 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              Free
            </span>
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-zinc-900/80 dark:bg-black/60 text-white backdrop-blur px-4 py-2 text-xs font-medium">
              Open playground
              <ArrowUpRight size={14} className="icon-arrow-hover" />
            </span>
          </Link>
        </Reveal>
      </section>

      {/* Components index — Skiper card grid */}
      <section className="px-5 md:px-8 pb-6 max-w-6xl mx-auto w-full">
        <Reveal>
          <div className="flex items-end justify-between border-t border-zinc-900/10 dark:border-white/10 pt-6 mb-2">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              01 — Outstanding component
            </h2>
            <Link
              href="/components/all"
              className="group hidden sm:inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Explore all <ArrowUpRight size={14} className="icon-arrow-hover" />
            </Link>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            No extra packages — just one file per component. Use directly.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <Link
            href="/components/liquid-ascii"
            className="card-hover group flex items-center justify-between gap-4 rounded-2xl border border-zinc-900/10 dark:border-white/10 px-5 md:px-6 py-5 bg-zinc-900/[0.015] dark:bg-white/[0.02]"
          >
            <div className="flex items-baseline gap-4 min-w-0">
              <span className="font-mono text-xs text-zinc-300 dark:text-zinc-600 shrink-0">
                001
              </span>
              <div className="min-w-0">
                <p className="font-medium text-lg text-zinc-900 dark:text-zinc-50">
                  Liquid Ascii
                  <span className="ml-2.5 rounded-full border border-zinc-900/10 dark:border-white/15 px-2 py-0.5 align-middle text-[11px] font-mono font-normal text-zinc-500 dark:text-zinc-400">
                    Free
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 truncate">
                  FLIP fluid simulation rendered as ASCII characters
                </p>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-zinc-400 icon-arrow-hover shrink-0" />
          </Link>
        </Reveal>

        {/* Spec strip — skiper37 numbers, restrained: dividers + tabular nums */}
        <Reveal delay={100}>
          <dl className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-zinc-900/10 dark:border-white/10 bg-zinc-900/10 dark:bg-white/10 overflow-hidden">
            {SPECS.map((s) => (
              <div key={s.label} className="px-5 py-4 bg-white dark:bg-[#09090b]">
                <dd className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
                  <AnimatedNumber value={s.value} start={s.start} duration={1400} />
                </dd>
                <dt className="mt-1 text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {s.label}
                </dt>
                <dd className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{s.sub}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* Principles */}
      <section className="px-5 md:px-8 py-10 max-w-6xl mx-auto w-full">
        <Reveal>
          <div className="border-t border-zinc-900/10 dark:border-white/10 pt-6 mb-6">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Built different
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Three rules every component on this site follows.
            </p>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ["01", "Live before you copy", "Every component ships with an interactive playground. Tune the props, feel it, then take the code."],
            ["02", "Yours, not rented", "Single-file components with zero third-party dependencies. No license keys, no lock-in, no paid core."],
            ["03", "Fast by default", "Dark mode out of the box, reduced-motion respected, and simulations that sleep the moment they settle."],
          ].map(([n, t, b], i) => (
            <Reveal key={t} delay={i * 70}>
              <div className="card-hover h-full rounded-2xl border border-zinc-900/10 dark:border-white/10 p-6 md:p-8 bg-zinc-900/[0.015] dark:bg-white/[0.02]">
                <p className="font-mono text-sm text-zinc-300 dark:text-zinc-600">
                  {n}
                </p>
                <h3 className="mt-4 text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t}</h3>
                <p className="mt-2 text-sm md:text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="mt-10 rounded-2xl border border-zinc-900/10 dark:border-white/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5 justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-2">
                What&apos;s next
              </p>
              <p className="text-lg md:text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
                New components land here as I build them. Free forever.
              </p>
            </div>
            <Link
              href="/components/all"
              className="group inline-flex items-center gap-1.5 h-10 pl-5 pr-4 text-sm font-medium rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:opacity-85 transition-opacity active:scale-[0.98] shrink-0"
            >
              See what&apos;s live
              <ArrowRight size={15} className="icon-arrow-hover" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
