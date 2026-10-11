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
    }, 2000)

    return () => clearTimeout(timer)
  }, [safeTldrHtml, isDismissed])

  const handleDismiss = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowTldr(false)
      setIsDismissed(true)
    }, 350)
  }

  if (!showTldr) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-[340px] w-[calc(100vw-3rem)] hidden md:block select-none ${
        isClosing ? "animate-spring-slide-down" : "animate-spring-slide-up"
      }`}
    >
      <div className="bg-white/75 dark:bg-white/[0.04] backdrop-blur-md border border-black/10 dark:border-white/10 rounded-xl p-[18px] shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[13px] font-medium text-black/80 dark:text-white/80 tracking-tight">
            TL;DR Summary
          </span>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss summary"
            className="text-[13px] text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors p-1 -mr-1 cursor-pointer leading-none"
          >
            ✕
          </button>
        </div>
        <div
          className="text-[13px] font-light leading-relaxed text-black/70 dark:text-white/70"
          dangerouslySetInnerHTML={{ __html: safeTldrHtml }}
        />
      </div>
    </div>
  )
}
