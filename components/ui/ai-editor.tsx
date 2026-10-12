"use client"

import {
  ArrowRight,
  Bold,
  Code,
  Italic,
  Strikethrough,
  Underline,
  type LucideIcon,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Orb, type OrbVariant } from "@/components/ui/ai-editor-orb"
import { StreamingText, TextShimmer } from "@/components/ui/ai-editor-shimmer"
import { cn } from "@/lib/utils"

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)"
const SETTLE = 250

export type Format = "bold" | "italic" | "underline" | "strikethrough" | "code"

const FORMATS: ReadonlyArray<{ name: string; format: Format; icon: LucideIcon }> = [
  { name: "Bold", format: "bold", icon: Bold },
  { name: "Italic", format: "italic", icon: Italic },
  { name: "Underline", format: "underline", icon: Underline },
  { name: "Strikethrough", format: "strikethrough", icon: Strikethrough },
  { name: "Code", format: "code", icon: Code },
]

const ARRIVE_MS: Record<Format, number> = {
  bold: 220,
  italic: 220,
  underline: 260,
  strikethrough: 260,
  code: 220,
}

const LEAVE_MS: Record<Format, number> = {
  bold: 160,
  italic: 160,
  underline: 180,
  strikethrough: 180,
  code: 160,
}

const SHORTCUTS: Partial<Record<string, Format>> = { b: "bold", i: "italic", u: "underline" }

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

const rewrites = new WeakMap<Element, number>()

export function wasRecentlyRewritten(root: Element | null, windowMs = 100) {
  if (!root) return false
  return performance.now() - (rewrites.get(root) ?? 0) < windowMs
}

let askHighlightStyleDone = false

/**
 * Injects the ::highlight(editor-ask) paint rule at runtime. It lives here
 * instead of globals.css because the CSS build parser rejects unknown
 * highlight pseudo-elements. Without this rule the registered highlight is
 * invisible, so the passage must stay visibly marked while Ask AI is open.
 */
export function ensureAskHighlightStyle() {
  if (typeof document === "undefined" || askHighlightStyleDone) return
  askHighlightStyleDone = true
  try {
    const el = document.createElement("style")
    el.setAttribute("data-editor-ask-highlight", "")
    el.textContent =
      "::highlight(editor-ask){background:color-mix(in srgb, var(--accent, #7c88e8) 30%, transparent);border-radius:2px;color:inherit;}"
    document.head.appendChild(el)
  } catch {
    /* Style injection unavailable; native selection styling remains. */
  }
}

function offsetsOf(root: HTMLElement) {
  const selection = window.getSelection()
  if (!selection?.rangeCount) return null
  const range = selection.getRangeAt(0)
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null
  const from = (container: Node, offset: number) => {
    const span = document.createRange()
    span.setStart(root, 0)
    span.setEnd(container, offset)
    return span.toString().length
  }
  return {
    start: from(range.startContainer, range.startOffset),
    end: from(range.endContainer, range.endOffset),
  }
}

function restore(root: HTMLElement, offsets: { start: number; end: number } | null) {
  if (!offsets) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let seen = 0
  let started = false
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const length = (node as Text).length
    if (!started && offsets.start <= seen + length) {
      range.setStart(node, offsets.start - seen)
      started = true
    }
    if (started && offsets.end <= seen + length) {
      range.setEnd(node, offsets.end - seen)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      return
    }
    seen += length
  }
}

function keepSelection(root: HTMLElement, rebuild: () => void) {
  const offsets = offsetsOf(root)
  rebuild()
  rewrites.set(root, performance.now())
  restore(root, offsets)
}

function markOf(node: Node, format: Format, root: HTMLElement) {
  const mark = node.parentElement?.closest<HTMLElement>(
    `.editor-mark[data-format="${format}"]:not([data-leaving])`
  )
  return mark && root.contains(mark) ? mark : null
}

function splitText(range: Range, root: HTMLElement) {
  const { startContainer: start, startOffset, endContainer: end, endOffset } = range
  if (end instanceof Text && endOffset < end.length) end.splitText(endOffset)
  if (start instanceof Text && startOffset > 0 && startOffset < start.length) {
    const tail = start.splitText(startOffset)
    range.setStart(tail, 0)
    if (end === start) range.setEnd(tail, tail.length)
  }
  return textWithin(range, root)
}

function textWithin(range: Range, root: HTMLElement, partly = false) {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text
    if (!text.length) continue
    const inside = partly
      ? range.intersectsNode(text) &&
        !(range.startContainer === text && range.startOffset === text.length) &&
        !(range.endContainer === text && range.endOffset === 0)
      : range.comparePoint(text, 0) === 0 && range.comparePoint(text, text.length) === 0
    if (inside) nodes.push(text)
  }
  return nodes
}

export function formatsOf(range: Range, root: HTMLElement) {
  const nodes = textWithin(range, root, true)
  return new Set(
    FORMATS.map(({ format }) => format).filter(
      (format) => nodes.length > 0 && nodes.every((node) => markOf(node, format, root))
    )
  )
}

function unwrap(element: Element) {
  const parent = element.parentNode
  if (!parent) return
  while (element.firstChild) parent.insertBefore(element.firstChild, element)
  parent.removeChild(element)
}

function textsIn(element: Element) {
  const texts: Text[] = []
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode())
    if ((node as Text).length) texts.push(node as Text)
  return texts
}

function markRuns(nodes: Text[], format: Format) {
  const covered = new Set<Node>(nodes)
  const units: Node[] = []
  for (const node of nodes) {
    let unit: Node = node
    for (
      let parent = unit.parentElement;
      parent?.matches(".editor-mark, .editor-word") &&
      textsIn(parent).every((text) => covered.has(text));
      parent = unit.parentElement
    )
      unit = parent
    if (units.at(-1) !== unit) units.push(unit)
  }
  const marks: HTMLElement[] = []
  let run: Node[] = []
  const close = () => {
    const first = run[0]
    if (!first) return
    const mark = document.createElement("span")
    mark.className = "editor-mark"
    mark.dataset.format = format
    first.parentNode?.insertBefore(mark, first)
    for (const unit of run) mark.appendChild(unit)
    marks.push(mark)
    run = []
  }
  for (const unit of units) {
    if (run.length && run.at(-1)?.nextSibling !== unit) close()
    run.push(unit)
  }
  close()
  return marks
}

function isolate(mark: HTMLElement, first: Node, last: Node) {
  const head = document.createRange()
  head.setStart(mark, 0)
  head.setEndBefore(first)
  if (!head.collapsed) {
    const piece = mark.cloneNode(false) as HTMLElement
    piece.appendChild(head.extractContents())
    if (piece.textContent) mark.parentNode?.insertBefore(piece, mark)
  }
  const tail = document.createRange()
  tail.setStartAfter(last)
  tail.setEnd(mark, mark.childNodes.length)
  if (!tail.collapsed) {
    const piece = mark.cloneNode(false) as HTMLElement
    piece.appendChild(tail.extractContents())
    if (piece.textContent) mark.parentNode?.insertBefore(piece, mark.nextSibling)
  }
}

function slantWords(mark: HTMLElement) {
  const walker = document.createTreeWalker(mark, NodeFilter.SHOW_TEXT)
  const texts: Text[] = []
  for (let node = walker.nextNode(); node; node = walker.nextNode()) texts.push(node as Text)
  for (const text of texts) {
    const parts = text.data.split(/(\s+)/).filter(Boolean)
    if (parts.length === 1 && /\s/.test(parts[0] ?? "")) continue
    const fragment = document.createDocumentFragment()
    for (const part of parts) {
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part))
        continue
      }
      const word = document.createElement("span")
      word.className = "editor-word"
      word.textContent = part
      fragment.appendChild(word)
    }
    text.parentNode?.replaceChild(fragment, text)
  }
}

function unslantWords(mark: HTMLElement) {
  for (const word of mark.querySelectorAll(".editor-word")) unwrap(word)
  mark.normalize()
}

function boldSpacing(mark: HTMLElement) {
  const text = mark.textContent ?? ""
  if (!text.length) return 0
  const probe = document.createElement("span")
  probe.textContent = text
  probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font-weight:400"
  mark.parentNode?.insertBefore(probe, mark.nextSibling)
  const regular = probe.getBoundingClientRect().width
  probe.style.fontWeight = "700"
  const bold = probe.getBoundingClientRect().width
  probe.parentNode?.removeChild(probe)
  return (bold - regular) / text.length
}

function drawInTurn(marks: HTMLElement[], format: Format) {
  if (marks.length < 2 || (format !== "underline" && format !== "strikethrough")) return
  const widths = marks.map((mark) =>
    [...mark.getClientRects()].reduce((sum, box) => sum + box.width, 0)
  )
  const total = widths.reduce((sum, width) => sum + width, 0) || 1
  let before = 0
  marks.forEach((mark, index) => {
    const width = widths[index] ?? 0
    mark.style.transitionDelay = `${String((ARRIVE_MS[format] * before) / total)}ms`
    mark.style.transitionDuration = `${String((ARRIVE_MS[format] * width) / total)}ms`
    mark.style.transitionTimingFunction = "linear"
    before += width
  })
}

function instantly(mark: HTMLElement, instant: boolean) {
  if (!instant) return
  mark.dataset.instant = ""
  window.requestAnimationFrame(() => delete mark.dataset.instant)
}

function inFrame(mark: HTMLElement, ms: number, change: () => void) {
  if (ms) {
    window.requestAnimationFrame(() => window.requestAnimationFrame(change))
    return
  }
  change()
  void mark.offsetWidth
}

function arrive(mark: HTMLElement, format: Format, instant: boolean) {
  const ms = prefersReducedMotion() || instant ? 0 : ARRIVE_MS[format]
  instantly(mark, instant)
  if (format === "bold")
    mark.style.setProperty("--editor-bold-spacing", `${String(boldSpacing(mark))}px`)
  if (format === "italic") slantWords(mark)
  void mark.offsetWidth
  inFrame(mark, ms, () => {
    mark.dataset.on = ""
    if (format === "code") blurSwap(mark, ms, true)
    window.setTimeout(() => {
      mark.style.removeProperty("transition-delay")
      mark.style.removeProperty("transition-duration")
      mark.style.removeProperty("transition-timing-function")
    }, ms + 50)
  })
}

function leave(mark: HTMLElement, format: Format, root: HTMLElement, instant: boolean) {
  const ms = prefersReducedMotion() || instant ? 0 : LEAVE_MS[format]
  instantly(mark, instant)
  mark.dataset.leaving = ""
  void mark.offsetWidth
  inFrame(mark, ms, () => {
    delete mark.dataset.on
    if (format === "code") blurSwap(mark, ms, false)
    window.setTimeout(() => {
      if (!mark.isConnected) return
      keepSelection(root, () => {
        if (format === "italic") unslantWords(mark)
        const parent = mark.parentNode
        unwrap(mark)
        parent?.normalize()
      })
    }, ms + 50)
  })
}

function blurSwap(mark: HTMLElement, ms: number, mono: boolean) {
  if (!ms) {
    if (mono) mark.dataset.mono = ""
    else delete mark.dataset.mono
    return
  }
  mark.animate(
    { filter: ["blur(0px)", "blur(2px)", "blur(0px)"], opacity: [1, 0.55, 1] },
    { duration: ms, easing: "ease-in-out" }
  )
  window.setTimeout(() => {
    if (mono) mark.dataset.mono = ""
    else delete mark.dataset.mono
  }, ms / 2)
}

const SOURCES = ["wikipedia.org", "duckduckgo.com"]

const STAGES = {
  understanding: { label: "Understanding the context", orb: "S3" },
  gathering: { label: "Gathering sources", orb: "S2" },
} as const satisfies Record<string, { label: string; orb: OrbVariant }>

const ANSWER_WORD_MS = 28

/**
 * Applies a format to the current selection inside any container element.
 * Shared by the demo Editor and the read-only article toolbar, so both
 * produce identical animated marks. Returns the active format set, or null
 * when there is no usable selection inside `root`.
 */
export function applyFormatToRoot(
  root: HTMLElement,
  format: Format,
  instant = false
): ReadonlySet<Format> | null {
  const sel = window.getSelection()
  if (!sel?.rangeCount || sel.isCollapsed) return null
  const range = sel.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return null
  const offsets = offsetsOf(root)

  const nodes = splitText(range, root)
  const first = nodes[0]
  const last = nodes.at(-1)
  if (!first || !last) return null
  if (nodes.every((node) => markOf(node, format, root))) {
    const owners = new Map<HTMLElement, Text[]>()
    for (const node of nodes) {
      const mark = markOf(node, format, root)
      if (mark) owners.set(mark, [...(owners.get(mark) ?? []), node])
    }
    for (const [mark, inside] of owners) {
      isolate(mark, inside[0] ?? first, inside.at(-1) ?? last)
      leave(mark, format, root, instant)
    }
  } else {
    const marks = markRuns(
      nodes.filter((node) => !markOf(node, format, root)),
      format
    )
    if (!instant) drawInTurn(marks, format)
    for (const mark of marks) arrive(mark, format, instant)
  }

  rewrites.set(root, performance.now())
  restore(root, offsets)
  if (sel.rangeCount) return formatsOf(sel.getRangeAt(0), root)
  return null
}

export function Editor({
  title,
  children,
  className,
}: {
  title?: string
  children: string
  className?: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const prose = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const asking = useRef(false)

  const [at, setAt] = useState<{ x: number; y: number } | null>(null)
  const [askMode, setAskMode] = useState(false)
  const [selection, setSelection] = useState("")
  const [formats, setFormats] = useState<ReadonlySet<Format>>(new Set())

  const applyFormat = useCallback((format: Format, instant = false) => {
    const root = prose.current
    if (!root) return
    const next = applyFormatToRoot(root, format, instant)
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
    let timer = 0

    const show = () => {
      const sel = window.getSelection()
      const proseEl = prose.current
      const wrapEl = wrap.current
      if (
        !sel ||
        sel.isCollapsed ||
        !proseEl ||
        !wrapEl ||
        !proseEl.contains(sel.anchorNode) ||
        !proseEl.contains(sel.focusNode)
      ) {
        setAt(null)
        return
      }
      const box = sel.getRangeAt(0).getBoundingClientRect()
      const origin = wrapEl.getBoundingClientRect()
      setAt({ x: box.left + box.width / 2 - origin.left, y: box.top - origin.top })
      setFormats(formatsOf(sel.getRangeAt(0), proseEl))
    }

    const onSelectionChange = () => {
      const proseEl = prose.current
      if (asking.current || (proseEl && performance.now() - (rewrites.get(proseEl) ?? 0) < 100))
        return
      window.clearTimeout(timer)
      setAt(null)
      if (!dragging.current) timer = window.setTimeout(show, SETTLE)
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
    document.addEventListener("pointercancel", onPointerUp)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("selectionchange", onSelectionChange)
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("pointerup", onPointerUp)
      document.removeEventListener("pointercancel", onPointerUp)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <div ref={wrap} className={cn("relative", className)}>
      <div
        ref={prose}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        role="textbox"
        aria-multiline="true"
        aria-label={title ?? "Document"}
        dir="auto"
        onKeyDown={(event) => {
          if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
          const format = SHORTCUTS[event.key.toLowerCase()]
          if (!format) return
          event.preventDefault()
          applyFormat(format, true)
        }}
        className="ai-editor-prose outline-none"
      >
        {title ? <h3 className="ai-editor-title">{title}</h3> : null}
        <p className={cn("ai-editor-body", title && "ai-editor-body-spaced")}>{children}</p>
      </div>

      {at && (
        <div className="ai-toolbar-anchor absolute z-50" style={{ left: at.x, top: at.y }}>
          <div className="absolute bottom-1.5 left-0 -translate-x-1/2">
            <SelectionToolbar
              askMode={askMode}
              selection={selection}
              onAsk={enterAskMode}
              formats={formats}
              onFormat={(format) => applyFormat(format)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function SelectionToolbar({
  askMode,
  selection,
  docTitle,
  onAsk,
  formats,
  onFormat,
}: {
  askMode: boolean
  selection: string
  docTitle?: string
  onAsk: () => void
  formats: ReadonlySet<Format>
  onFormat: (format: Format) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const [isRtl] = useState(
    () => typeof document !== "undefined" && document.dir === "rtl"
  )

  const [query, setQuery] = useState<string | null>(null)
  const [stage, setStage] = useState<keyof typeof STAGES>("understanding")
  const [answer, setAnswer] = useState("")
  const [answering, setAnswering] = useState(false)
  const [shown, setShown] = useState(0)
  const [height, setHeight] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const words = answer ? answer.split(" ") : []
  const reduceMotion = prefersReducedMotion()
  const side = isRtl ? -1 : 1

  useEffect(() => {
    const element = panel.current
    if (!element) return
    const observer = new ResizeObserver(() => setHeight(element.offsetHeight))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const t of pending) window.clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!answering || shown >= words.length) return
    const timer = window.setTimeout(() => setShown((count) => count + 1), ANSWER_WORD_MS)
    return () => window.clearTimeout(timer)
  }, [answering, shown, words.length])

  const submit = () => {
    const value = input.current?.value.trim()
    if (!value || query) return
    setQuery(value)
    setError(null)
    setStage("understanding")
    input.current?.blur()

    const toGathering = window.setTimeout(() => setStage("gathering"), 1400)
    timers.current.push(toGathering)

    fetch("/api/ai-editor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selection: selection.slice(0, 2000), query: value.slice(0, 500), docTitle: (docTitle || "").slice(0, 300) }),
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as { answer?: string; error?: string } | null
        if (!res.ok) throw new Error(data?.error || `Request failed (${String(res.status)})`)
        const text = (data?.answer || "").trim()
        if (!text) throw new Error("Empty response from the model.")
        for (const t of timers.current) window.clearTimeout(t)
        setAnswer(text)
        setShown(0)
        setAnswering(true)
      })
      .catch((err: unknown) => {
        for (const t of timers.current) window.clearTimeout(t)
        setError(err instanceof Error ? err.message : "Something went wrong.")
      })
  }

  const reset = () => {
    for (const t of timers.current) window.clearTimeout(t)
    setQuery(null)
    setAnswer("")
    setAnswering(false)
    setShown(0)
    setError(null)
    setStage("understanding")
    window.setTimeout(() => input.current?.focus({ preventScroll: true }), 50)
  }

  const expanded = askMode || query !== null

  return (
    <div
      role="toolbar"
      aria-label="Selection"
      data-editor-toolbar
      onMouseDown={(event) => {
        if ((event.target as HTMLElement).tagName !== "INPUT") event.preventDefault()
      }}
      className="ai-toolbar group flex origin-bottom scale-90 flex-col overflow-hidden rounded-[22px] border whitespace-nowrap shadow-lg"
    >
      <div className="relative flex items-center gap-1 p-1.5">
        <button
          type="button"
          onClick={() => {
            if (askMode) return
            onAsk()
            window.setTimeout(() => input.current?.focus({ preventScroll: true }), 50)
          }}
          aria-label="Ask AI"
          className={cn(
            "flex h-8 shrink-0 items-center gap-1.5 rounded-full ps-1.5 pe-2.5 text-sm font-medium transition-colors",
            expanded && "pointer-events-none"
          )}
        >
          <span data-stirring={askMode || undefined} className="editor-orb size-5 shrink-0" />
          <span
            className={cn(
              "transition-all duration-300",
              expanded ? "pointer-events-none -translate-x-2 opacity-0 blur-[2px]" : "translate-x-0 opacity-100"
            )}
          >
            Ask AI
          </span>
        </button>

        <div
          className={cn(
            "mx-1 h-5 w-px shrink-0 transition-opacity",
            expanded ? "pointer-events-none opacity-0" : "opacity-100"
          )}
        />

        {FORMATS.map(({ name, format, icon: Icon }) => (
          <button
            key={name}
            type="button"
            aria-label={name}
            aria-pressed={formats.has(format)}
            onClick={() => onFormat(format)}
            className={cn(
              "ai-format-btn flex size-8 shrink-0 items-center justify-center rounded-full transition-all",
              expanded ? "pointer-events-none -translate-x-2 opacity-0" : "translate-x-0 opacity-100"
            )}
          >
            <Icon className="size-[1.125rem]" strokeWidth={1.8} />
          </button>
        ))}

        {askMode && query === null && (
          <div className="ai-toolbar-swap absolute inset-y-1.5 start-10 end-1.5 flex items-center gap-1">
            <input
              ref={input}
              type="text"
              dir="auto"
              aria-label="Ask about the selection"
              placeholder="Ask anything"
              maxLength={500}
              onKeyDown={(event) => event.key === "Enter" && submit()}
              className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="button"
              aria-label="Send"
              onClick={submit}
              className="ai-send-btn flex size-8 shrink-0 items-center justify-center rounded-full"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {query !== null && (
          <div className="ai-toolbar-swap absolute inset-y-1.5 start-10 end-3 flex items-center overflow-hidden text-sm font-medium">
            <button
              type="button"
              onClick={reset}
              title="Ask another question"
              className="truncate text-left"
            >
              <span dir="auto" className="truncate">
                {query}
              </span>
            </button>
          </div>
        )}
      </div>

      <div
        className="overflow-hidden transition-[height] duration-300"
        style={{
          height,
          transitionTimingFunction: EASE,
          transitionDuration: reduceMotion ? "0ms" : "300ms",
        }}
      >
        <div ref={panel} className="relative">
          {query && !answering && !error && (
            <div className="ai-answer-panel ai-toolbar-swap flex items-center gap-1 border-t px-3 py-2.5">
              <Orb
                key={STAGES[stage].orb}
                variant={STAGES[stage].orb}
                label={STAGES[stage].label}
                className="shrink-0"
              />
              <span key={stage} className="ai-toolbar-swap inline-block text-sm">
                <TextShimmer duration={1.5}>{`${STAGES[stage].label}...`}</TextShimmer>
              </span>
              <div className="ms-auto flex items-center ps-2">
                {stage === "gathering" &&
                  SOURCES.map((domain, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={domain}
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                      alt={domain}
                      style={{
                        animationDelay: `${String(index * 80)}ms`,
                        ["--ai-from-x" as string]: `${String(10 * side)}px`,
                      }}
                      className="ai-source-icon -ms-2 size-5 rounded-full first:ms-0"
                    />
                  ))}
              </div>
            </div>
          )}

          {query && error && (
            <div className="ai-answer-panel ai-toolbar-swap border-t px-3.5 py-3">
              <p dir="auto" className="max-w-xs text-[13px] leading-relaxed whitespace-normal">
                {error === "AI_NOT_CONFIGURED"
                  ? "AI is not configured yet. Set AI_API_KEY (Groq) on the server to enable answers."
                  : error}
              </p>
              <button
                type="button"
                onClick={reset}
                className="ai-retry-btn mt-2 rounded-full px-3 py-1 text-xs font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {answering && (
            <div className="ai-answer-panel ai-toolbar-swap min-h-[41px] border-t px-3.5 py-3">
              <p
                dir="auto"
                className="max-w-xs text-[15px] leading-relaxed whitespace-normal"
              >
                <StreamingText>{words.slice(0, shown).join(" ")}</StreamingText>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
