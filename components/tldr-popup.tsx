"use client"

import { useEffect, useState } from "react"

interface TldrPopupProps {
  safeTldrHtml: string
}

export default function TldrPopup({ safeTldrHtml }: TldrPopupProps) {
  const [showTldr, setShowTldr] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('tldr-dismissed') === '1'
    } catch {
      return false
    }
  })

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
      try { sessionStorage.setItem('tldr-dismissed', '1') } catch { /* ignore */ }
    }, 350)
  }

  useEffect(() => {
    if (!showTldr) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showTldr])

  if (!showTldr) return null

  return (
    <div
      role="dialog"
      aria-label="TL;DR summary"
      className={`fixed bottom-6 right-6 z-50 max-w-[340px] w-[calc(100vw-3rem)] hidden md:block ${
        isClosing ? "animate-spring-slide-down" : "animate-spring-slide-up"
      }`}
    >
      <div className="bg-white/85 dark:bg-[#131316]/90 backdrop-blur-xl backdrop-saturate-150 border border-black/10 dark:border-white/10 rounded-xl p-[18px] shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[13px] font-medium text-black/80 dark:text-white/80 tracking-tight">
            TL;DR Summary
          </span>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss summary"
            className="text-[13px] text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors p-1 -mr-1 cursor-pointer leading-none focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span aria-hidden="true">✕</span>
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
