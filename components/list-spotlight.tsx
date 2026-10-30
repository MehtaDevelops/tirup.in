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
 * Spotlight container for list rows.
 *
 * Shows which row the reader is on and lets the rest of the list recede.
 * Fine pointers get it from `:hover` in CSS; touch, pen and keyboard have no
 * hover state, so this wrapper mirrors the same treatment through data
 * attributes. It also reports each row's distance from the spotlit one
 * (`data-depth`), which is what turns a flat dim into a soft falloff:
 * neighbours stay legible and the fade deepens with distance.
 */
export default function ListSpotlight({ className = "", children }: ListSpotlightProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const holdRef = useRef<number | null>(null)
  const originRef = useRef<{ x: number; y: number } | null>(null)
  const hoveredRef = useRef<Element | null>(null)
  const inputRef = useRef<"mouse" | "touch" | "key" | null>(null)
  const pointRef = useRef<{ x: number; y: number } | null>(null)
  const scrollRafRef = useRef(0)

  const clearHold = useCallback(() => {
    if (holdRef.current !== null) {
      window.clearTimeout(holdRef.current)
      holdRef.current = null
    }
  }, [])

  // Depths 0..3: 0 is the spotlit row, 3 is everything past the second
  // neighbour. globals.css maps each depth to its own opacity.
  const apply = useCallback((row: Element | null, input?: "touch") => {
    const root = ref.current
    if (!root) return
    const children = Array.from(root.children)
    const active = row ? children.indexOf(row) : -1
    children.forEach((child, index) => {
      if (active < 0) {
        child.removeAttribute("data-spotlit")
        child.removeAttribute("data-depth")
        return
      }
      const depth = Math.min(3, Math.abs(index - active))
      child.setAttribute("data-depth", String(depth))
      if (depth === 0) child.setAttribute("data-spotlit", "")
      else child.removeAttribute("data-spotlit")
    })
    if (active < 0) root.removeAttribute("data-spotlight")
    else if (input === "touch") root.setAttribute("data-spotlight", "touch")
    else root.setAttribute("data-spotlight", "")
  }, [])

  const rowFor = useCallback((target: EventTarget | null) => {
    const root = ref.current
    if (!root || !(target instanceof Element)) return null
    let node: Element | null = target
    while (node && node.parentElement !== root) node = node.parentElement
    return node && root.contains(node) ? node : null
  }, [])

  useEffect(() => clearHold, [clearHold])

  // Wheel-scrolling with a still cursor moves new rows under the pointer but
  // fires no pointermove, which would leave the spotlight on whatever row was
  // there before. Re-resolve the row under the last known point on scroll.
  useEffect(() => {
    const onScroll = () => {
      if (inputRef.current !== "mouse" || !hoveredRef.current || !pointRef.current || scrollRafRef.current) return
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = 0
        const point = pointRef.current
        if (!point) return
        const row = rowFor(document.elementFromPoint(point.x, point.y))
        if (row === hoveredRef.current) return
        hoveredRef.current = row
        apply(row)
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (scrollRafRef.current) window.cancelAnimationFrame(scrollRafRef.current)
    }
  }, [apply, rowFor])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const root = ref.current
    if (!root) return
    if (event.pointerType === "mouse") {
      // Mouse is owned by :hover plus pointermove below.
      inputRef.current = "mouse"
      hoveredRef.current = rowFor(event.target)
      return
    }
    clearHold()
    inputRef.current = "touch"
    hoveredRef.current = null
    originRef.current = { x: event.clientX, y: event.clientY }
    // Keep pointerup/pointercancel on the container even if the finger drifts
    // off the row, so the spotlight can never get stuck on.
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* older engines: the release hold below still clears it */
    }
    apply(rowFor(event.target), "touch")
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      inputRef.current = "mouse"
      pointRef.current = { x: event.clientX, y: event.clientY }
      const row = rowFor(event.target)
      if (row === hoveredRef.current) return
      hoveredRef.current = row
      apply(row)
      return
    }
    const origin = originRef.current
    if (!origin) return
    if (
      Math.abs(event.clientX - origin.x) > TOUCH_SLOP ||
      Math.abs(event.clientY - origin.y) > TOUCH_SLOP
    ) {
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
    hoveredRef.current = null
    clearHold()
    apply(null)
  }

  const onPointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Only the mouse owns the spotlight this way; a keyboard-focused row
    // keeps its spotlight even if the cursor drifts off the list.
    if (event.pointerType !== "mouse" || inputRef.current !== "mouse") return
    inputRef.current = null
    hoveredRef.current = null
    apply(null)
  }

  const onFocus = (event: ReactFocusEvent<HTMLDivElement>) => {
    const target = event.target
    // Keyboard focus only: a mouse click focuses the row too, and `:hover`
    // already covers that case.
    if (!(target instanceof Element) || !target.matches(":focus-visible")) return
    clearHold()
    inputRef.current = "key"
    apply(rowFor(target))
  }

  const onBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget instanceof Node && ref.current?.contains(event.relatedTarget)) return
    clearHold()
    inputRef.current = null
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
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
    </div>
  )
}
