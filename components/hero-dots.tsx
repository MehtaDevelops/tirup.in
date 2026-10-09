"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { createPortal } from "react-dom"
import TextWithBlur from "@/components/text-with-blur"
import ThemeTintPicker from "@/components/theme-tint-picker"
import { applyTint, clearTint, getStoredTint } from "@/lib/theme-tint"

const LiquidAscii = dynamic(() => import("@/components/liquid-ascii"), {
  ssr: false,
  loading: () => null,
})

const RED_DOT_DEFAULT = "#ff6b6b"
const PANEL_GAP = 12
const VIEWPORT_MARGIN = 8

function YellowDot() {
  return (
    <span
      title="coming soon"
      aria-hidden="true"
      style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: "#feca57", opacity: 0.6, flexShrink: 0, display: "block" }}
    />
  )
}

/**
 * HeroDots — dots row + two easter eggs.
 * Green dot: fluid ASCII (desktop only — mobile stays inert, zero cost,
 * canvas portals to body so it adds zero space).
 * Red dot: site-wide theme color picker. The pick re-tints the whole
 * website (light surfaces + darker dark-mode surfaces, derived in CSS),
 * persists in localStorage, and applies on every page.
 *
 * The picker portals to body with viewport-clamped fixed positioning:
 * it flips above/below the dot based on available space, so it never
 * clips off-screen on short viewports or mobile.
 */
export default function HeroDots() {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  const [tintOpen, setTintOpen] = useState(false)
  const [tint, setTint] = useState<string | null>(null)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null)
  const [measured, setMeasured] = useState(false)
  const tintAnchorRef = useRef<HTMLDivElement>(null)
  const tintTriggerRef = useRef<HTMLButtonElement>(null)
  const tintPanelRef = useRef<HTMLDivElement>(null)

  // Re-apply the persisted tint (pre-paint script in layout already did the
  // DOM part — this just syncs the dot's state with it).
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

  const toggle = useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches) return
    setOpen((v) => !v)
  }, [])

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
          <div ref={tintAnchorRef} className="relative flex items-center">
            <button
              ref={tintTriggerRef}
              type="button"
              onClick={() => (tintOpen ? closePicker(false) : setTintOpen(true))}
              aria-label={tint ? `Site theme color ${tint}. Choose another theme color` : "Choose a site theme color"}
              aria-haspopup="dialog"
              aria-pressed={tintOpen}
              aria-expanded={tintOpen}
              title={tint ? `theme: ${tint} (click to change)` : "psst… click me"}
              className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/60 dark:focus-visible:ring-offset-black after:absolute after:-inset-3 after:content-['']"
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: tint ?? RED_DOT_DEFAULT,
                opacity: redActive ? 1 : 0.6,
                boxShadow: redActive ? `0 0 8px ${tint ?? RED_DOT_DEFAULT}` : "none",
                flexShrink: 0,
                display: "block",
                padding: 0,
                border: "none",
                cursor: "pointer",
              }}
            />
          </div>
          <YellowDot />
          {isMobile ? (
            <span
              title="desktop only"
              aria-hidden="true"
              style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: "#1dd1a1", opacity: 0.6, flexShrink: 0, display: "block" }}
            />
          ) : (
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle liquid ASCII easter egg"
            aria-pressed={open}
            title="psst… click me"
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              backgroundColor: "#1dd1a1",
              opacity: open ? 1 : 0.6,
              boxShadow: open ? "0 0 8px #1dd1a1" : "none",
              flexShrink: 0,
              display: "block",
              padding: 0,
              border: "none",
              cursor: "pointer",
            }}
          />
          )}
        </div>
      </TextWithBlur>
      {tintOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={tintPanelRef}
          className="animate-slide-up"
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
