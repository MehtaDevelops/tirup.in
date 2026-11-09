"use client"

import { useCallback, useEffect, useState } from "react"

interface TldrPopupProps {
  safeTldrHtml: string
}

/**
 * Desktop TL;DR. Starts as a small chip in the bottom-right corner and only
 * opens into the full card when the reader asks for it.
 *
 * It used to slide open by itself two seconds after load, which put a 340px
 * panel on top of the article column at every width below ~1500px: the summary
 * covered the last words of whichever line happened to sit under it. A chip
 * that never touches the text column keeps the summary one click away without
 * damaging the paragraph underneath.
 */
export default function TldrPopup({ safeTldrHtml }: TldrPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const close = useCallback(() => {
    setIsClosing(true)
    window.setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 350)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, close])

  if (!safeTldrHtml) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:flex flex-col items-end">
      {isOpen ? (
        <div
          role="dialog"
          aria-label="TL;DR summary"
          className={`max-w-[340px] w-[calc(100vw-3rem)] ${
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
                type="button"
                onClick={close}
                aria-label="Collapse summary"
                className="text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors p-1 -mr-1 cursor-pointer leading-none"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <div
              className="text-sm font-light leading-relaxed text-black/70 dark:text-white/70"
              dangerouslySetInnerHTML={{ __html: safeTldrHtml }}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          aria-label="Show TL;DR summary"
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/10 dark:border-white/[0.12] px-3 text-[11px] font-medium tracking-tight text-black/60 dark:text-white/60 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.35)] hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20 transition-colors cursor-pointer active:scale-[0.97]"
          style={{
            backgroundColor: "color-mix(in srgb, var(--surface, var(--bg)) 96%, transparent)",
          }}
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tldr-accent)]" />
          TL;DR
        </button>
      )}
    </div>
  )
}
