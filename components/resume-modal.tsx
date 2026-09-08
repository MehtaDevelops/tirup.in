"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { X, Download, ExternalLink, FileText, Loader2, TriangleAlert } from "lucide-react"

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
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  // Animated close: play the exit transition first, unmount after.
  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    setEntered(false)
    closeTimer.current = window.setTimeout(onClose, EXIT_MS)
  }, [closing, onClose])

  // Enter transition: mount hidden, then animate in just after paint.
  // A small timeout (instead of rAF) guarantees the browser commits the
  // hidden frame first, so the transition always plays — no open glitch.
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

  // Lock body scroll + close on Escape while open.
  // Hiding the page scrollbar would shift centered content sideways by the
  // scrollbar width — compensate with an exact padding-right so the layout
  // stays pixel-identical behind the popup (open and close).
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

  // Fetch the PDF bytes in code (keeps a blob URL for the Open /
  // Download fallbacks). Rendering happens in the effect below.
  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    let url: string | null = null

    setLoading(true)
    setError(null)
    setObjectUrl(null)
    setPdfData(null)

    fetch(src, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`)
        const type = res.headers.get("content-type") ?? ""
        if (!type.includes("pdf")) throw new Error(`Unexpected content type (${type || "unknown"})`)
        return res.blob()
      })
      .then(async (blob) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setObjectUrl(url)
        setPdfData(await blob.arrayBuffer())
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Could not load the resume file")
        setLoading(false)
      })

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [isOpen, src])

  // Render PDF pages with PDF.js into our own scroll container, so the
  // site's themed scrollbar applies (the browser's built-in PDF viewer
  // draws its own unstyleable scrollbars). pdfjs-dist is dynamically
  // imported so it only loads when the popup opens.
  //
  // Sizing is done by CSS construction, not JS measurement: each canvas
  // is styled width:100%/height:auto so it always fills the container by
  // definition — a wrong measurement can never shrink it again. Only the
  // invisible text-selection overlay needs a post-layout read.
  useEffect(() => {
    if (!isOpen || !entered || !pdfData) return
    const container = scrollerRef.current
    if (!container) return

    let cancelled = false
    let resizeTimer: number | null = null
    let pdfDoc: { cleanup: () => unknown } | null = null
    let observer: ResizeObserver | null = null
    let lastWidth = 0
    let rendering = false
    let dirty = false

    async function renderAll() {
      if (cancelled || !container || rendering) {
        dirty = true
        return
      }
      rendering = true
      dirty = false
      container.innerHTML = ""
      try {
        const pdfjs = await import("pdfjs-dist")
        if (cancelled) return
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

        // getDocument detaches the buffer — copy it so re-renders work.
        const pdf = await pdfjs.getDocument({ data: pdfData!.slice(0) }).promise
        if (cancelled) {
          pdf.cleanup()
          return
        }
        pdfDoc = pdf

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return
          const page = await pdf.getPage(i)
          if (cancelled) return
          const base = page.getViewport({ scale: 1 })

          const pageDiv = document.createElement("div")
          pageDiv.className = "resume-pdf-page"

          const canvas = document.createElement("canvas")
          pageDiv.appendChild(canvas)

          const textDiv = document.createElement("div")
          textDiv.className = "textLayer"
          pageDiv.appendChild(textDiv)
          container.appendChild(pageDiv)

          // Displayed width is final once appended — render the backing
          // store at displayed-size × DPR so pages stay crisp on DPR-1
          // wide screens instead of upscaling a small raster.
          const displayWidth =
            pageDiv.clientWidth ||
            container.clientWidth ||
            base.width
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          const renderViewport = page.getViewport({
            scale: (displayWidth / base.width) * dpr,
          })
          canvas.width = Math.floor(renderViewport.width)
          canvas.height = Math.floor(renderViewport.height)
          // Fill by construction — immune to measurement timing.
          canvas.style.width = "100%"
          canvas.style.height = "auto"

          await page.render({ canvas, viewport: renderViewport }).promise
          if (cancelled) return
          // Overlay measured post-layout, when the width is final.
          const overlayWidth = pageDiv.clientWidth || base.width
          const textViewport = page.getViewport({ scale: overlayWidth / base.width })
          const textLayer = new pdfjs.TextLayer({
            textContentSource: page.streamTextContent(),
            container: textDiv,
            viewport: textViewport,
          })
          await textLayer.render()
          page.cleanup()
        }

        if (!cancelled) setLoading(false)
        rendering = false
        // A resize arrived mid-render — do one trailing pass at the new width.
        if (dirty && !cancelled && container) {
          dirty = false
          lastWidth = container.clientWidth
          renderAll()
        }
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Could not render the resume file")
        setLoading(false)
        rendering = false
      }
    }

    renderAll()
    lastWidth = container.clientWidth

    // Re-render fit-to-width if the container size changes.
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        if (cancelled || !container) return
        if (Math.abs(container.clientWidth - lastWidth) < 2) return
        lastWidth = container.clientWidth
        if (resizeTimer) window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(renderAll, 250)
      })
      observer.observe(container)
    }

    return () => {
      cancelled = true
      observer?.disconnect()
      if (resizeTimer) window.clearTimeout(resizeTimer)
      if (container) container.innerHTML = ""
      try {
        pdfDoc?.cleanup()
      } catch {
        /* ignore */
      }
    }
  }, [isOpen, pdfData, entered])

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
          "rounded-xl bg-[#fafaf9] dark:bg-[#090a0d] border border-black/10 dark:border-white/10 shadow-lg",
          // Opacity + translate only: scaling forces the embedded PDF surface
          // to repaint every frame, which reads as a stutter. transform-gpu
          // keeps the slide on the compositor.
          "transform-gpu will-change-transform transition-[opacity,transform] ease-[cubic-bezier(0.16,1,0.3,1)]",
          shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        {/* ── Header — matches site banner / nav row styling ── */}
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
                Tirup Mehta — preview
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

        {/* ── PDF preview — pages rendered in our own themed scroll container ── */}
        <div className="relative flex-1 min-h-0 bg-zinc-100 dark:bg-zinc-900">
          {/* Scroll container always mounted so the render effect has a target */}
          <div
            ref={scrollerRef}
            className="resume-pdf-scroller absolute inset-0 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6"
          />

          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-black/40 dark:text-white/40 pointer-events-none">
              <Loader2 size={22} className="animate-spin" />
              <p className="text-xs font-light tracking-wide">Loading resume…</p>
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="max-w-sm w-full text-center rounded-xl border border-black/10 dark:border-white/10 bg-[#fafaf9] dark:bg-[#090a0d] px-6 py-8 shadow-sm">
                <span className="mx-auto mb-4 flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60">
                  <TriangleAlert size={18} />
                </span>
                <p className="text-base font-light tracking-tight text-black dark:text-white">
                  Couldn&apos;t load the preview
                </p>
                <p className="mt-1.5 text-xs font-light text-black/50 dark:text-white/50 break-words">
                  {error}
                </p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-[30px] px-4 text-xs font-medium tracking-wide bg-black text-white dark:bg-white dark:text-black rounded-full transition-all duration-150 active:scale-[0.97]"
                  >
                    <ExternalLink size={13} />
                    Open PDF
                  </a>
                  <a
                    href={src}
                    download
                    className="inline-flex items-center gap-1.5 h-[30px] px-4 text-xs font-medium tracking-wide rounded-full border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 active:scale-[0.97]"
                  >
                    <Download size={13} />
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer — fallback + subtle hint ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-black/5 dark:border-white/5 shrink-0">
          <p className="text-[11px] font-light text-black/40 dark:text-white/40 truncate">
            <span className="hidden sm:inline">Having trouble viewing? Open in a new tab or download.</span>
            <span className="sm:hidden">Trouble viewing? Try a new tab.</span>
          </p>
          <a
            href={objectUrl ?? src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-[26px] px-3 text-[11px] font-medium tracking-wide bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 rounded-full text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-all duration-150 select-none cursor-pointer active:scale-[0.97] shrink-0"
          >
            <ExternalLink size={12} />
            <span className="leading-none select-none">Open PDF</span>
          </a>
        </div>
      </div>
    </div>
  )
}
