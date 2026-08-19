/**
 * Google Analytics 4 (GA4) & UTM Attribution Engine
 * Handles campaign tracking, parameter retention, outbound clicks, and conversion key events.
 */

export interface UtmParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
  ref?: string
  capturedAt?: string
}

const STORAGE_KEY = "tirup_utm_attribution"

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

/**
 * Safely parse search parameters and persist UTM parameters in sessionStorage
 */
export function captureUtmParams(searchParamsString?: string): UtmParams | null {
  if (typeof window === "undefined") return null

  try {
    const queryString = searchParamsString !== undefined ? searchParamsString : window.location.search
    if (!queryString) {
      return getStoredUtmParams()
    }

    const params = new URLSearchParams(queryString)
    const utmSource = params.get("utm_source")
    const utmMedium = params.get("utm_medium")
    const utmCampaign = params.get("utm_campaign")
    const utmContent = params.get("utm_content")
    const utmTerm = params.get("utm_term")
    const gclid = params.get("gclid")
    const ref = params.get("ref")

    // Only capture if at least one parameter is present
    if (utmSource || utmMedium || utmCampaign || utmContent || utmTerm || gclid || ref) {
      const utmObj: UtmParams = {
        ...(utmSource && { utm_source: utmSource }),
        ...(utmMedium && { utm_medium: utmMedium }),
        ...(utmCampaign && { utm_campaign: utmCampaign }),
        ...(utmContent && { utm_content: utmContent }),
        ...(utmTerm && { utm_term: utmTerm }),
        ...(gclid && { gclid }),
        ...(ref && { ref }),
        capturedAt: new Date().toISOString(),
      }

      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utmObj))

      // Fire campaign landing event to GA4
      trackEvent("campaign_landing", {
        ...utmObj,
        landing_page: window.location.pathname,
      })

      // Clean URL from browser address bar after GA4 capture
      cleanUrlFromAddressBar()

      return utmObj
    }
  } catch (err) {
    console.error("[GA4] Failed to capture UTM params:", err)
  }

  return getStoredUtmParams()
}

/**
 * Silently remove UTM and tracking parameters from browser URL address bar
 * without causing a page reload, preserving the path and hash fragment.
 */
export function cleanUrlFromAddressBar() {
  if (typeof window === "undefined" || !window.history || !window.history.replaceState) return

  try {
    const url = new URL(window.location.href)
    const searchParams = url.searchParams

    // Don't auto-clean if visitor is using the UTM builder tool page
    if (window.location.pathname.startsWith("/tools/utm-builder")) {
      return
    }

    const trackingKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "msclkid", "ref"]
    const hasTracking = trackingKeys.some((key) => searchParams.has(key))

    if (hasTracking) {
      trackingKeys.forEach((key) => searchParams.delete(key))

      const newSearch = searchParams.toString()
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}${window.location.hash}`

      window.history.replaceState(window.history.state, "", newUrl)
    }
  } catch (err) {
    // Silent catch for history manipulation safety
  }
}

/**
 * Retrieve active UTM attribution context from sessionStorage
 */
export function getStoredUtmParams(): UtmParams | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as UtmParams
    }
  } catch (err) {
    console.error("[GA4] Failed to parse stored UTM params:", err)
  }

  return null
}

/**
 * Generic GA4 Event Tracker
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return

  try {
    const storedUtm = getStoredUtmParams() || {}
    const eventPayload = {
      ...storedUtm,
      ...params,
      page_location: window.location.href,
      page_path: window.location.pathname,
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, eventPayload)
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...eventPayload,
      })
    }
  } catch (err) {
    // Silent catch for telemetry execution errors
  }
}

/**
 * Track Outbound Link Clicks (Key Event for External Navigation)
 */
export function trackOutboundClick(url: string, label?: string) {
  trackEvent("outbound_click", {
    destination_url: url,
    link_label: label || url,
    transport_type: "beacon",
  })
}

/**
 * Track Lead Form Submissions & Community Conversions
 */
export function trackLeadSubmission(data: {
  name?: string
  email?: string
  inquiryType?: string
  messageLength?: number
}) {
  const emailDomain = data.email && data.email.includes("@") ? data.email.split("@")[1] : "unknown"

  trackEvent("lead_form_submit", {
    inquiry_type: data.inquiryType || "general",
    email_domain: emailDomain,
    message_length: data.messageLength || 0,
    conversion_type: "lead_inquiry",
  })

  // Also log secondary community sign up key event for GA4
  trackEvent("community_signup", {
    source: "work_inquiry_form",
    inquiry_type: data.inquiryType || "general",
  })
}

/**
 * Track Blog Reading Depth / Engagement
 */
export function trackBlogEngagement(slug: string, title: string, scrollDepthPercent: number) {
  trackEvent("blog_engagement", {
    article_slug: slug,
    article_title: title,
    scroll_depth: Math.round(scrollDepthPercent),
  })
}
