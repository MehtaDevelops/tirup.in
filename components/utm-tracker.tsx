"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { captureUtmParams, trackEvent, cleanUrlFromAddressBar } from "@/lib/gtam"

export default function UtmTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Reading the URL after hydration avoids turning the entire root into a
    // client-rendered bailout just to capture optional campaign parameters.
    captureUtmParams(window.location.search)
    
    // Log page view event with GA4
    trackEvent("page_view", {
      page_title: document.title,
      page_path: pathname,
    })

    // Clean tracking query params from browser address bar
    cleanUrlFromAddressBar()
  }, [pathname])

  return null
}
