"use client"

import { useEffect, useState } from "react"

interface TldrPopupProps {
  safeTldrHtml: string
}

export default function TldrPopup({ safeTldrHtml }: TldrPopupProps) {
  const [showTldr, setShowTldr] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (!safeTldrHtml || isDismissed) return
    
    const timer = setTimeout(() => {
      setShowTldr(true)
    }, 2000) // Show popup after 2 seconds

    return () => clearTimeout(timer)
  }, [safeTldrHtml, isDismissed])

  const handleDismiss = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowTldr(false)
      setIsDismissed(true)
    }, 350) // wait for animation duration (350ms)
  }

  if (!showTldr) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-xs w-[calc(100vw-3rem)] hidden md:block select-none ${
        isClosing ? "animate-spring-slide-down" : "animate-spring-slide-up"
      }`}
    >
      <div className="bg-white/95 dark:bg-zinc-950/95 border-shadow rounded-xl p-5 backdrop-blur-md cursor-default">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
            TL;DR Summary
          </span>
        </div>
        <div
          className="text-xs md:text-sm font-light leading-relaxed text-black/75 dark:text-white/75 mb-1"
          dangerouslySetInnerHTML={{ __html: safeTldrHtml }}
        />
        <button
          onClick={handleDismiss}
          className="w-full mt-4 py-2.5 text-xs font-medium text-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 rounded-lg text-black/70 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
        >
          Dismiss Summary
        </button>
      </div>
    </div>
  )
}
