/**
 * Shared light/dark preference between tirup.in and blogs.tirup.in.
 *
 * The two sites are separate origins, so localStorage never crosses between
 * them. A cookie scoped to `.tirup.in` does, which is what makes the reader's
 * choice on one surface already active on the other. localStorage stays as the
 * per-origin mirror that the rest of the app (and the tint engine) reads.
 *
 * The pre-paint read lives in the inline theme script in each `app/layout.tsx`,
 * because it has to run before the first paint. This module owns the write side
 * and the fallback read used when that script never runs (client-rendered 404s).
 *
 * Keep this file identical in both repositories: it is one contract, not two
 * implementations.
 */

export const THEME_COOKIE = "tirup-theme"

export type ThemeMode = "light" | "dark"

/** One year, the longest max-age browsers reliably honour. */
const MAX_AGE = 60 * 60 * 24 * 365

/**
 * Parent-domain scope so the sibling surface can read the same value.
 * Localhost and preview hosts fall back to a host-only cookie, which is still
 * shared across ports (localhost:3000 and localhost:3001 agree). Secure is
 * added only on https, because a Secure cookie set over http is rejected.
 */
function cookieAttributes(): string {
  const host = window.location.hostname
  const domain = host === "tirup.in" || host.endsWith(".tirup.in") ? "; Domain=.tirup.in" : ""
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  return `${domain}${secure}`
}

/** Persist the choice for this origin and for the sibling surface. */
export function persistTheme(mode: ThemeMode) {
  try {
    localStorage.setItem("theme", mode)
  } catch {
    /* storage blocked: the cookie below still carries the preference */
  }
  try {
    document.cookie = `${THEME_COOKIE}=${mode}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${cookieAttributes()}`
  } catch {
    /* cookies blocked: this origin keeps working from localStorage */
  }
}

/**
 * Resolve the active mode with the same order of truth as the inline pre-paint
 * script: cookie (shared across both surfaces) -> localStorage (this origin) ->
 * system preference.
 */
export function resolveTheme(): ThemeMode {
  try {
    const match = document.cookie.match(/(?:^|;\s*)tirup-theme=(dark|light)(?:;|$)/)
    if (match) return match[1] as ThemeMode
  } catch {
    /* cookies blocked: fall through to localStorage */
  }
  try {
    const stored = localStorage.getItem("theme")
    if (stored === "dark" || stored === "light") return stored
  } catch {
    /* storage blocked: fall through to the system preference */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/** Apply a mode to <html> without persisting anything. */
export function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark")
}
