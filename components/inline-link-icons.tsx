import type { ReactNode } from "react"

/**
 * Small line icons for inline links. Drawn here as plain SVG so there is no
 * icon font, CDN or library behind them. They use currentColor, so they follow
 * the link's colour and hover state.
 */
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
}

export const InlineIcons = {
  /** Isometric cube: a registry of models. */
  cube: (
    <svg {...base}>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" pathLength={1} className="ai-draw" />
      <path d="M4 7.5 12 12l8-4.5M12 12v9" pathLength={1} className="ai-draw ai-draw-late" />
    </svg>
  ),
  /** Sound bars: dictation. */
  wave: (
    <svg {...base}>
      <path d="M4 10v4" className="ai-part ai-bar ai-bar-1" />
      <path d="M8 7v10" className="ai-part ai-bar ai-bar-2" />
      <path d="M12 4v16" className="ai-part ai-bar ai-bar-3" />
      <path d="M16 8v8" className="ai-part ai-bar ai-bar-4" />
      <path d="M20 11v2" className="ai-part ai-bar ai-bar-5" />
    </svg>
  ),
  /** Code brackets: the engineering blog. */
  code: (
    <svg {...base}>
      <path d="m8 7-5 5 5 5" className="ai-part ai-code-l" />
      <path d="m16 7 5 5-5 5" className="ai-part ai-code-r" />
      <path d="M14 4l-4 16" pathLength={1} className="ai-draw" />
    </svg>
  ),
  /** Branch: source code. */
  branch: (
    <svg {...base}>
      <circle cx="6" cy="5" r="2.2" />
      <circle cx="6" cy="19" r="2.2" />
      <circle cx="18" cy="8" r="2.2" className="ai-part ai-branch-dot" />
      <path d="M6 7.2v9.6" pathLength={1} className="ai-draw" />
      <path d="M18 10.2c0 4-3 5.4-8.6 6" pathLength={1} className="ai-draw ai-draw-late" />
    </svg>
  ),
  /** Envelope: get in touch. */
  mail: (
    <svg {...base}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m3.5 7.5 8.5 6 8.5-6" className="ai-part ai-flap" />
    </svg>
  ),
  /** Thin stem with a solid head: the arrow used on the Connect links. */
  arrow: (
    <svg {...base}>
      <path d="M6.5 17.5 15 9" />
      <path d="M9 6.5h8.5V15z" fill="currentColor" />
    </svg>
  ),
} satisfies Record<string, ReactNode>

export type InlineIconName = keyof typeof InlineIcons

interface InlineIconLinkProps {
  href: string
  icon: InlineIconName
  /** Link text. The icon sits before it and never wraps away from the first word. */
  children: string
  external?: boolean
}

const linkClass =
  "group underline decoration-black/25 dark:decoration-white/25 underline-offset-4 hover:decoration-accent hover:text-accent transition-colors"

/** An inline text link with an icon before it. */
export function InlineIconLink({ href, icon, children, external }: InlineIconLinkProps) {
  const [first, ...rest] = children.split(" ")
  return (
    <a
      href={href}
      className={linkClass}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className="whitespace-nowrap">
        <span className="ml-[0.1em] mr-[0.18em] inline-block h-[0.85em] w-[0.85em] align-[-0.08em] opacity-55 transition-opacity group-hover:opacity-100 [&>svg]:block [&>svg]:h-full [&>svg]:w-full">
          {InlineIcons[icon]}
        </span>
        {first}
      </span>
      {rest.length ? ` ${rest.join(" ")}` : null}
    </a>
  )
}

/** The Connect-list marker. Follows the link colour; nudges up-right on hover. */
export function LinkIcon({ name, size = 13, className = "" }: { name: InlineIconName; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 opacity-60 transition-[opacity,transform] duration-200 group-hover:-translate-y-px group-hover:translate-x-px group-hover:opacity-100 [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`}
      style={{ width: size, height: size }}
    >
      {InlineIcons[name]}
    </span>
  )
}
