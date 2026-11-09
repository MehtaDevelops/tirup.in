"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { useSongBubbleOpen } from "@/lib/song-bubble-store"

// The player is ~1,400 lines plus a hidden YouTube embed. The embed runs in
// its own browser process and costs tens of megabytes plus ~900 KB of third
// party scripts, so it only exists while someone is actually heading for the
// yellow dot, and is released again if the music is not used.
const NotchPlayer = dynamic(() => import("@/components/notch-player"), { ssr: false })

// How close (px) the pointer has to get to the yellow dot to start warming up.
// Far enough ahead that a click is usually instant, close enough that someone
// just reading the page never pays for it.
const PROXIMITY_PX = 160
// Throttle for the proximity check on pointermove.
const MOVE_GATE_MS = 80
// Armed but never opened: release after this long.
const UNUSED_RELEASE_MS = 45_000
// Closed after use: release after this long (reopening within it is instant).
const CLOSED_RELEASE_MS = 30_000

function nearTrigger(x: number, y: number) {
  const el = document.querySelector("[data-notch-trigger]")
  if (!el) return false
  const r = el.getBoundingClientRect()
  const dx = Math.max(r.left - x, 0, x - r.right)
  const dy = Math.max(r.top - y, 0, y - r.bottom)
  return Math.hypot(dx, dy) <= PROXIMITY_PX
}

function isTrigger(target: EventTarget | null) {
  return target instanceof Element && !!target.closest("[data-notch-trigger]")
}

export default function NotchPlayerLazy() {
  const open = useSongBubbleOpen()
  const [armed, setArmed] = useState(false)

  // Arm on real intent at the dot: pointer coming near it, keyboard focus, or a touch.
  useEffect(() => {
    if (armed) return
    const arm = () => setArmed(true)
    let last = 0
    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      if (now - last < MOVE_GATE_MS) return
      last = now
      if (nearTrigger(e.clientX, e.clientY)) arm()
    }
    const onPress = (e: PointerEvent) => {
      if (isTrigger(e.target) || nearTrigger(e.clientX, e.clientY)) arm()
    }
    const onFocus = (e: FocusEvent) => {
      if (isTrigger(e.target)) arm()
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerdown", onPress, { passive: true, capture: true })
    window.addEventListener("focusin", onFocus)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onPress, true)
      window.removeEventListener("focusin", onFocus)
    }
  }, [armed])

  // Release the player (and its YouTube process) when it is not in use:
  // sooner after the card was used and closed, later if it was never opened.
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      return
    }
    if (!armed) return
    const delay = wasOpenRef.current ? CLOSED_RELEASE_MS : UNUSED_RELEASE_MS
    const timer = window.setTimeout(() => {
      wasOpenRef.current = false
      setArmed(false)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [armed, open])

  // A click on the dot opens the store before anything else; mount right away.
  return armed || open ? <NotchPlayer /> : null
}
