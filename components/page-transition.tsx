"use client"

import { useEffect } from "react"
import { flushSync } from "react-dom"
import { useRouter } from "next/navigation"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const handleNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return

      const target = event.target instanceof Element
        ? event.target.closest("a")
        : null
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return

      const destination = new URL(target.href, window.location.href)
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname && destination.search === window.location.search
      ) return

      // Keep desktop navigation exactly as it was; the composed transition is
      // intentionally a mobile-only enhancement.
      if (window.matchMedia("(min-width: 768px)").matches) return

      event.preventDefault()
      const navigate = () => flushSync(() => {
        router.push(`${destination.pathname}${destination.search}${destination.hash}`)
      })
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (reducedMotion || typeof document.startViewTransition !== "function") {
        navigate()
        return
      }

      document.startViewTransition(navigate)
    }

    document.addEventListener("click", handleNavigation, true)
    return () => document.removeEventListener("click", handleNavigation, true)
  }, [router])

  return <>{children}</>
}
