"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowUpRight, Bot, Check, Maximize2, X } from "lucide-react"
import { LiquidAsciiDemo } from "@/components/library/liquid-ascii-demo"
import { AnimatedNumber } from "@/components/library/animated-number"
import { Playground, DEFAULTS, type PlaygroundConfig } from "@/components/library/playground"
import { CodeBlock } from "@/components/library/code-block"
import { PropsTable, type PropRow } from "@/components/library/props-table"
import { copyText } from "@/lib/utils"
import { SITE, installCommand } from "@/lib/components-site"

const PROPS: PropRow[] = [
  { name: "speed", type: "number", defaultValue: "1", description: "Simulation timestep multiplier (0.1–3)." },
  { name: "cellSize", type: "number", defaultValue: "12", description: "Character cell size in pixels (6–30). Drives sim + render together." },
  { name: "gravity", type: "number", defaultValue: "-25", description: "Gravity strength, negative = downward (−50–0)." },
  { name: "fillHeight", type: "number", defaultValue: "0.5", description: "Fill fraction of the tank (0–1)." },
  { name: "cursorRadius", type: "number", defaultValue: "0.25", description: "Mouse influence as a fraction of the short side (0–0.5)." },
  { name: "cursorForce", type: "number", defaultValue: "66", description: "Strength of the cursor push force (0–200)." },
  { name: "autoWave", type: "boolean", defaultValue: "true", description: "Gentle idle waves when untouched. Motion is input-driven otherwise." },
  { name: "className", type: "string", defaultValue: '""', description: "Additional classes for the canvas element." },
]

function usageSnippet(c: PlaygroundConfig) {
  return `import { LiquidAsciiDemo } from "@/components/liquid-ascii"

export function Hero() {
  return (
    <div className="h-[440px]">
      <LiquidAsciiDemo
        speed={${c.speed}}
        cellSize={${c.cellSize}}
        gravity={${c.gravity}}
        fillHeight={${c.fillHeight}}
        cursorRadius={${c.cursorRadius}}
        cursorForce={${c.cursorForce}}
        autoWave={${c.autoWave}}
      />
    </div>
  )
}`
}

function aiSummary(c: PlaygroundConfig) {
  return `# Liquid Ascii (${SITE.name})\n\nFluid simulation rendered as ASCII characters. Self-owned single-file React component I built from scratch, zero dependencies. Inspired by React Bits' Liquid ASCII (https://pro.reactbits.dev/docs/components/liquid-ascii).\n\n## Install\n\n\`\`\`bash\n${installCommand("liquid-ascii")}\n\`\`\`\n\n## Usage\n\n\`\`\`tsx\n${usageSnippet(c)}\n\`\`\`\n\n## Props\n\n${PROPS.map((p) => `- \`${p.name}\` (${p.type}, default \`${p.defaultValue}\`): ${p.description}`).join("\n")}\n\n## Notes\n\n- Touch-only cursor: moving through air does nothing; force applies on fluid contact.\n- Theme-aware (reads the \`dark\` class), respects prefers-reduced-motion, sleeps when settled.\n- Desktop-first; gate mounting behind a pointer/media check on mobile.\n`
}

export function LiquidAsciiDoc({ faqs }: { faqs: Array<{ q: string; a: string }> }) {
  const [cfg, setCfg] = useState<PlaygroundConfig>(DEFAULTS)
  const [aiCopied, setAiCopied] = useState(false)
  const [full, setFull] = useState(false)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const openRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!full) {
      openRef.current?.focus()
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [full])

  const copyForAI = async () => {
    await copyText(aiSummary(cfg))
    setAiCopied(true)
    window.setTimeout(() => setAiCopied(false), 1600)
  }

  return (
    <section className="px-5 md:px-8 pt-12 md:pt-16 pb-10 max-w-6xl mx-auto w-full">
      <div>
      <p className="font-mono text-[11px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
        <Link href="/components/all" className="link-hover">Components</Link>
        <span className="mx-2 text-zinc-300 dark:text-zinc-600">/</span>
        Cursor Effects
        <span className="mx-2 text-zinc-300 dark:text-zinc-600">/</span>
        <span className="text-zinc-900 dark:text-zinc-50">Liquid Ascii</span>
      </p>
      <h1 className="font-semibold tracking-[-0.04em] leading-[0.95] text-zinc-900 dark:text-zinc-50 text-5xl md:text-7xl">
        liquid ascii
      </h1>
      <p className="mt-4 text-base md:text-lg text-zinc-500 dark:text-zinc-400">
        FLIP fluid simulation rendered as ASCII characters. Real fluid
        dynamics rendered as text — free, open source, zero dependencies.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-zinc-900/[0.05] dark:bg-white/[0.07] text-zinc-500 dark:text-zinc-400">
          liquid-ascii
        </span>
        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-zinc-900/[0.05] dark:bg-white/[0.07] text-zinc-500 dark:text-zinc-400">
          v0.1.0
        </span>
        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-zinc-900/[0.05] dark:bg-white/[0.07] text-zinc-500 dark:text-zinc-400">
          MIT
        </span>
        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-zinc-900/[0.05] dark:bg-white/[0.07] text-zinc-500 dark:text-zinc-400">
          Free
        </span>
        <button
          type="button"
          onClick={copyForAI}
          className="inline-flex items-center gap-1.5 font-sans text-xs px-2.5 py-1 rounded-md border border-zinc-900/10 dark:border-white/15 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-900/25 dark:hover:border-white/30 transition-colors cursor-pointer"
        >
          {aiCopied ? <Check size={12} /> : <Bot size={12} />}
          {aiCopied ? "Copied" : "Copy for AI"}
        </button>
        <button
          type="button"
          ref={openRef}
          onClick={() => setFull(true)}
          aria-haspopup="dialog"
          aria-expanded={full}
          className="inline-flex items-center gap-1.5 font-sans text-xs px-2.5 py-1 rounded-md border border-zinc-900/10 dark:border-white/15 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-900/25 dark:hover:border-white/30 transition-colors cursor-pointer"
        >
          <Maximize2 size={12} />
          Fullscreen
        </button>
      </div>

      {full && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Liquid ASCII fullscreen demo"
          className="fixed inset-0 z-[90] bg-white dark:bg-[#09090b]"
        >
          <div className="absolute inset-0">
            <LiquidAsciiDemo
              speed={cfg.speed}
              cellSize={cfg.cellSize}
              gravity={cfg.gravity}
              fillHeight={cfg.fillHeight}
              cursorRadius={cfg.cursorRadius}
              cursorForce={cfg.cursorForce}
              autoWave={cfg.autoWave}
            />
          </div>
          <p className="pointer-events-none absolute top-5 left-5 rounded-full bg-zinc-900/80 dark:bg-black/60 text-white backdrop-blur px-4 py-1.5 text-xs font-mono">
            drag through the fluid (esc to exit)
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setFull(false)}
            aria-label="Exit fullscreen demo"
            className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-zinc-900/80 dark:bg-black/60 text-white backdrop-blur hover:opacity-80 active:scale-95 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mt-8">
        <Playground onConfig={setCfg} />
      </div>

      <h2 className="mt-12 mb-4 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
        Install
      </h2>
      <div className="space-y-4">
        <CodeBlock lang="bash" code={installCommand("liquid-ascii")} />
        <CodeBlock lang="tsx" code={usageSnippet(cfg)} />
        <p className="-mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          The snippet above follows your playground settings live. Installed from{" "}
          {SITE.url.replace("https://", "")}, one file, zero dependencies.{" "}
          <Link href="/components/docs" className="link-hover">
            Getting started guide
          </Link>
          .
        </p>
      </div>

      <h2 className="mt-12 mb-4 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
        Props
      </h2>
      <PropsTable rows={PROPS} />

      <h2
        className="mt-12 mb-4 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500"
      >
        How I built it
      </h2>
      <p className="text-sm md:text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 max-w-2xl">
        No video loops, no CSS blobs. This is a genuine fluid solver: the
        same PIC/FLIP family behind film water effects, compressed until it
        runs at 60fps inside a grid of text characters. One file, zero
        libraries, and every number below matches the code you just installed.
      </p>
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl border border-zinc-900/10 dark:border-white/10 bg-zinc-900/10 dark:bg-white/10 overflow-hidden mb-6">
        {[
          { v: 20000, label: "particles max" },
          { v: 30, label: "solver passes" },
          { v: 4, label: "per cell" },
          { v: 0, start: 100, label: "dependencies" },
        ].map((s) => (
          <div
            key={s.label}
            className="px-4 py-3 bg-white dark:bg-[#09090b]"
          >
            <dd className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
              <AnimatedNumber value={s.v} start={s.start ?? 0} duration={1400} />
            </dd>
            <dt className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{s.label}</dt>
          </div>
        ))}
      </dl>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          [
            "Fall",
            "Every frame takes real delta time (clamped to 1/240–1/45s, scaled by speed) and runs two half-steps instead of one big jump. That's what keeps fast splashes stable. Gravity integrates first: velocity grows by (|gravity| / 25) × 1500 × dt each step.",
          ],
          [
            "Splat",
            "Up to 20,000 particles (4 per cell) each cast two votes: horizontal velocity goes onto the vertical grid faces, vertical velocity onto the horizontal faces (a staggered MAC layout), normalized per face. Faces touching solid cells are wall faces, prescribed zero. They are the only zeros in the system. The result is snapshotted, and that snapshot is the memory the FLIP blend needs later.",
          ],
          [
            "Squeeze",
            "Cells holding particles are marked fluid; the border is solid wall. Then 30 Jacobi iterations with 1.5 over-relaxation push the pressure field until every fluid cell agrees with its neighbours: divergence is read straight off the faces in a compact one-cell stencil, with the zeroed wall faces feeding the true no-penetration signal, and the gradient written back is its exact adjoint, so pressure can neither pump energy in nor leak volume out.",
          ],
          [
            "Return",
            "Motion flows back to the particles as a 28/72 blend: a little of the smooth face velocity (stable, mushy) and a lot of the FLIP delta versus the snapshot (lively, detailed), sampled from interior faces only so the strict-zero wall faces steady the solve without ever damping a particle. Speeds clamp at 1500, particles advect, walls stop only the head-on component while sideways slide survives with light friction, with a 0.35-cell gap so liquid reaches the edges. Overfull cells get hash-jittered apart and up to 200 lost particles reseed per frame.",
          ],
          [
            "Touch",
            "Your cursor is a spoon, not a magnet. Pointer velocity is smoothed and a 3×3 neighbourhood is checked first. Moving through empty air does nothing; only contact pushes, with strength falling off quadratically inside your cursor radius. Leave it alone for 2 seconds and a slow wandering column nudges the surface so the showcase stays breathing.",
          ],
          [
            "Ink",
            "Each column's surface is the first row with real particle presence. Surface cells get the heaviest glyphs, fast spray above the surface gets mid-weight marks, and depth below fades through noise-weighted characters, with deliberately low cutoffs so hard stirring spreads the liquid instead of thinning it into nothing. Colors are pre-built per alpha step (zero string garbage per frame) and the theme follows your dark class live.",
          ],
        ].map(([t, b]) => (
          <div
            key={t}
            className="rounded-xl border border-zinc-900/10 dark:border-white/10 p-5"
          >
            <h3 className="font-medium text-zinc-900 dark:text-zinc-50 mb-1.5">{t}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{b}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-zinc-900/15 dark:border-white/15 p-5">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50 mb-1.5">Honest limits</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          One tank, two dimensions, no obstacles, and cellSize is the whole
          performance budget (6–30px drives sim, particles, and glyphs
          together). The loop sleeps when settled, pauses offscreen and in
          hidden tabs, draws one still frame for reduced-motion users, caps
          pixel ratio at 2, and debounces rebuilds at 120ms. Resizing or
          changing cell size holds exactly 4 particles per cell, adding or
          randomly thinning as needed, so the quantity of liquid never
          changes in any box, at any cell size.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-900/10 dark:border-white/10 p-5">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50 mb-1.5">Inspiration credit</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          The concept is inspired by{" "}
          <a
            href="https://pro.reactbits.dev/docs/components/liquid-ascii"
            target="_blank"
            rel="noopener noreferrer"
            className="link-hover"
          >
            React Bits&apos; Liquid ASCII
          </a>
          . My solver, renderer, and interaction code above are written from
          scratch. Go compare them side by side.
        </p>
      </div>

      <h2 className="mt-12 mb-4 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
        Questions
      </h2>
      <div className="rounded-xl border border-zinc-900/10 dark:border-white/10 divide-y divide-zinc-900/5 dark:divide-white/5 overflow-hidden">
        {faqs.map(({ q, a }) => (
          <div key={q} className="px-5 py-4">
            <h3 className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">{q}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-zinc-900/10 dark:border-white/10 pt-6">
        <Link
          href="/components/all"
          className="group inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={14} /> All components
        </Link>
        <Link
          href="/components/docs"
          className="group inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Install guide <ArrowUpRight size={14} className="icon-arrow-hover" />
        </Link>
      </div>
      </div>
    </section>
  )
}
