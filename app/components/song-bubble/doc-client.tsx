"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowUpRight, Check, Copy, Play } from "lucide-react"
import TextWithBlur from "@/components/text-with-blur"
import ExpressionAvatar from "@/components/expression-avatar"
import { CodeDemo } from "@/components/library/code-demo"
import SongBubble, {
  toggleSongBubble,
  useSongBubbleOpen,
} from "@/components/library/song-bubble"
import { copyText } from "@/lib/utils"
import { SITE, installCommand } from "@/lib/components-site"

const PROPS = [
  { name: "defaultVideoUrl", type: "string", defaultValue: "undefined", description: "A song to load automatically the first time the card opens in a session — perfect for demo pages; leave it off for a quiet open." },
  { name: "defaultThumbnail", type: "string", defaultValue: "undefined", description: "Cover art for the closed orb. Without it the orb draws a built-in vinyl disc." },
  { name: "accent", type: "string", defaultValue: '"#1ed760"', description: "Accent color for the play button, wave bars, and focus rings. Green by default; pass any brand tone." },
  { name: "positionKey", type: "string", defaultValue: '"song-bubble-pos"', description: "localStorage key for the parked position — use a unique key if you mount several." },
  { name: "zIndex", type: "number", defaultValue: "9999", description: "Stacking of the floating root." },
]

const STAGES = [
  [
    "Orb",
    "Closed, the component is a 56px cover orb docked bottom-left (bottom-center on small screens) with a live pulse ring while audio plays. Click — or focus it and press Enter — and one frame at orb size is enough for the CSS spring to carry it into the 260px card, so the expansion always morphs instead of popping.",
  ],
  [
    "Park",
    "Grab any quiet part of the card — the art, the title, blank space — and drag; buttons, inputs and sliders keep their own behavior. The card morphs between two sizes, so the clamp is checked against the larger size at every viewport: a spot that is legal for the orb cannot overflow once the card expands. On release the parked position lands in localStorage and survives reloads; closing fully resets the deck while the parking spot is the one thing that stays.",
  ],
  [
    "Engine",
    "Audio is a hidden YouTube embed driven through the iframe postMessage API. Commands are buffered until the widget greets us — some embed boots crash silently if hammered before their api object attaches — then flushed in order, with a short 'listening' handshake poll for boots that only start broadcasting once addressed. A pasted link resolves through YouTube's oEmbed endpoint for the title, artist and artwork, and every seek / volume / state change is a one-line postMessage.",
  ],
  [
    "Skin",
    "Every color reads your site's own theme tokens first (--bg, --fg, --border-color, --text-muted, --text-secondary) and falls back to the Spotify-dark values when a token doesn't exist, so the card looks at home in dark mode, light mode, and custom-tinted sites without a single prop. The accent is one CSS variable: pass an accent prop and the play button, wave bars, orb pulse and focus rings all follow.",
  ],
]

const METRICS: Record<string, string> = {
  files: "1",
  dependencies: "0",
  engine: "YouTube postMessage",
  persistence: "localStorage",
}

function usageSnippet() {
  return `import { SongBubble, toggleSongBubble } from "@/components/song-bubble"

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        {/* Mount once: it survives client-side navigation, so the song keeps
            playing while visitors move between pages */}
        <SongBubble />
      </body>
    </html>
  )
}

// Anything in your app can open it — a footer dot, a nav button, an easter egg
export function HeroDot() {
  return (
    <button
      type="button"
      onClick={toggleSongBubble}
      aria-label="Open the song bubble"
    >
      ♪
    </button>
  )
}`
}

function aiSummary() {
  return `# Song Bubble (${SITE.name})\n\nFloating Spotify-style mini player: an orb that springs into a draggable song card with a real YouTube engine inside. Single-file React component, zero dependencies. Inspired by Atomix.\n\n## Install\n\n\`\`\`bash\n${installCommand("song-bubble")}\n\`\`\`\n\n## Usage\n\n\`\`\`tsx\n${usageSnippet()}\n\`\`\`\n\n## Props\n\n${PROPS.map((p) => `- \`${p.name}\` (${p.type}, default \`${p.defaultValue}\`): ${p.description}`).join("\n")}\n\n## Notes\n\n- Mount it once in the root layout: client-side navigation never unmounts it, so audio keeps playing across pages.\n- Anything can open/collapse it via the exported store commands (openSongBubble, closeSongBubble, toggleSongBubble).\n- Colors read your site's theme tokens (--bg, --fg, --border-color, --text-muted, --text-secondary) and fall back to the Spotify-dark palette.\n- Escape closes it fully; the parked position survives reloads; outside click collapses to the orb.\n`
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

const DEMO_TRACK = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

export default function SongBubbleDoc({
  faqs,
}: {
  faqs: Array<{ q: string; a: string }>
}) {
  const [aiCopied, setAiCopied] = useState(false)
  const open = useSongBubbleOpen()
  let blockIndex = 0
  const next = () => String(++blockIndex).padStart(2, "0")

  const copyForAI = async () => {
    await copyText(aiSummary())
    setAiCopied(true)
    window.setTimeout(() => setAiCopied(false), 1600)
  }

  return (
    <main className="relative min-h-screen flex flex-col">
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
            <span className="truncate max-w-[200px] sm:max-w-xs font-light text-black/45 dark:text-white/45">Song Bubble</span>
          </div>
        </TextWithBlur>

        {/* Label + title: same as project detail pages */}
        <TextWithBlur delay={50}>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-4">
            Component
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white mb-6">
            Song Bubble
          </h1>
        </TextWithBlur>

        {/* Links row: same treatment as project detail pages */}
        <TextWithBlur delay={80}>
          <div className="flex flex-wrap gap-6 text-sm md:text-base font-light text-black/45 dark:text-white/45 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
            <button
              type="button"
              onClick={copyForAI}
              className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="link-hover pb-0.5">{aiCopied ? "Copied" : "Copy for AI"}</span>
              {aiCopied ? <Check size={12} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={12} className="opacity-40 group-hover:opacity-100" />}
            </button>
            <Link href="/components/docs" className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1">
              <span className="link-hover pb-0.5">Install guide</span>
              <ArrowUpRight size={12} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
            </Link>
          </div>
        </TextWithBlur>

        {/* Description: same as project detail pages */}
        <TextWithBlur delay={100}>
          <div className="space-y-4 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl mb-6">
            <p>
              A floating Spotify-style mini player: a small cover orb that
              springs into a draggable song card, streaming through a real
              YouTube engine inside it. Open it from anywhere in your app with
              one exported command, mount it once, and it never unmounts. Here
              on this page, live, then one install command. Zero dependencies,
              MIT licensed.
            </p>
          </div>
        </TextWithBlur>

        {/* Live demo: the real component, mounted here */}
        <TextWithBlur delay={120}>
          <div>
            <button
              type="button"
              onClick={toggleSongBubble}
              className="group inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 px-5 py-2.5 text-sm font-medium text-black dark:text-white hover:border-emerald-500/40 dark:hover:border-emerald-400/40 transition-colors cursor-pointer"
            >
              <Play size={13} className="text-emerald-500 dark:text-emerald-400" />
              {open ? "Close the song bubble (esc)" : "Open the song bubble"}
            </button>
            <p className="mt-3 text-xs font-light text-black/40 dark:text-white/40">
              The card opens docked bottom-left. Drag it anywhere — it parks
              and remembers the spot while you browse.
            </p>
            <div className="mt-3 -mx-1">
              <SongBubble defaultVideoUrl={DEMO_TRACK} accent="#1ed760" />
            </div>
          </div>
        </TextWithBlur>

        {/* Numbered sections: same corridor system as project detail pages */}
        <div className="flex flex-col">

          <DetailBlock index={next()} title="Install" wide>
            <CodeDemo
              blocks={[
                { lang: "bash", code: installCommand("song-bubble") },
                { lang: "tsx", code: usageSnippet() },
              ]}
            />
            <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">
              The player lives in your root layout so navigation can&apos;t kill
              it. Read more in the{" "}
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
              One song at a time; the embedded engine is YouTube (and obeys
              their embed rules, ads included). Closing the card forgets the
              song on purpose — the eraser is the point of an easter egg —
              though a parked position survives. The card is a fixed overlay,
              so it belongs on site chrome, not inside scrollable app panes;
              give it a single mount, not per-page anchors.
            </p>
          </DetailBlock>

          <DetailBlock index={next()} title="Inspiration credit">
            <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">
              Inspired by Atomix, the floating mini player concept. The card,
              the drag engine, and the YouTube wiring here are from scratch.
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
          </div>
        </TextWithBlur>

      </div>

      <footer className="py-4 px-6 text-center border-t border-black/10 dark:border-white/10 mt-auto">
        <p className="text-xs md:text-sm text-black/40 dark:text-white/40">© {new Date().getFullYear()} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
