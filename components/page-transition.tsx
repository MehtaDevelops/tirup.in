"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    // Skip transition on first render
    if (isFirstRender) {
      setIsFirstRender(false)
      return
    }

    // When the pathname changes, start the transition
    setIsTransitioning(true)

    // After a short delay, update the displayed children
    const timeout = setTimeout(() => {
      setDisplayChildren(children)
      // Then immediately start fading in
      setIsTransitioning(false)
    }, 200) // This should be shorter than your CSS transition

    return () => clearTimeout(timeout)
  }, [pathname, children, isFirstRender])

  return (
    <div
      className="transition-all duration-300 ease-in-out"
      style={{
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? "translateY(10px)" : "translateY(0)",
      }}
    >
      {displayChildren}
    </div>
  )
}
