"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { X, Download, ExternalLink, FileText, Loader2 } from "lucide-react"

interface ResumeModalProps {
  isOpen: boolean
  onClose: () => void
  src?: string
}

const RESUME_SRC = "/Resume_Tirup_Mehta.pdf"

// Phones and tablets get page images instead of an embedded PDF: iOS Safari
// renders a blank iframe for PDFs (or only the first page) and Android Chrome
// has no inline PDF viewer at all. These WebP pages are rasterised from
// public/Resume_Tirup_Mehta.pdf, so regenerate them whenever that file changes.
const RESUME_PAGES = ["/resume/resume-1.webp", "/resume/resume-2.webp"]

// Timings mirror the site's route transitions (240ms in / 180ms out)
// with the shared spring curve cubic-bezier(0.16,1,0.3,1).
const ENTER_MS = 260
const EXIT_MS = 180

export default function ResumeModal({ isOpen, onClose, src = RESUME_SRC }: ResumeModalProps) {
  const [loading, setLoading] = useState(false)
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [pagesLoaded, setPagesLoaded] = useState(0)
  const [pagesFailed, setPagesFailed] = useState(false)
  const closeTimer = useRef<number | null>(null)

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
    if (!isOpen) return
    setLoading(true)
    setPagesLoaded(0)
    setPagesFailed(false)
  }, [isOpen])

  // Detect touch devices once. The query also matches landscape phones and
  // iPads, whose viewports are wider than the mobile breakpoint but still
  // cannot render a PDF inside an iframe.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)")
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // Page images are progressively loaded: hide the spinner once all of them
  // have decoded (or as soon as one fails and the fallback shows).
  useEffect(() => {
    if (isMobile && !pagesFailed && pagesLoaded >= RESUME_PAGES.length) {
      setLoading(false)
    }
  }, [isMobile, pagesFailed, pagesLoaded])

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
        "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6",
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
          "rounded-xl bg-[#fdfdfc] dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 shadow-lg",
          "transform-gpu will-change-transform transition-[opacity,transform] ease-[cubic-bezier(0.16,1,0.3,1)]",
          shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        {/* ── Header ── */}
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

        {/* ── PDF preview: page images on touch devices, native viewer on desktop ── */}
        <div className="relative flex-1 min-h-0 overflow-hidden bg-[#f1f1f1] dark:bg-[#323639]">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-black/40 dark:text-white/40 pointer-events-none">
              <Loader2 size={22} className="animate-spin" />
              <p className="text-xs font-light tracking-wide">Loading resume…</p>
            </div>
          )}

          {isMobile ? (
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain">
              {pagesFailed ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <p className="text-sm font-light text-black/70 dark:text-white/70">
                    Preview is unavailable on this device.
                  </p>
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-[30px] px-4 text-xs font-medium tracking-wide bg-black text-white dark:bg-white dark:text-black rounded-full transition-all duration-150 active:scale-[0.97]"
                  >
                    <ExternalLink size={13} />
                    <span className="leading-none select-none">Open PDF</span>
                  </a>
                </div>
              ) : (
                <div className="flex flex-col">
                  {RESUME_PAGES.map((page, i) => (
                    <img
                      key={page}
                      src={page}
                      width={1700}
                      height={2406}
                      alt={`Resume page ${i + 1} of ${RESUME_PAGES.length}`}
                      decoding="async"
                      onLoad={() => setPagesLoaded((n) => n + 1)}
                      onError={() => {
                        setPagesFailed(true)
                        setLoading(false)
                      }}
                      className="block w-full h-auto bg-white"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <iframe
              src={`${src}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              title="Resume preview"
              onLoad={() => setLoading(false)}
              // On desktop the browser's PDF viewer draws its own scrollbar and a
              // dark gutter around the page, and ignores scrollbar=0. The frame is
              // made slightly larger than the box and clipped by it, so only the
              // page shows; wheel, keyboard and touch scrolling still work.
              className="absolute inset-0 w-full h-full border-0 md:inset-auto md:-left-2 md:-top-[6px] md:w-[calc(100%+32px)] md:h-[calc(100%+12px)]"
            />
          )}
        </div>

        {/* ── Footer ── */}
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
