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
      <div
        className="border border-black/10 dark:border-white/[0.12] rounded-xl p-[18px] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.25)] dark:shadow-[0_16px_50px_-20px_rgba(0,0,0,0.8)]"
        style={{
          // Token surface: dark uses --surface, light/tint fall back to the
          // paper bg, so a tinted page gives the popup a matching ground
          // (raw bg-white/85 stayed plain white on tinted pages).
          backgroundColor: "color-mix(in srgb, var(--surface, var(--bg)) 96%, transparent)",
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium text-black/80 dark:text-white/80 tracking-tight">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tldr-accent)]" />
            TL;DR Summary
          </span>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss summary"
            className="text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors p-1 -mr-1 cursor-pointer leading-none"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        {/* Render as plain text — tldr is never HTML (identical to blogs.tirup.in) */}
        <p className="text-sm font-light leading-relaxed text-black/70 dark:text-white/70 whitespace-pre-line">
          {safeTldrHtml}
        </p>
      </div>
    </div>
  )
}
