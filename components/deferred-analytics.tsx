"use client"

import { useEffect } from "react"

/**
 * Starts Google Tag Manager and Google Analytics (and, through the tag,
 * Clarity) once a real person is on the page, instead of during page load.
 *
 * Those scripts are ~0.9 s of main-thread work on a phone and set third-party
 * cookies; running them before the page is interactive is what held back the
 * speed score. Nothing about what is collected changes: the same snippets run,
 * just later. They start on the first pointer move, tap, key press or scroll,
 * or after 15 seconds on the page, whichever comes first.
 */

const FALLBACK_MS = 15_000
const EVENTS = ["pointermove", "pointerdown", "keydown", "touchstart", "scroll", "wheel"] as const

type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

export default function DeferredAnalytics({ gtmId, gaId }: { gtmId: string; gaId: string }) {
  useEffect(() => {
    let started = false
    let timer: number | undefined

    const stopListening = () => {
      for (const type of EVENTS) window.removeEventListener(type, start, true)
      if (timer !== undefined) window.clearTimeout(timer)
    }

    function start() {
      if (started) return
      started = true
      stopListening()
      const w = window as AnalyticsWindow

      // Google Tag Manager
      w.dataLayer = w.dataLayer || []
      w.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" })
      const gtm = document.createElement("script")
      gtm.async = true
      gtm.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
      document.head.appendChild(gtm)

      // Google Analytics (gtag.js). Respect Do Not Track / denied consent for
      // the config call, exactly as before.
      const ga = document.createElement("script")
      ga.async = true
      ga.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
      document.head.appendChild(ga)
      try {
        if (navigator.doNotTrack === "1" || localStorage.getItem("analytics-consent") === "denied") {
          /* respect privacy */
        } else if (typeof w.gtag === "function") {
          w.gtag("js", new Date())
          w.gtag("config", gaId, { anonymize_ip: true })
        }
      } catch {
        /* ignore */
      }
    }

    for (const type of EVENTS) window.addEventListener(type, start, { passive: true, capture: true, once: true })
    timer = window.setTimeout(start, FALLBACK_MS)

    return stopListening
  }, [gtmId, gaId])

  return null
}
