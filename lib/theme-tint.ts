"use client"

/**
 * theme-tint — red-dot easter egg.
 *
 * One user-chosen color re-themes the whole site. Every call paints the full
 * palette as custom properties on <html> (`--user` + derived tokens), each a
 * continuous function of the pick — no thresholds, no mode flips, so drags
 * morph smoothly and releasing changes nothing. Near-white/black picks ease
 * into complete readable themes via an extremeness blend. The light/dark
 * class is never touched. app/globals.css holds equivalent color-mix rules
 * as a pre-hydration fallback only.
 */

export const TINT_STORAGE_KEY = "tirup-tint"

/** Relative luminance 0–1. White ≈ 1, black ≈ 0, pure red ≈ 0.21. */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

type Rgba = { r: number; g: number; b: number; a: number }
const rgba = (r: number, g: number, b: number, a = 1): Rgba => ({ r, g, b, a })

/** Premultiplied sRGB lerp — matches `color-mix(in srgb, …)` exactly. */
function mixRgba(c1: Rgba, c2: Rgba, w: number): Rgba {
  const a = w * c1.a + (1 - w) * c2.a
  if (a < 1e-6) return rgba(0, 0, 0, 0)
  const m = (x1: number, a1: number, x2: number, a2: number) =>
    (w * x1 * a1 + (1 - w) * x2 * a2) / a
  return { r: m(c1.r, c1.a, c2.r, c2.a), g: m(c1.g, c1.a, c2.g, c2.a), b: m(c1.b, c1.a, c2.b, c2.a), a }
}

const cssRgba = (c: Rgba) =>
  `rgb(${Math.round(c.r)} ${Math.round(c.g)} ${Math.round(c.b)} / ${Math.round(c.a * 1000) / 1000})`

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Proper WCAG relative luminance of a mixed color (gamma-linearized). */
const lin = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const relLum = (c: Rgba) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)

/** Every custom property the tint engine owns. */
const TINT_VARS = [
  "accent",
  "tldr-accent",
  "bg",
  "fg",
  "card",
  "surface",
  "surface-deep",
  "surface-hover",
  "border-color",
  "text-muted",
  "text-secondary",
  "text-primary",
] as const

type TintPalette = Record<(typeof TINT_VARS)[number], Rgba>

const PAPER = rgba(253, 253, 252)
const NIGHT = rgba(10, 10, 11)
const WHITE = rgba(255, 255, 255)
const INKDARK = rgba(17, 17, 17)
const SNOW = rgba(250, 250, 250)

/** The everyday derivation — mirrors the pre-hydration CSS exactly. */
function normalTokens(u: Rgba, isDark: boolean, y: number): TintPalette {
  if (!isDark) {
    // Light ground: a clear wash of the pick (full strength only for
    // near-black picks). Text polarity follows the background's own
    // luminance, so contrast is automatic in both directions — no flips,
    // no jumps, just a continuous morph while dragging.
    //
    // Convention used below: mixRgba(LIGHT, DARK, white_) so white_=0 gives
    // light surfaces and white_=1 gives dark ones.
    // Lighter wash (full strength only for near-black picks): clearly the
    // hue, never a heavy flood.
    const bg = mixRgba(u, PAPER, 0.45 + 0.55 * (1 - smooth(0, 0.12, y)))
    const white_ = 1 - smooth(0.1, 0.18, relLum(bg))
    // Body copy in a strong version of the pick: saturated enough to read as
    // the hue itself, dark enough for contrast. Near-black picks blend over
    // to the light extreme via e, so this never strands dark-on-dark.
    const deep = mixRgba(u, rgba(0, 0, 0, 1), 0.35)
    const tx = (a: number) => ({ ...deep, a })
    const hair = mixRgba(WHITE, INKDARK, white_)
    // Accent a step lighter than body copy so links pop; deepens toward
    // black on light grounds, lifts toward light gray for near-black picks.
    const base = mixRgba(u, rgba(0, 0, 0, 1), 0.55 - 0.25 * smooth(0.6, 0.95, y))
    const accent = mixRgba(base, rgba(204, 204, 204, 1), 1 - smooth(0.02, 0.15, y))
    return {
      accent,
      "tldr-accent": accent,
      bg,
      fg: deep,
      card: mixRgba(rgba(23, 23, 26, 1), mixRgba(u, PAPER, 0.3), white_),
      surface: mixRgba(rgba(25, 25, 28, 1), rgba(244, 244, 245, 1), white_),
      "surface-deep": mixRgba(rgba(11, 11, 13, 1), rgba(236, 236, 238, 1), white_),
      "surface-hover": mixRgba(rgba(32, 32, 36, 1), rgba(247, 247, 248, 1), white_),
      "border-color": { ...hair, a: 0.12 },
      "text-muted": tx(0.4),
      "text-secondary": tx(0.65),
      "text-primary": tx(0.88),
    }
  }
  const tx = (a: number) => mixRgba(u, rgba(250, 250, 250, a), 0.2)
  const bg = mixRgba(u, NIGHT, 0.28)
  // Very dark picks would collapse links into the background, so the accent
  // leans harder toward white as user luminance drops to zero.
  const lift = 1 - smooth(0, 0.25, y)
  return {
    accent: mixRgba(u, WHITE, 0.68 - 0.5 * lift),
    "tldr-accent": mixRgba(u, WHITE, 0.62 - 0.45 * lift),
    bg,
    fg: mixRgba(u, SNOW, 0.12),
    card: mixRgba(u, NIGHT, 0.4),
    surface: mixRgba(u, rgba(19, 19, 22), 0.24),
    "surface-deep": mixRgba(u, rgba(6, 6, 7), 0.3),
    "surface-hover": mixRgba(u, rgba(28, 28, 32), 0.22),
    "border-color": mixRgba(u, rgba(255, 255, 255, 0.1), 0.34),
    "text-muted": tx(0.44),
    "text-secondary": tx(0.66),
    "text-primary": tx(0.92),
  }
}

/** Near-complete light theme for very light picks (white reads white). */
/* NOTE on weights: mixRgba(user, target, w) keeps w parts USER — so readable
   dark-on-white tokens need SMALL w (almost all target). */
function extremeLightTokens(u: Rgba): TintPalette {
  const tx = (a: number) => {
    const m = mixRgba(u, rgba(24, 24, 24, 1), 0.3)
    return { ...m, a }
  }
  const dark = rgba(26, 26, 26)
  return {
    accent: mixRgba(u, dark, 0.16),
    "tldr-accent": mixRgba(u, dark, 0.18),
    bg: mixRgba(u, WHITE, 0.55),
    fg: rgba(24, 24, 24),
    card: mixRgba(u, WHITE, 0.8),
    surface: mixRgba(u, rgba(241, 241, 242), 0.5),
    "surface-deep": mixRgba(u, rgba(228, 228, 229), 0.45),
    "surface-hover": mixRgba(u, rgba(233, 233, 234), 0.5),
    "border-color": mixRgba(u, rgba(0, 0, 0, 0.14), 0.1),
    "text-muted": tx(0.44),
    "text-secondary": tx(0.66),
    "text-primary": tx(0.92),
  }
}

/** Near-complete dark theme for very dark picks (black reads black). */
/* Same weight rule: w is the USER fraction — light readable tokens need
   SMALL w so the light target dominates. */
function extremeDarkTokens(u: Rgba): TintPalette {
  const tx = (a: number) => {
    const m = mixRgba(u, rgba(235, 235, 235, 1), 0.16)
    return { ...m, a }
  }
  const light = rgba(255, 255, 255)
  return {
    accent: mixRgba(u, light, 0.3),
    "tldr-accent": mixRgba(u, light, 0.32),
    bg: mixRgba(u, rgba(0, 0, 0), 0.6),
    fg: rgba(242, 242, 242),
    card: mixRgba(u, rgba(24, 24, 26), 0.5),
    surface: mixRgba(u, rgba(16, 16, 18), 0.5),
    "surface-deep": mixRgba(u, rgba(0, 0, 0), 0.7),
    "surface-hover": mixRgba(u, rgba(24, 24, 26), 0.5),
    "border-color": mixRgba(u, rgba(255, 255, 255, 0.14), 0.15),
    "text-muted": tx(0.44),
    "text-secondary": tx(0.66),
    "text-primary": tx(0.92),
  }
}

/* Eight soft pastels in one row — easy on the eyes full-bleed, one per hue
   family. Muted enough to live with, saturated enough to feel tinted. */
export const TINT_PRESETS = [
  "#fca5a5",
  "#fdba74",
  "#fcd34d",
  "#6ee7b7",
  "#5eead4",
  "#7dd3fc",
  "#a5b4fc",
  "#f9a8d4",
] as const

const HEX_RE = /^#([0-9a-f]{6})$/i

/** Normalize user input to `#rrggbb` lowercase, or null when invalid. */
export function normalizeHex(input: string): string | null {
  let text = input.trim().toLowerCase()
  if (!text.startsWith("#")) text = `#${text}`
  // Expand #rgb → #rrggbb
  const short = /^#([0-9a-f]{3})$/i.exec(text)
  if (short) {
    text = `#${short[1].split("").map((d) => d + d).join("")}`
  }
  return HEX_RE.test(text) ? text.toLowerCase() : null
}

export function getStoredTint(): string | null {
  try {
    const raw = localStorage.getItem(TINT_STORAGE_KEY)
    return raw ? normalizeHex(raw) : null
  } catch {
    return null
  }
}

/**
 * Live paint, safe to call on every drag tick. Derives the full palette from
 * the pick and writes it as custom properties — every token is a continuous
 * function of the color, so there is no line to cross, no mode flip, and
 * releasing the pointer changes nothing visible. Extremes (white/black)
 * resolve to complete readable themes via a smooth extremeness blend.
 * The light/dark class is never touched; Reset restores the stored mode
 * simply by clearing. Passing null clears (see clearTint).
 */
export function applyTint(hex: string | null) {
  const root = document.documentElement
  const next = hex ? normalizeHex(hex) : null
  if (!next) return clearTint()
  const [r, g, b] = hexToRgb(next)
  const u = rgba(r, g, b)
  const isDark = root.classList.contains("dark")
  const y = luminance(next)
  // 0 for ordinary colors, easing to 1 at the extremes. Bands are narrow
  // and hug the poles, so mid-tones never sit in a muddy halfway blend.
  // C1-continuous, so dragging through it morphs instead of snapping.
  const e = isDark ? smooth(0.7, 0.95, y) : 1 - smooth(0.02, 0.1, y)
  const normal = normalTokens(u, isDark, y)
  const extreme = isDark ? extremeLightTokens(u) : extremeDarkTokens(u)
  for (const key of TINT_VARS) {
    root.style.setProperty(`--${key}`, cssRgba(mixRgba(extreme[key], normal[key], e)))
  }
  root.style.setProperty("--user", next)
  root.setAttribute("data-tint", next)
  try {
    localStorage.setItem(TINT_STORAGE_KEY, next)
  } catch {
    /* storage unavailable — theming still works for this session */
  }
  return next
}

/** Clear back to the default theme. The stored mode was never touched. */
export function clearTint() {
  const root = document.documentElement
  root.removeAttribute("data-tint")
  for (const key of [...TINT_VARS, "user"] as const) root.style.removeProperty(`--${key}`)
  try {
    localStorage.removeItem(TINT_STORAGE_KEY)
  } catch {
    /* storage unavailable — theming still works for this session */
  }
  return null
}

/* ---- minimal hex ↔ hsv for the custom picker (no dependency) ---- */

export interface Hsva {
  h: number
  s: number
  v: number
  a: number
}

export function hexToHsv(hex: string): Hsva {
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16) / 255
  const r = n(1)
  const g = n(3)
  const b = n(5)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d > 1e-6) {
    if (max === r) h = 60 * (((g - b) / d) % 6)
    else if (max === g) h = 60 * ((b - r) / d + 2)
    else h = 60 * ((r - g) / d + 4)
    if (h < 0) h += 360
  }
  return { h, s: max === 0 ? 0 : d / max, v: max, a: 1 }
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function hsvToHex({ h, s, v }: Hsva): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  const byte = (c: number) =>
    Math.round(clamp01(c) * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${byte(f(5))}${byte(f(3))}${byte(f(1))}`
}

/** Split `#rrggbb` into `[r, g, b]` 0–255 for canvas / rgba use. */
export function hexToRgb(hex: string): [number, number, number] {
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16)
  return [n(1), n(3), n(5)]
}
