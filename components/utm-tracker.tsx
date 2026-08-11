"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { captureUtmParams, trackEvent, cleanUrlFromAddressBar } from "@/lib/gtam"

function UtmTrackerInner() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    const searchString = searchParams?.toString() ? `?${searchParams.toString()}` : ""
    captureUtmParams(searchString)
    
    // Log page view event with GA4
    trackEvent("page_view", {
      page_title: document.title,
      page_path: pathname,
    })

    // Clean tracking query params from browser address bar
    cleanUrlFromAddressBar()
  }, [searchParams, pathname])

  return null
}

export default function UtmTracker() {
  return (
    <Suspense fallback={null}>
      <UtmTrackerInner />
    </Suspense>
  )
}
