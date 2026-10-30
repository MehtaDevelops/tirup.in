"use client"

import {
  useCallback,
  useEffect,
  useRef,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"

const TOUCH_SLOP = 8
// One beat after release so the fade is legible even on a quick tap: the
// finger is gone before the row would otherwise snap back.
const RELEASE_HOLD = 260

interface ListSpotlightProps {
  className?: string
  children: ReactNode
}

/**
 * Sibling-dim container for list rows.
 *
 * Mouse devices get the spotlight from CSS `:hover` (globals.css). Touch and
 * keyboard have no hover state, so this wrapper reports intent to the same
 * rules: pressing a row sets `data-spotlight` on the container and
 * `data-spotlit` on that row. Releasing keeps the dim for one short beat so
 * the transition is visible even on a fast tap, and scrolling clears it
 * immediately so the list never fights the finger.
 */
export default function ListSpotlight({ className = "", children }: ListSpotlightProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const holdRef = useRef<number | null>(null)
  const originRef = useRef<{ x: number; y: number } | null>(null)

  const clearHold = useCallback(() => {
    if (holdRef.current !== null) {
      window.clearTimeout(holdRef.current)
      holdRef.current = null
    }
  }, [])

  const apply = useCallback((row: Element | null) => {
    const root = ref.current
    if (!root) return
    for (const child of Array.from(root.children)) {
      if (child === row) child.setAttribute("data-spotlit", "")
      else child.removeAttribute("data-spotlit")
    }
    if (row) root.setAttribute("data-spotlight", "")
    else root.removeAttribute("data-spotlight")
  }, [])

  const rowFor = useCallback((target: EventTarget | null) => {
    const root = ref.current
    if (!root || !(target instanceof Element)) return null
    let node: Element | null = target
    while (node && node.parentElement !== root) node = node.parentElement
    return node && root.contains(node) ? node : null
  }, [])

  useEffect(() => clearHold, [clearHold])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Mouse and trackpads are handled entirely by `:hover` in CSS.
    if (event.pointerType === "mouse") return
    clearHold()
    originRef.current = { x: event.clientX, y: event.clientY }
    // Keep pointerup/pointercancel on the container even if the finger drifts
    // off the row, so the spotlight can never get stuck on.
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* older engines: the release hold below still clears it */
    }
    apply(rowFor(event.target))
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = originRef.current
    if (!origin) return
    if (Math.abs(event.clientX - origin.x) > TOUCH_SLOP || Math.abs(event.clientY - origin.y) > TOUCH_SLOP) {
      // The finger is scrolling, not pressing a row.
      originRef.current = null
      clearHold()
      apply(null)
    }
  }

  const onPointerUp = () => {
    if (!originRef.current) return
    originRef.current = null
    clearHold()
    holdRef.current = window.setTimeout(() => {
      holdRef.current = null
      apply(null)
    }, RELEASE_HOLD)
  }

  const onPointerCancel = () => {
    originRef.current = null
    clearHold()
    apply(null)
  }

  const onFocus = (event: ReactFocusEvent<HTMLDivElement>) => {
    const target = event.target
    // Keyboard focus only: a mouse click focuses the row too, and `:hover`
    // already covers that case.
    if (!(target instanceof Element) || !target.matches(":focus-visible")) return
    clearHold()
    apply(rowFor(target))
  }

  const onBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget instanceof Node && ref.current?.contains(event.relatedTarget)) return
    clearHold()
    apply(null)
  }

  return (
    <div
      ref={ref}
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
    </div>
  )
}
