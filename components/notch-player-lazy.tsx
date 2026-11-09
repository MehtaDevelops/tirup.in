"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useSongBubbleOpen } from "@/lib/song-bubble-store"

// The player is ~1,400 lines plus a hidden YouTube embed (~900 KB of third
// party scripts). Neither is needed to paint the page, so neither is fetched
// until someone is plausibly about to use it.
const NotchPlayer = dynamic(() => import("@/components/notch-player"), { ssr: false })

// Failsafe for visitors who never touch the page: warm up well after load.
const IDLE_FALLBACK_MS = 8000

// Any of these means a real person is on the page. Moving the mouse toward
// the yellow dot, scrolling, touching or typing all start the warm-up, so by
// the time they click it the song is usually ready to play at once.
const INTENT_EVENTS = ["pointermove", "pointerdown", "keydown", "touchstart", "wheel", "scroll"] as const

export default function NotchPlayerLazy() {
  const open = useSongBubbleOpen()
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (armed) return
    let timer: number | undefined
    const arm = () => setArmed(true)

    for (const type of INTENT_EVENTS) {
      window.addEventListener(type, arm, { passive: true, capture: true, once: true })
    }
    const onLoad = () => {
      timer = window.setTimeout(arm, IDLE_FALLBACK_MS)
    }
    if (document.readyState === "complete") onLoad()
    else window.addEventListener("load", onLoad, { once: true })

    return () => {
      for (const type of INTENT_EVENTS) window.removeEventListener(type, arm, true)
      window.removeEventListener("load", onLoad)
      if (timer) window.clearTimeout(timer)
    }
  }, [armed])

  // A click on the dot opens the store before anything else; mount right away.
  return armed || open ? <NotchPlayer /> : null
}
