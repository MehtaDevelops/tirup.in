"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ArrowUpRight, Check, Copy, Maximize2, X } from "lucide-react"
import TextWithBlur from "@/components/text-with-blur"
import ExpressionAvatar from "@/components/expression-avatar"
import { LiquidAsciiDemo } from "@/components/library/liquid-ascii-demo"
import { Playground, DEFAULTS, type PlaygroundConfig, type PlaygroundFont } from "@/components/library/playground"
import { CodeDemo } from "@/components/library/code-demo"
import { copyText } from "@/lib/utils"
import { SITE, installCommand } from "@/lib/components-site"

const PROPS = [
  { name: "speed", type: "number", defaultValue: "1", description: "Simulation timestep multiplier (0.1–3)." },
  { name: "cellSize", type: "number", defaultValue: "10", description: "Character cell size in pixels (6–30). Drives sim + render together." },
  { name: "gravity", type: "number", defaultValue: "-25", description: "Gravity strength, negative = downward (−50–0)." },
  { name: "fillHeight", type: "number", defaultValue: "0.5", description: "Fill fraction of the tank (0–1)." },
  { name: "cursorRadius", type: "number", defaultValue: "0.25", description: "Mouse influence as a fraction of the short side (0–0.5)." },
  { name: "cursorForce", type: "number", defaultValue: "66", description: "Strength of the cursor push force (0–200)." },
  { name: "autoWave", type: "boolean", defaultValue: "true", description: "Gentle idle waves when untouched. Motion is input-driven otherwise." },
  { name: "className", type: "string", defaultValue: '""', description: "Additional classes for the canvas element." },
  { name: "fontFamily", type: "string", defaultValue: "site mono", description: "CSS font-family for the glyphs. Any face your app loads or the system has, mono or not. Defaults to the host page's mono." },
]

const STAGES = [
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
    "Motion flows back to the particles as a 28/72 blend: a little of the smooth face velocity (stable, mushy) and a lot of the FLIP delta versus the snapshot (lively, detailed), sampled from interior faces only so the strict-zero wall faces steady the solve without ever damping a particle. Speeds clamp at 1150, particles advect, walls stop only the head-on component while sideways slide survives with light friction, with a 0.35-cell gap so liquid reaches the edges. Overfull cells get hash-jittered apart and up to 200 lost particles reseed per frame.",
  ],
  [
    "Touch",
    "Your cursor is a spoon, not a magnet. Pointer velocity is smoothed and a 3×3 neighbourhood is checked first. Moving through empty air does nothing; only contact pushes, with strength falling off quadratically inside your cursor radius and at most one impulse per frame no matter how fast the pointer fires, so a gaming mouse, a touch screen and a laptop trackpad all push with the same energy. Vertical drags carry extra weight, because gravity is already fighting every upward push, so bottom-to-top strokes used to feel dead next to sideways slaps. Leave it alone for 2 seconds and a slow wandering column nudges the surface so the showcase stays breathing.",
  ],
  [
    "Ink",
    "Each column's surface is the first row with real particle presence. Surface cells get the heaviest glyphs, fast spray above the surface gets mid-weight marks, and depth below fades through noise-weighted characters, with deliberately low cutoffs so hard stirring spreads the liquid instead of thinning it into nothing. Ink pulls from a pre-baked glyph atlas: every character at every quantized alpha held on one offscreen sheet, so a frame is a flat run of sprite blits with no font shaping and no string garbage. The theme rebuilds the sheet the instant your dark class flips. fontFamily swaps the face; past ~6,000 cells the renderer raises the cell size itself, so fullscreen costs what a card costs.",
  ],
]

const METRICS: Record<string, string> = {
  particles: "20,000 max",
  solverPasses: "30 / frame",
  perCell: "4",
  dependencies: "0",
}

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
        autoWave={${c.autoWave}}${c.fontFamily ? `\n        fontFamily={${JSON.stringify(c.fontFamily)}}` : ""}
      />
    </div>
  )
}`
}

function aiSummary(c: PlaygroundConfig) {
  return `# Liquid Ascii (${SITE.name})\n\nFluid simulation rendered as ASCII characters. Self-owned single-file React component I built from scratch, zero dependencies. Inspired by React Bits' Liquid ASCII (https://pro.reactbits.dev/docs/components/liquid-ascii).\n\n## Install\n\n\`\`\`bash\n${installCommand("liquid-ascii")}\n\`\`\`\n\n## Usage\n\n\`\`\`tsx\n${usageSnippet(c)}\n\`\`\`\n\n## Props\n\n${PROPS.map((p) => `- \`${p.name}\` (${p.type}, default \`${p.defaultValue}\`): ${p.description}`).join("\n")}\n\n## Notes\n\n- Touch-only cursor: moving through air does nothing; force applies on fluid contact.\n- Theme-aware (reads the \`dark\` class), respects prefers-reduced-motion, sleeps when settled.\n- Desktop-first; gate mounting behind a pointer/media check on mobile.\n`
}

/* Detail block: the numbered corridor from the project detail pages.
   Prose flows through the standard 3-column split; wide content (code
   blocks, tables) needs the full width of the article box, so `wide` puts
   the index + title label on its own row with the content below, same
   borders and rhythm. */
function DetailBlock({
  index,
  title,
  children,
  delay = 0,
  wide = false,
}: {
  index: string
  title: string
  children: React.ReactNode
  delay?: number
  wide?: boolean
}) {
  const label = (
    <div className="flex items-baseline gap-2">
      <span className="font-mono tabular-nums text-xs text-black/45 dark:text-white/45 select-none">{index}</span>
      <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45">{title}</h2>
    </div>
  )
  return (
    <TextWithBlur delay={delay}>
      <div className="border-t border-black/10 dark:border-white/10 py-10 md:py-12">
        {wide ? (
          <>
            {label}
            <div className="mt-6 min-w-0">{children}</div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="col-span-1 flex items-baseline gap-2 min-w-0">{label}</div>
            <div className="col-span-1 md:col-span-2 min-w-0">{children}</div>
          </div>
        )}
      </div>
    </TextWithBlur>
  )
}

export function LiquidAsciiDoc({
  faqs,
  fonts,
}: {
  faqs: Array<{ q: string; a: string }>
  fonts: PlaygroundFont[]
}) {
  const [cfg, setCfg] = useState<PlaygroundConfig>(DEFAULTS)
  const [aiCopied, setAiCopied] = useState(false)
  const [full, setFull] = useState(false)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  let blockIndex = 0
  const next = () => String(++blockIndex).padStart(2, "0")

  const closeFull = () => {
    setFull(false)
    try {
      const doc = document as Document & { webkitFullscreenElement?: Element }
      if (document.fullscreenElement ?? doc.webkitFullscreenElement) {
        void document.exitFullscreen().catch(() => {})
      }
    } catch {
      /* overlay alone still fills the viewport */
    }
  }

  useEffect(() => {
    if (!full) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFull()
    }
    // Native fullscreen: the browser consumes Esc and fires this event
    // instead, so leaving fullscreen must dismiss the overlay too.
    const onFsChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element }
      if (!(document.fullscreenElement ?? doc.webkitFullscreenElement)) setFull(false)
    }
    window.addEventListener("keydown", onKey)
    document.addEventListener("fullscreenchange", onFsChange)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("fullscreenchange", onFsChange)
    }
  }, [full])

  const copyForAI = async () => {
    await copyText(aiSummary(cfg))
    setAiCopied(true)
    window.setTimeout(() => setAiCopied(false), 1600)
  }

  return (
    <main className="relative min-h-screen">
      <div className="section px-6 md:px-20 pt-10 md:pt-28 pb-20 max-w-4xl mx-auto w-full">

        {/* Breadcrumb: same as project detail pages */}
        <TextWithBlur>
          <div className="flex items-center gap-2 text-xs md:text-sm text-black/45 dark:text-white/45 mb-10 select-none flex-wrap">
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
            <span className="truncate max-w-[200px] sm:max-w-xs font-light text-black/45 dark:text-white/45">Liquid Ascii</span>
          </div>
        </TextWithBlur>

        {/* Label + title: same as project detail pages */}
        <TextWithBlur delay={50}>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-4">
            Component
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white mb-6">
            Liquid Ascii
          </h1>
        </TextWithBlur>

        {/* Links row: same treatment as project detail pages */}
        <TextWithBlur delay={80}>
          <div className="flex flex-wrap gap-6 text-sm md:text-base font-light text-black/45 dark:text-white/45 mb-12 border-b border-black/5 dark:border-white/5 pb-4">
            <button
              type="button"
              onClick={copyForAI}
              className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="link-hover pb-0.5">{aiCopied ? "Copied" : "Copy for AI"}</span>
              {aiCopied ? <Check size={12} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={12} className="opacity-40 group-hover:opacity-100" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setFull(true)
                // Real fullscreen where the browser allows it (user gesture),
                // degrading to a viewport overlay where it does not (iOS).
                try {
                  const root = document.documentElement as HTMLElement & {
                    webkitRequestFullscreen?: () => Promise<void> | void
                  }
                  if (typeof root.requestFullscreen === "function") {
                    void root.requestFullscreen().catch(() => {})
                  } else if (typeof root.webkitRequestFullscreen === "function") {
                    root.webkitRequestFullscreen()
                  }
                } catch {
                  /* viewport overlay only */
                }
              }}
              aria-haspopup="dialog"
              aria-expanded={full}
              className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="link-hover pb-0.5">Fullscreen</span>
              <Maximize2 size={12} className="opacity-40 group-hover:opacity-100" />
            </button>
            <Link href="/components/docs" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1">
              <span className="link-hover pb-0.5">Install guide</span>
              <ArrowUpRight size={12} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
            </Link>
          </div>
        </TextWithBlur>

        {/* Description: same as project detail pages */}
        <TextWithBlur delay={100}>
          <div className="space-y-4 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl mb-16">
            <p>
              A real FLIP fluid simulation rendered as ASCII characters. Every
              drop is honest physics rendered in a grid of text, live on this
              page, then one install command in your project. Zero dependencies,
              MIT licensed.
            </p>
          </div>
        </TextWithBlur>

        {/* Fullscreen overlay: portalled to document.body. The site's
            `.section` wrapper carries a transform, which makes any fixed
            descendant position against the content column instead of the
            viewport; a portal is the only way to break out of it. */}
        {full &&
          createPortal(
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
                  fontFamily={cfg.fontFamily || undefined}
                />
              </div>
              <p className="pointer-events-none absolute top-5 left-5 rounded-full bg-black/70 dark:bg-black/60 text-white/90 backdrop-blur px-4 py-1.5 text-xs font-mono">
                drag through the fluid (esc to exit)
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={closeFull}
                aria-label="Exit fullscreen demo"
                className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 transition-all"
              >
                <X size={16} />
              </button>
            </div>,
            document.body
          )}

        {/* Live playground */}
        <TextWithBlur delay={120}>
          <div className="mb-6">
            <Playground onConfig={setCfg} fonts={fonts} />
            <p className="mt-3 text-xs font-light text-black/40 dark:text-white/40">
              Every number you set here flows straight into the install snippet
              below.
            </p>
          </div>
        </TextWithBlur>

        {/* Numbered sections: same corridor system as project detail pages */}
        <div className="flex flex-col">

          <DetailBlock index={next()} title="Install" wide>
            <CodeDemo
              blocks={[
                { lang: "bash", code: installCommand("liquid-ascii") },
                { lang: "tsx", code: usageSnippet(cfg) },
              ]}
            />
            <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">
              The snippet follows your playground settings live. Read more in
              the{" "}
              <Link href="/components/docs" className="link-hover hover:text-accent transition-colors">
                install guide
              </Link>
              .
            </p>
          </DetailBlock>

          <DetailBlock index={next()} title="Props" wide>
            <div className="blog-content">
              <table>
                <thead>
                  <tr>
                    <th>Prop</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {PROPS.map((p) => (
                    <tr key={p.name}>
                      <td><code>{p.name}</code></td>
                      <td><code>{p.type}</code></td>
                      <td><code>{p.defaultValue}</code></td>
                      <td>{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailBlock>

          {STAGES.map(([title, body], i) => (
            <DetailBlock key={title} index={next()} title={title} delay={i * 40}>
              <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">
                {body}
              </p>
            </DetailBlock>
          ))}

          <DetailBlock index={next()} title="Metrics">
            <div className="grid grid-cols-2 gap-6 md:gap-8">
              {Object.entries(METRICS).map(([key, value]) => (
                <div key={key}>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-1 select-none">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <p className="font-light text-accent leading-snug text-2xl md:text-3xl font-mono tabular-nums">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </DetailBlock>

          <DetailBlock index={next()} title="Honest limits">
            <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">
              One tank, two dimensions, no obstacles, and cellSize is the whole
              performance budget (6–30px drives sim, particles, and glyphs;
              past ~6,000 cells the renderer raises it automatically so a
              fullscreen wall costs what a card costs). The loop sleeps when
              settled, pauses offscreen and in hidden tabs, draws one still
              frame for reduced-motion users, caps pixel ratio at 2, and
              debounces rebuilds at 120ms. Resizing or changing cell size
              holds exactly 4 particles per cell, adding or randomly thinning
              as needed, so the quantity of liquid never changes in any box,
              at any cell size.
            </p>
          </DetailBlock>

          <DetailBlock index={next()} title="Inspiration credit">
            <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">
              The concept is inspired by{" "}
              <a
                href="https://pro.reactbits.dev/docs/components/liquid-ascii"
                target="_blank"
                rel="noopener noreferrer"
                className="link-hover hover:text-accent transition-colors"
              >
                React Bits&apos; Liquid ASCII
              </a>
              . My solver, renderer, and interaction code are written from
              scratch. Go compare them side by side.
            </p>
          </DetailBlock>

          <DetailBlock index={next()} title="Questions">
            <div className="space-y-6">
              {faqs.map(({ q, a }) => (
                <div key={q}>
                  <h3 className="text-sm font-medium text-black dark:text-white mb-1.5">{q}</h3>
                  <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </DetailBlock>

          {/* End border */}
          <div className="border-t border-black/10 dark:border-white/10" />
        </div>

        {/* Continue reading: same row system as the project "Next" block */}
        <TextWithBlur>
          <div className="pt-16 pb-4">
            <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-8">
              Continue
            </h2>
            <Link
              href="/components"
              className="group block py-5 border-t border-black/10 dark:border-white/10"
            >
              <div className="flex items-baseline gap-4 md:gap-6">
                <span className="font-mono text-xs md:text-sm text-black/45 dark:text-white/45 select-none w-6 shrink-0 group-hover:translate-x-0.5 transition-transform duration-300 ease-out">→</span>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                  <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300">
                    Components
                  </span>
                  <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                  <span className="text-black/50 dark:text-white/50 font-light group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors duration-300 text-sm">
                    browse what&apos;s live
                  </span>
                </div>
              </div>
            </Link>
            <Link
              href="/components/docs"
              className="group block py-5 border-t border-black/10 dark:border-white/10"
            >
              <div className="flex items-baseline gap-4 md:gap-6">
                <span className="font-mono text-xs md:text-sm text-black/45 dark:text-white/45 select-none w-6 shrink-0 group-hover:translate-x-0.5 transition-transform duration-300 ease-out">→</span>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                  <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300">
                    Install guide
                  </span>
                  <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                  <span className="text-black/50 dark:text-white/50 font-light group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors duration-300 text-sm">
                    registry setup, theming, mobile
                  </span>
                </div>
              </div>
            </Link>
            <div className="border-t border-black/10 dark:border-white/10" />
          </div>
        </TextWithBlur>

        {/* Footer: same as project detail pages */}
        <footer className="py-4 text-center border-t border-black/10 dark:border-white/10 mt-4">
          <p className="text-xs md:text-sm text-black/40 dark:text-white/40">© {new Date().getFullYear()} Tirup Mehta. All rights reserved.</p>
        </footer>

      </div>
    </main>
  )
}
