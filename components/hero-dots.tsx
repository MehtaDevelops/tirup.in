"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { createPortal } from "react-dom"
import TextWithBlur from "@/components/text-with-blur"
import ThemeTintPicker from "@/components/theme-tint-picker"
import { applyTint, clearTint, getStoredTint } from "@/lib/theme-tint"
import {
  closeSongBubble,
  toggleSongBubble,
  useSongBubbleOpen,
} from "@/lib/song-bubble-store"

const LiquidAscii = dynamic(() => import("@/components/liquid-ascii"), {
  ssr: false,
  loading: () => null,
})

const RED_DOT_DEFAULT = "#ff6b6b"
const YELLOW_DOT_DEFAULT = "#feca57"
const GREEN_DOT_DEFAULT = "#1dd1a1"
const PANEL_GAP = 12
const VIEWPORT_MARGIN = 8
// Hover intent: long enough that sweeping the cursor past a 10px dot does not
// fire a card, short enough that a deliberate hover feels immediate.
const HINT_DELAY = 130

type HintId = "tint" | "music" | "ascii"

const HINTS: Record<HintId, { kicker: string; body: string; color: string }> = {
  tint: { kicker: "Theme colour", body: "Repaint the whole site.", color: RED_DOT_DEFAULT },
  music: { kicker: "Hidden track", body: "There is a song in the notch.", color: YELLOW_DOT_DEFAULT },
  ascii: { kicker: "Liquid ASCII", body: "Drag to stir the ink.", color: GREEN_DOT_DEFAULT },
}

/**
 * The card that replaces the browser's native `title` tooltip.
 *
 * Anchored to the dot's left edge and growing rightwards, so the first dot in
 * the row can never clip against the viewport. Mounted permanently and driven
 * by opacity/transform: enter and exit both animate, and nothing is laid out
 * mid-hover. `pointer-events-none` keeps it from stealing the hover that
 * opened it.
 */
function DotHint({ hint, visible }: { hint: HintId; visible: boolean }) {
  const { kicker, body, color } = HINTS[hint]

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-full left-0 z-30 mb-3 -translate-x-3 origin-bottom-left transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-1.5 scale-[0.97] opacity-0"
      }`}
    >
      <div className="dot-hint-card relative flex items-center gap-2 whitespace-nowrap rounded-lg border px-2.5 py-1.5 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-medium leading-none">{kicker}</span>
        <span className="dot-hint-body text-[11px] font-light leading-none">{body}</span>
      </div>
      {/* Caret: rotated square showing only the two outward edges. */}
      <span
        aria-hidden="true"
        className="dot-hint-caret absolute -bottom-[3.5px] left-[13px] h-[7px] w-[7px] rotate-45 border-b border-r"
      />
    </div>
  )
}

/**
 * HeroDots: dots row + three easter eggs.
 * Red dot: site-wide theme color picker. The pick re-tints the whole
 * website (light surfaces + darker dark-mode surfaces, derived in CSS),
 * persists in localStorage, and applies on every page.
 * Yellow dot: Spotify-style floating bubble song player. Paste a YouTube
 * link and the hidden embed streams the audio; the gooey bubble morph is
 * pure CSS, no new deps.
 * Green dot: interactive fluid ASCII, tuned for touch and desktop input.
 *
 * The picker portals to body with viewport-clamped fixed positioning:
 * it flips above/below the dot based on available space, so it never
 * clips off-screen on short viewports or mobile.
 *
 * Hovering a dot shows a short card with that egg's own line instead of the
 * browser's `title` tooltip. Desktop only, hover-intent delayed so a cursor
 * sweeping past a 10px dot never flashes it, and suppressed while its own
 * panel is open.
 */
export default function HeroDots() {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  const [hint, setHint] = useState<HintId | null>(null)
  const hintTimerRef = useRef<number | null>(null)

  const [tintOpen, setTintOpen] = useState(false)
  const [tint, setTint] = useState<string | null>(null)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null)
  const [measured, setMeasured] = useState(false)
  const tintAnchorRef = useRef<HTMLDivElement>(null)
  const tintTriggerRef = useRef<HTMLButtonElement>(null)
  const tintPanelRef = useRef<HTMLDivElement>(null)

  // The song bubble is rendered once from the root layout, so it survives
  // page navigation (music keeps playing between routes); this dot only
  // toggles the store.
  const musicOpen = useSongBubbleOpen()

  // Re-apply the persisted tint (pre-paint script in layout already did the
  // DOM part: this just syncs the dot's state with it).
  useEffect(() => {
    setTint(applyTint(getStoredTint()))
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const sync = () => {
      setIsMobile(mq.matches)
      if (mq.matches) setOpen(false)
    }
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // Hints are a desktop courtesy, not a mobile one: touch has no hover, and a
  // sticky hover after a tap would land on top of the bubble or canvas.
  const hoverCapableRef = useRef(false)
  useEffect(() => {
    hoverCapableRef.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches
  }, [])

  const clearHintTimer = useCallback(() => {
    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current)
      hintTimerRef.current = null
    }
  }, [])

  const showHint = useCallback(
    (id: HintId) => {
      if (isMobile || !hoverCapableRef.current) return
      clearHintTimer()
      hintTimerRef.current = window.setTimeout(() => {
        hintTimerRef.current = null
        setHint(id)
      }, HINT_DELAY)
    },
    [clearHintTimer, isMobile]
  )

  const hideHint = useCallback(() => {
    clearHintTimer()
    setHint(null)
  }, [clearHintTimer])

  useEffect(() => clearHintTimer, [clearHintTimer])

  const toggle = useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches) return
    hideHint()
    setOpen((v) => !v)
    closeSongBubble()
  }, [hideHint])

  // Yellow dot: one easter egg at a time, so the ASCII canvas / tint panel
  // never sits on top of the notch.
  const toggleMusic = useCallback(() => {
    hideHint()
    toggleSongBubble()
    setOpen(false)
    setTintOpen(false)
    setPanelPos(null)
    setMeasured(false)
  }, [hideHint])

  const closePicker = useCallback((returnFocus: boolean) => {
    setTintOpen(false)
    setPanelPos(null)
    setMeasured(false)
    if (returnFocus) tintTriggerRef.current?.focus({ preventScroll: true })
  }, [])

  // Clamp the floating panel inside the viewport: centered on the dot,
  // above it when there is room, otherwise below it.
  const positionPanel = useCallback(() => {
    const anchor = tintAnchorRef.current
    if (!anchor) return
    const dot = anchor.getBoundingClientRect()
    const panel = tintPanelRef.current
    const w = panel?.offsetWidth || 248
    const h = panel?.offsetHeight || 420
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, dot.left + dot.width / 2 - w / 2),
      Math.max(VIEWPORT_MARGIN, window.innerWidth - w - VIEWPORT_MARGIN)
    )
    const above = dot.top - h - PANEL_GAP
    const top =
      dot.top >= h + PANEL_GAP + VIEWPORT_MARGIN ? above : dot.bottom + PANEL_GAP
    const nextTop = Math.min(
      Math.max(VIEWPORT_MARGIN, top),
      Math.max(VIEWPORT_MARGIN, window.innerHeight - h - VIEWPORT_MARGIN)
    )
    setPanelPos((prev) =>
      prev && prev.top === nextTop && prev.left === left ? prev : { top: nextTop, left }
    )
    setMeasured(true)
  }, [])

  // Measure before first paint so the panel never flashes in the wrong spot.
  useLayoutEffect(() => {
    if (tintOpen) positionPanel()
  }, [tintOpen, positionPanel])

  // Follow resizes and scrolls while open.
  useEffect(() => {
    if (!tintOpen) return
    window.addEventListener("resize", positionPanel)
    window.addEventListener("scroll", positionPanel, true)
    return () => {
      window.removeEventListener("resize", positionPanel)
      window.removeEventListener("scroll", positionPanel, true)
    }
  }, [tintOpen, positionPanel])

  // Re-measure when the panel's own size changes (content swaps, font load):
  // the 12px gap to the dot stays exact instead of drifting.
  useEffect(() => {
    if (!tintOpen) return
    const panel = tintPanelRef.current
    if (!panel || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => positionPanel())
    ro.observe(panel)
    return () => ro.disconnect()
  }, [tintOpen, positionPanel])

  // Dismiss on outside click / Escape. The portal lives outside the anchor,
  // so both regions count as "inside".
  useEffect(() => {
    if (!tintOpen) return
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (tintAnchorRef.current?.contains(target)) return
      if (tintPanelRef.current?.contains(target)) return
      closePicker(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePicker(true)
    }
    document.addEventListener("pointerdown", onPointer, true)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer, true)
      document.removeEventListener("keydown", onKey)
    }
  }, [tintOpen, closePicker])

  const handleTintChange = useCallback((hex: string) => {
    setTint(applyTint(hex))
  }, [])

  const handleTintReset = useCallback(() => {
    setTint(clearTint())
  }, [])

  const redActive = tintOpen || tint !== null

  return (
    <>
      <TextWithBlur delay={350}>
        <div className="flex gap-2 mt-8 select-none items-center" role="group" aria-label="Decorative dots">
          <div
            ref={tintAnchorRef}
            className="relative flex items-center"
            onPointerEnter={() => showHint("tint")}
            onPointerLeave={hideHint}
          >
            <button
              ref={tintTriggerRef}
              type="button"
              onClick={() => {
                hideHint()
                if (tintOpen) {
                  closePicker(false)
                  return
                }
                setTintOpen(true)
              }}
              data-preserve-player=""
              aria-label={tint ? `Site theme color ${tint}. Choose another theme color` : "Choose a site theme color"}
              aria-haspopup="dialog"
              aria-pressed={tintOpen}
              aria-expanded={tintOpen}
              onFocus={() => showHint("tint")}
              onBlur={hideHint}
              className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/60 dark:focus-visible:ring-offset-black after:absolute after:-inset-x-0.5 after:-inset-y-2 after:content-['']"
              style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: RED_DOT_DEFAULT, opacity: redActive ? 1 : 0.6, boxShadow: redActive ? `0 0 8px ${RED_DOT_DEFAULT}` : "none", flexShrink: 0, display: "block", padding: 0, border: "none", cursor: "pointer" }}
            />
            <DotHint hint="tint" visible={hint === "tint" && !tintOpen} />
          </div>
          <div
            className="relative flex items-center"
            onPointerEnter={() => showHint("music")}
            onPointerLeave={hideHint}
          >
            <button
              type="button"
              data-notch-trigger=""
              onClick={toggleMusic}
              aria-label={musicOpen ? "Close notch music player" : "Open notch music player"}
              aria-pressed={musicOpen}
              aria-expanded={musicOpen}
              onFocus={() => showHint("music")}
              onBlur={hideHint}
              className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/60 dark:focus-visible:ring-offset-black after:absolute after:-inset-x-0.5 after:-inset-y-2 after:content-['']"
              style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: YELLOW_DOT_DEFAULT, opacity: musicOpen ? 1 : 0.6, boxShadow: musicOpen ? `0 0 8px ${YELLOW_DOT_DEFAULT}` : "none", flexShrink: 0, display: "block", padding: 0, border: "none", cursor: "pointer" }}
            />
            <DotHint hint="music" visible={hint === "music" && !musicOpen} />
          </div>
          {isMobile ? (
            <span
              aria-hidden="true"
              style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: GREEN_DOT_DEFAULT, opacity: 0.6, flexShrink: 0, display: "block" }}
            />
          ) : (
            <div
              className="relative flex items-center"
              onPointerEnter={() => showHint("ascii")}
              onPointerLeave={hideHint}
            >
              <button
                type="button"
                onClick={toggle}
                aria-label="Toggle liquid ASCII easter egg"
                aria-pressed={open}
                onFocus={() => showHint("ascii")}
                onBlur={hideHint}
                className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/60 dark:focus-visible:ring-offset-black after:absolute after:-inset-x-0.5 after:-inset-y-2 after:content-['']"
                style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: GREEN_DOT_DEFAULT, opacity: open ? 1 : 0.6, boxShadow: open ? `0 0 8px ${GREEN_DOT_DEFAULT}` : "none", flexShrink: 0, display: "block", padding: 0, border: "none", cursor: "pointer" }}
              />
              <DotHint hint="ascii" visible={hint === "ascii" && !open} />
            </div>
          )}
        </div>
      </TextWithBlur>
      {tintOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={tintPanelRef}
          className="animate-slide-up"
          data-preserve-player=""
          style={{
            position: "fixed",
            top: panelPos?.top ?? -9999,
            left: panelPos?.left ?? 0,
            zIndex: 50,
            visibility: measured ? "visible" : "hidden",
          }}
        >
                <ThemeTintPicker
                  value={tint ?? RED_DOT_DEFAULT}
                  tintActive={tint !== null}
                  onChange={handleTintChange}
                  onReset={handleTintReset}
                  onClose={() => closePicker(true)}
                />
        </div>,
        document.body
      )}
      {open && !isMobile && <LiquidAscii onClose={close} />}
    </>
  )
}
