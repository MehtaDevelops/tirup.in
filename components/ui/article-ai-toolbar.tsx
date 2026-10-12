"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  SelectionToolbar,
  applyFormatToRoot,
  ensureAskHighlightStyle,
  formatsOf,
  wasRecentlyRewritten,
  type Format,
} from "@/components/ui/ai-editor"
import { cn } from "@/lib/utils"

const SETTLE = 250

/**
 * Wraps read-only article HTML and reveals the AI Editor selection toolbar
 * (Ask AI + animated Bold/Italic/Underline/Strikethrough/Code marks) above
 * any passage the reader highlights. The article itself stays read-only:
 * marks are visual-only and vanish on refresh. Nothing is persisted.
 */
export function ArticleAiToolbar({
  children,
  articleTitle,
  className,
}: {
  children: React.ReactNode
  articleTitle?: string
  className?: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const asking = useRef(false)
  const isTouchRef = useRef(false)

  const [at, setAt] = useState<{ x: number; y: number } | null>(null)
  const [askMode, setAskMode] = useState(false)
  const [selection, setSelection] = useState("")
  const [formats, setFormats] = useState<ReadonlySet<Format>>(new Set())
  const [isTouch, setIsTouch] = useState(false)
  const [kbGap, setKbGap] = useState(0)

  const onFormat = useCallback((format: Format) => {
    const root = body.current
    if (!root) return
    const next = applyFormatToRoot(root, format)
    if (next) setFormats(next)
  }, [])

  const enterAskMode = useCallback(() => {
    ensureAskHighlightStyle()
    const sel = window.getSelection()
    if (sel && !sel.isCollapsed) {
      setSelection(sel.toString().slice(0, 2000))
      if ("highlights" in CSS) {
        try {
          CSS.highlights.set("editor-ask", new Highlight(sel.getRangeAt(0).cloneRange()))
        } catch {
          /* Highlight registry unavailable, selection styling falls back to CSS */
        }
      }
    }
    asking.current = true
    setAskMode(true)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse) and (hover: none)")
    const syncTouch = () => {
      isTouchRef.current = mq.matches
      setIsTouch(mq.matches)
    }
    syncTouch()
    mq.addEventListener("change", syncTouch)
    return () => mq.removeEventListener("change", syncTouch)
  }, [])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const syncGap = () =>
      setKbGap(Math.max(0, window.innerHeight - (vv.height + vv.offsetTop)))
    syncGap()
    vv.addEventListener("resize", syncGap)
    vv.addEventListener("scroll", syncGap)
    return () => {
      vv.removeEventListener("resize", syncGap)
      vv.removeEventListener("scroll", syncGap)
    }
  }, [])

  useEffect(() => {
    let timer = 0

    const show = () => {
      const sel = window.getSelection()
      const bodyEl = body.current
      const wrapEl = wrap.current
      if (
        !sel ||
        sel.isCollapsed ||
        !bodyEl ||
        !wrapEl ||
        !bodyEl.contains(sel.anchorNode) ||
        !bodyEl.contains(sel.focusNode)
      ) {
        setAt(null)
        return
      }
      const box = sel.getRangeAt(0).getBoundingClientRect()
      const origin = wrapEl.getBoundingClientRect()
      const rawX = box.left + box.width / 2 - origin.left
      // Clamp the floating anchor so the toolbar never leaves the article.
      const MARGIN = 180
      const x =
        origin.width > MARGIN * 2
          ? Math.min(Math.max(rawX, MARGIN), origin.width - MARGIN)
          : origin.width / 2
      setAt({ x, y: box.top - origin.top })
      setFormats(formatsOf(sel.getRangeAt(0), bodyEl))
    }

    const onSelectionChange = () => {
      const bodyEl = body.current
      if (asking.current || wasRecentlyRewritten(bodyEl)) return
      window.clearTimeout(timer)
      setAt(null)
      // Desktop waits for the drag gesture to end; on touch the OS owns the
      // gesture stream (long-press may never deliver pointerup), so any
      // settled selection summons the bar. The debounce keeps it stable
      // while handles are still being dragged.
      if (!dragging.current || isTouchRef.current) timer = window.setTimeout(show, SETTLE)
    }

    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as Element).closest("[data-editor-toolbar]")) return
      if ("highlights" in CSS) {
        try {
          CSS.highlights.delete("editor-ask")
        } catch {
          /* noop */
        }
      }
      asking.current = false
      setAskMode(false)
      dragging.current = true
      window.clearTimeout(timer)
      setAt(null)
    }

    const onPointerUp = (event: PointerEvent) => {
      if (asking.current || (event.target as Element).closest("[data-editor-toolbar]")) return
      dragging.current = false
      show()
    }

    // Touch: long-press selections materialize after the gesture ends, so
    // re-run show on a delay instead of relying on the desktop drag flow.
    const onTouchEnd = () => {
      if (asking.current) return
      dragging.current = false
      window.clearTimeout(timer)
      timer = window.setTimeout(show, 300)
    }

    const onPointerCancel = () => {
      if (asking.current) return
      dragging.current = false
      window.clearTimeout(timer)
      timer = window.setTimeout(show, 300)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        asking.current = false
        setAskMode(false)
        setAt(null)
      }
    }

    document.addEventListener("selectionchange", onSelectionChange)
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("pointerup", onPointerUp)
    document.addEventListener("pointercancel", onPointerCancel)
    document.addEventListener("touchend", onTouchEnd)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("selectionchange", onSelectionChange)
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("pointerup", onPointerUp)
      document.removeEventListener("pointercancel", onPointerCancel)
      document.removeEventListener("touchend", onTouchEnd)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  const toolbarEl = (
    <SelectionToolbar
      askMode={askMode}
      selection={selection}
      docTitle={articleTitle}
      onAsk={enterAskMode}
      formats={formats}
      onFormat={onFormat}
    />
  )

  return (
    <div ref={wrap} className={cn("article-ai-wrap relative", className)}>
      <div ref={body}>{children}</div>
      {at && !isTouch && (
        <div className="ai-toolbar-anchor absolute z-50" style={{ left: at.x, top: at.y }}>
          <div className="absolute bottom-1.5 left-0 -translate-x-1/2">{toolbarEl}</div>
        </div>
      )}
      {at && isTouch && (
        <div className="ai-touch-bar" style={{ bottom: kbGap }}>
          {toolbarEl}
        </div>
      )}
    </div>
  )
}
