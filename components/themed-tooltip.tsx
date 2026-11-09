"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

/**
 * One themed tooltip for the whole site.
 *
 * Native `title` tooltips are unstyled, slow, and ignore the theme. This
 * listens at the document level, takes over any element's `title` (so every
 * existing and future `title="..."` is covered with no call-site changes),
 * and shows a single floating card styled like the site's dot-hint cards.
 *
 * - The `title` is moved to `data-tip` so the browser never draws its own box.
 *   Icon-only elements keep an accessible name via `aria-label`.
 * - Mouse/pen hover shows it after a short delay; moving between neighbours
 *   swaps instantly. Keyboard focus (:focus-visible) shows it too.
 * - Touch never shows it (there is no hover); Escape, scroll, press, resize
 *   and leaving all dismiss it.
 */

const SHOW_DELAY_MS = 260
const GAP = 10
const MARGIN = 8
const CARET_PAD = 14

type Placement = "top" | "bottom"

/** Take ownership of an element's title text. Returns the tip text, if any. */
function claimTip(el: HTMLElement): string {
  const title = el.getAttribute("title")
  if (title !== null) {
    const text = title.trim()
    if (text) {
      el.setAttribute("data-tip", text)
      // Keep an accessible name for icon-only controls once `title` is gone.
      if (
        !el.hasAttribute("aria-label") &&
        !el.hasAttribute("aria-labelledby") &&
        !(el.textContent ?? "").trim()
      ) {
        el.setAttribute("aria-label", text)
      }
    }
    el.removeAttribute("title")
  }
  return el.getAttribute("data-tip") ?? ""
}

function findTipElement(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null
  const el = target.closest<HTMLElement>("[title],[data-tip]")
  if (!el) return null
  // iframe titles are accessibility names, not hover hints
  if (el.tagName === "IFRAME" || el.tagName === "svg") return null
  return el
}

export default function ThemedTooltip() {
  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  const tipRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openRef = useRef(false)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const hide = useCallback(() => {
    clearTimer()
    anchorRef.current = null
    openRef.current = false
    setOpen(false)
  }, [])

  const show = useCallback((el: HTMLElement, label: string) => {
    anchorRef.current = el
    openRef.current = true
    setText(label)
    setOpen(true)
  }, [])

  // Position after the text renders, before paint, so it never flashes in the wrong spot.
  useLayoutEffect(() => {
    const tip = tipRef.current
    const anchor = anchorRef.current
    if (!open || !tip || !anchor || !anchor.isConnected) return
    const a = anchor.getBoundingClientRect()
    const w = tip.offsetWidth
    const h = tip.offsetHeight
    const vw = document.documentElement.clientWidth
    const centerX = a.left + a.width / 2
    const left = Math.min(Math.max(centerX - w / 2, MARGIN), Math.max(MARGIN, vw - w - MARGIN))
    const fitsAbove = a.top - h - GAP >= MARGIN
    const next: Placement = fitsAbove ? "top" : "bottom"
    const top = next === "top" ? a.top - h - GAP : a.bottom + GAP
    const caret = Math.min(Math.max(centerX - left, CARET_PAD), Math.max(CARET_PAD, w - CARET_PAD))
    tip.style.left = `${Math.round(left)}px`
    tip.style.top = `${Math.round(top)}px`
    tip.style.setProperty("--tip-caret", `${Math.round(caret)}px`)
    // Written straight to the DOM (not state): React never re-renders for it
    tip.dataset.placement = next
  }, [open, text])

  useEffect(() => {
    const schedule = (el: HTMLElement, label: string, immediate: boolean) => {
      clearTimer()
      if (immediate || openRef.current) {
        show(el, label)
        return
      }
      timerRef.current = setTimeout(() => show(el, label), SHOW_DELAY_MS)
    }

    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      const el = findTipElement(e.target)
      if (!el) return
      const label = claimTip(el)
      if (!label) return
      if (el === anchorRef.current) return
      schedule(el, label, false)
    }

    const onOut = (e: PointerEvent) => {
      const el = findTipElement(e.target)
      if (!el) return
      const to = e.relatedTarget
      if (to instanceof Node && el.contains(to)) return
      if (el === anchorRef.current || timerRef.current) hide()
    }

    const onFocusIn = (e: FocusEvent) => {
      const el = findTipElement(e.target)
      if (!el) return
      const label = claimTip(el)
      if (!label) return
      if (!(e.target as HTMLElement).matches?.(":focus-visible")) return
      schedule(el, label, true)
    }

    const onFocusOut = () => hide()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide()
    }

    document.addEventListener("pointerover", onOver, true)
    document.addEventListener("pointerout", onOut, true)
    document.addEventListener("pointerdown", hide, true)
    document.addEventListener("focusin", onFocusIn, true)
    document.addEventListener("focusout", onFocusOut, true)
    document.addEventListener("keydown", onKey, true)
    window.addEventListener("scroll", hide, true)
    window.addEventListener("resize", hide)
    window.addEventListener("blur", hide)
    return () => {
      clearTimer()
      document.removeEventListener("pointerover", onOver, true)
      document.removeEventListener("pointerout", onOut, true)
      document.removeEventListener("pointerdown", hide, true)
      document.removeEventListener("focusin", onFocusIn, true)
      document.removeEventListener("focusout", onFocusOut, true)
      document.removeEventListener("keydown", onKey, true)
      window.removeEventListener("scroll", hide, true)
      window.removeEventListener("resize", hide)
      window.removeEventListener("blur", hide)
    }
  }, [hide, show])

  return (
    <div
      ref={tipRef}
      aria-hidden="true"
      data-open={open ? "true" : "false"}
      className="themed-tip"
    >
      <div className="themed-tip-card">
        <span className="themed-tip-dot" />
        <span className="themed-tip-text">{text}</span>
      </div>
      <span className="themed-tip-caret" />
    </div>
  )
}
