"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { X, Download, ExternalLink, FileText, Loader2 } from "lucide-react"

interface ResumeModalProps {
  isOpen: boolean
  onClose: () => void
  src?: string
}

const RESUME_SRC = "/Resume_Tirup_Mehta.pdf"

// Timings mirror the site's route transitions (240ms in / 180ms out)
// with the shared spring curve cubic-bezier(0.16,1,0.3,1).
const ENTER_MS = 260
const EXIT_MS = 180

export default function ResumeModal({ isOpen, onClose, src = RESUME_SRC }: ResumeModalProps) {
  const [loading, setLoading] = useState(false)
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // Animated close: play the exit transition first, unmount after.
  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    setEntered(false)
    closeTimer.current = window.setTimeout(onClose, EXIT_MS)
  }, [closing, onClose])

  // Enter transition: mount hidden, then animate in just after paint.
  useEffect(() => {
    if (!isOpen) return
    setClosing(false)
    setEntered(false)
    const id = window.setTimeout(() => setEntered(true), 30)
    return () => {
      window.clearTimeout(id)
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current)
        closeTimer.current = null
      }
    }
  }, [isOpen])

  // Reset loading whenever the modal (re)opens.
  useEffect(() => {
    if (isOpen) setLoading(true)
  }, [isOpen])

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }

    document.addEventListener("keydown", onKeyDown)
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = "hidden"
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const shown = entered && !closing

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Resume preview"
      onClick={handleClose}
      style={{ transitionDuration: `${closing ? EXIT_MS : ENTER_MS}ms` }}
      className={[
        "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6",
        "bg-black/50 backdrop-blur-sm",
        "transition-opacity ease-[cubic-bezier(0.16,1,0.3,1)]",
        shown ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ transitionDuration: `${closing ? EXIT_MS : ENTER_MS}ms` }}
        className={[
          "relative flex flex-col w-full max-w-4xl h-[85dvh] max-h-[860px] overflow-hidden",
          "rounded-xl bg-[#fdfdfc] dark:bg-[#0a0a0b] border border-black/10 dark:border-white/10 shadow-lg",
          "transform-gpu will-change-transform transition-[opacity,transform] ease-[cubic-bezier(0.16,1,0.3,1)]",
          shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        {/* ── Header: matches site banner / nav row styling ── */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-5 py-3.5 border-b border-black/5 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-black/60 dark:text-white/60 shrink-0">
              <FileText size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-base font-light tracking-tight text-black dark:text-white leading-none truncate">
                Resume
              </p>
              <p className="mt-1 text-[11px] font-light tracking-wide text-black/50 dark:text-white/50 leading-none truncate">
                Tirup Mehta resume preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              className="flex items-center justify-center w-8 h-8 rounded-full text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer active:scale-[0.97]"
            >
              <ExternalLink size={15} />
            </a>
            <a
              href={src}
              download
              title="Download PDF"
              className="flex items-center justify-center w-8 h-8 rounded-full text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer active:scale-[0.97]"
            >
              <Download size={15} />
            </a>
            <button
              onClick={handleClose}
              aria-label="Close resume preview"
              className="group flex items-center justify-center w-8 h-8 rounded-full text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer active:scale-[0.97]"
            >
              <X size={15} className="transition-transform duration-200 group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {/* ── PDF preview: native browser viewer (perfect text selection) ── */}
        <div className="relative flex-1 min-h-0 bg-[var(--bg)] dark:bg-zinc-900">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-black/40 dark:text-white/40 pointer-events-none z-10">
              <Loader2 size={22} className="animate-spin" />
              <p className="text-xs font-light tracking-wide">Loading resume…</p>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={src}
            title="Resume preview"
            onLoad={() => setLoading(false)}
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        {/* ── Footer: fallback + subtle hint ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-black/5 dark:border-white/5 shrink-0">
          <p className="text-[11px] font-light text-black/40 dark:text-white/40 truncate">
            <span className="hidden sm:inline">Having trouble viewing? Open in a new tab or download.</span>
            <span className="sm:hidden">Trouble viewing? Try a new tab.</span>
          </p>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-[26px] px-3 text-[11px] font-medium tracking-wide bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 hover:border-black/10 dark:border-white/10 rounded-full text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-all duration-150 select-none cursor-pointer active:scale-[0.97] shrink-0"
          >
            <ExternalLink size={12} />
            <span className="leading-none select-none">Open PDF</span>
          </a>
        </div>
      </div>
    </div>
  )
}
