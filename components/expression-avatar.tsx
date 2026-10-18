"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

// ---------------------------------------------------------------------------
// ExpressionAvatar: pixel avatar that reacts to visitor behaviour.
//
// Design goals: professional, well-behaved, eye-pleasing.
//  - One steady "base" expression per route (context-aware, never random),
//    with a late-night override: after 11pm the home base gets sleepy.
//  - Transient reactions acknowledge an action, then hand back to base.
//  - A single revert timer + reaction token means rapid clicks can never
//    stack timers or flicker between faces.
//  - Every change fades through the circle background (clean white
//    dissolve): quick 220ms pop for reactions, slow 700ms for section
//    changes.
//  - Alive but calm: looks up during fast scrolls, greets with coffee in
//    the morning, adjusts its glasses when left alone, and blinks.
//  - Idle / tab-away states are sticky until the visitor returns.
//  - prefers-reduced-motion (or coarse pointers) disables the ambient life.
// ---------------------------------------------------------------------------

type Expr =
  | "neutral"
  | "smile"
  | "laugh"
  | "polished"
  | "cool"
  | "thinking"
  | "confused"
  | "surprised"
  | "sleepy"
  | "working"
  | "excited"
  | "waving"
  | "adjusting"
  | "lookup"
  | "drinking"
  | "headphones"

const SRC: Record<Expr, string> = {
  neutral: "/expressions/01-neutral.webp",
  smile: "/expressions/02-smile.webp",
  laugh: "/expressions/03-laugh.webp",
  polished: "/expressions/04-polished.webp",
  cool: "/expressions/05-cool-sunglasses.webp",
  thinking: "/expressions/06-thinking.webp",
  confused: "/expressions/07-confused.webp",
  surprised: "/expressions/09-surprised.webp",
  sleepy: "/expressions/11-sleepy.webp",
  working: "/expressions/14-working-laptop.webp",
  excited: "/expressions/15-excited.webp",
  waving: "/expressions/20-waving.webp",
  adjusting: "/expressions/19-adjusting-glasses.webp",
  lookup: "/expressions/16-looking-up.webp",
  drinking: "/expressions/13-drinking.webp",
  headphones: "/expressions/17-headphones.webp",
}

// Likely faces, warmed only once the browser is idle so first paint never
// competes with them. Anything else loads on demand via Next's optimizer.
const WARM: Expr[] = ["adjusting", "smile", "waving", "laugh", "lookup", "drinking"]

// Faces 06+ have a slightly cut bottom edge in the source art: shifting
// them down a few pixels tucks the cut behind the circle's bottom edge.
// 01–05 (neutral, smile, laugh, polished, cool) sit flush already.
const NUDGE_DOWN: ReadonlySet<Expr> = new Set([
  "thinking",
  "confused",
  "surprised",
  "sleepy",
  "working",
  "excited",
  "waving",
  "adjusting",
  "lookup",
  "drinking",
  "headphones",
])

const isNightHour = (h: number) => h >= 23 || h < 5
const isMorningHour = (h: number) => h >= 5 && h < 11

function baseForPath(pathname: string | null, hour: number | null): Expr {
  const p = pathname ?? "/"
  // Late-night override: the home face gets sleepy. Everywhere else the
  // section context wins: work stays working, even at 2am.
  if (hour !== null && isNightHour(hour) && p === "/") return "sleepy"
  if (p.startsWith("/work") || p.startsWith("/projects")) return "working"
  if (p.startsWith("/writing")) return "thinking"
  if (p.startsWith("/skills")) return "polished"
  if (p.startsWith("/contact")) return "waving"
  if (p.startsWith("/about")) return "smile"
  if (p.startsWith("/github")) return "excited"
  return "adjusting" // home default
}

function preload(list: Expr[]) {
  for (const e of list) {
    const img = new window.Image()
    img.decoding = "async"
    img.src = SRC[e]
  }
}

const IDLE_MS = 60_000
const NIGHT_IDLE_MS = 25_000
const CLICK_DEBOUNCE_MS = 400
const SCROLL_BURST = 750 // accumulated px inside the window = "fast scroll"
const SCROLL_WINDOW_MS = 250

export default function ExpressionAvatar({
  size = 56,
  interactive = true,
  face,
}: {
  /** Circle diameter in px. Header uses 56; breadcrumbs use 20. */
  size?: number
  /** Only the header instance is interactive: minis are quiet faces that
      still follow the route, so document listeners never double-register. */
  interactive?: boolean
  /** Fixed expression (e.g. "laugh" on article pages). Overrides the
      route base everywhere: initial face, reverts, and route changes. */
  face?: Expr
}) {
  const pathname = usePathname()
  const [hour, setHour] = useState<number | null>(null)
  const base = face ?? baseForPath(pathname, hour)

  const [expr, setExpr] = useState<Expr>(base)
  const rootRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reactionId = useRef(0)
  const sticky = useRef(false) // sleepy / hover / selection hold the face
  const lastClickReact = useRef(0)
  const lastLookup = useRef(0)
  const lastReactionAt = useRef(0)
  const clickCount = useRef(0)
  const firstRoute = useRef(true)
  const slowNext = useRef(false) // route changes dissolve slowly, never pop
  const hourRef = useRef<number | null>(null)
  const baseRef = useRef<Expr>(base)
  baseRef.current = base

  const clearRevert = useCallback(() => {
    if (revertTimer.current) clearTimeout(revertTimer.current)
    revertTimer.current = null
  }, [])

  // Show a face. holdMs omits the auto-revert (sticky); otherwise the face
  // hands back to the route base after holdMs. Stale timers can't override
  // newer reactions thanks to the token check.
  const show = useCallback(
    (next: Expr, holdMs?: number) => {
      reactionId.current += 1
      const id = reactionId.current
      lastReactionAt.current = Date.now()
      clearRevert()
      sticky.current = holdMs === undefined
      setExpr(next)
      if (holdMs !== undefined) {
        revertTimer.current = setTimeout(() => {
          if (reactionId.current !== id) return
          sticky.current = false
          setExpr(baseRef.current)
        }, holdMs)
      }
    },
    [clearRevert],
  )

  const settle = useCallback(() => {
    sticky.current = false
    show(baseRef.current)
  }, [show])

  // ── Greeting + clock + idle warm ─────────────────────────────────────
  // Nothing extra is fetched during initial load: the base face renders
  // through Next's optimizer first. The wave waits 900ms so LCP settles
  // and only one image is ever in flight at startup: and it is skipped
  // entirely if the visitor already interacted. Likely faces warm up only
  // when the browser reports idle (or 5s fallback).
  // Minis skip all of this; the interactive instance owns it.
  useEffect(() => {
    if (!interactive) return
    const h = new Date().getHours()
    hourRef.current = h
    setHour(h)
    // Greet only once per session: the landing page says hi, later route
    // changes (/work, /skills, …) mount a fresh avatar that stays quiet.
    let greeted = false
    try {
      greeted = sessionStorage.getItem("avatar-greeted") === "1"
    } catch { /* ignore */ }
    const greetTimer = setTimeout(() => {
      if (reactionId.current === 0 && !greeted) {
        try { sessionStorage.setItem("avatar-greeted", "1") } catch { /* ignore */ }
        show(isMorningHour(h) ? "drinking" : "waving", 2200)
      }
    }, 900)
    const warm = () => preload(WARM)
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    let idleId: number | null = null
    let fallback: ReturnType<typeof setTimeout> | null = null
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(warm, { timeout: 5000 })
    } else {
      fallback = setTimeout(warm, 4000)
    }
    return () => {
      clearTimeout(greetTimer)
      if (idleId !== null) w.cancelIdleCallback?.(idleId)
      if (fallback) clearTimeout(fallback)
      clearRevert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Route (or nightfall) change: slow dissolve to the new base ────────
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false
      return
    }
    slowNext.current = true
    show(baseRef.current)
    sticky.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, base])

  // Consume the slow flag after the render it was set for.
  useEffect(() => {
    slowNext.current = false
  })

  // ── Global behaviour listeners (interactive instance only) ───────────
  useEffect(() => {
    if (!interactive) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const ambient = !reduced && finePointer
    let idleTimer: ReturnType<typeof setTimeout> | null = null
    let microTimer: ReturnType<typeof setTimeout> | null = null

    const clearIdleTimers = () => {
      if (idleTimer) clearTimeout(idleTimer)
      if (microTimer) clearTimeout(microTimer)
      idleTimer = null
      microTimer = null
    }

    const armIdle = () => {
      clearIdleTimers()
      const budget = hourRef.current !== null && isNightHour(hourRef.current) ? NIGHT_IDLE_MS : IDLE_MS
      // Left alone a while: adjust glasses once, a small alive moment.
      microTimer = setTimeout(() => {
        if (!sticky.current && !document.hidden) show("adjusting", 2200)
      }, Math.round(budget * 0.66))
      // Left alone longer: fall asleep until the visitor returns.
      idleTimer = setTimeout(() => {
        reactionId.current += 1
        sticky.current = true
        clearRevert()
        setExpr("sleepy")
      }, budget)
    }
    armIdle()

    const wake = () => {
      armIdle()
      if (sticky.current && expr === "sleepy") {
        // Visitor is back: a quick surprised blink, then base.
        show("surprised", 1000)
      }
    }

    const onPointerDown = () => wake()
    const onKeyDown = () => wake()

    // Fast scroll burst → look up while flying, then hand back to base.
    let burst = 0
    let burstTimer: ReturnType<typeof setTimeout> | null = null
    const onWheel = (e: WheelEvent) => {
      armIdle()
      if (reduced || sticky.current) return
      burst += Math.abs(e.deltaY) + Math.abs(e.deltaX)
      if (burstTimer) clearTimeout(burstTimer)
      burstTimer = setTimeout(() => {
        burst = 0
      }, SCROLL_WINDOW_MS)
      const now = Date.now()
      if (burst > SCROLL_BURST && now - lastLookup.current > 1500) {
        lastLookup.current = now
        burst = 0
        show("lookup", 1000)
      }
    }

    // Blink: a 180ms squash every 18–30s, only when the face has sat still.
    let blinkTimer: ReturnType<typeof setTimeout> | null = null
    const scheduleBlink = () => {
      blinkTimer = setTimeout(
        () => {
          if (
            ambient &&
            document.visibilityState === "visible" &&
            Date.now() - lastReactionAt.current > 8000 &&
            expr !== "sleepy"
          ) {
            imgRef.current?.animate(
              [{ transform: "scaleY(1)" }, { transform: "scaleY(0.06)", offset: 0.5 }, { transform: "scaleY(1)" }],
              { duration: 180, easing: "ease-in-out" },
            )
          }
          scheduleBlink()
        },
        18000 + Math.random() * 12000,
      )
    }
    if (ambient) scheduleBlink()

    // Same-app link clicks hand off to the route dissolve: reacting here
    // too would flash a face for a microsecond before navigation swaps it.
    const willNavigate = (t: HTMLElement | null) => {
      const anchor = t?.closest?.("a") as HTMLAnchorElement | null
      if (!anchor || anchor.target === "_blank") return false
      const href = anchor.getAttribute("href") ?? ""
      if (href.startsWith("/")) return true
      if (/^https?:\/\//i.test(href)) {
        try {
          return new URL(href).origin === window.location.origin
        } catch {
          return false
        }
      }
      return false
    }

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (rootRef.current?.contains(t)) return // avatar handles its own clicks
      if (willNavigate(t)) return // route dissolve owns this one
      const interactive = t?.closest?.("a, button, [role='button']") ?? null
      if (!interactive) return // ignore dead-space clicks: no flicker
      const now = Date.now()
      if (now - lastClickReact.current < CLICK_DEBOUNCE_MS) return
      lastClickReact.current = now
      if (!sticky.current) show("smile", 900)
    }

    const onDblClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (willNavigate(t)) return
      if (!sticky.current) show("laugh", 1300)
    }

    const onCopy = () => show("surprised", 1200)

    let selTimer: ReturnType<typeof setTimeout> | null = null
    const onSelection = () => {
      if (selTimer) clearTimeout(selTimer)
      selTimer = setTimeout(() => {
        const text = window.getSelection()?.toString().trim() ?? ""
        if (text.length > 0) {
          reactionId.current += 1
          clearRevert()
          sticky.current = true
          setExpr("thinking")
        } else if (sticky.current && expr === "thinking") {
          settle()
        }
      }, 450)
    }

    const onVisibility = () => {
      if (document.hidden) {
        reactionId.current += 1
        clearRevert()
        sticky.current = true
        setExpr("sleepy")
      } else {
        armIdle()
        show("waving", 1500)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("wheel", onWheel, { passive: true })
    document.addEventListener("click", onClick)
    document.addEventListener("dblclick", onDblClick)
    document.addEventListener("copy", onCopy)
    document.addEventListener("selectionchange", onSelection)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      clearIdleTimers()
      if (burstTimer) clearTimeout(burstTimer)
      if (blinkTimer) clearTimeout(blinkTimer)
      if (selTimer) clearTimeout(selTimer)
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("wheel", onWheel)
      document.removeEventListener("click", onClick)
      document.removeEventListener("dblclick", onDblClick)
      document.removeEventListener("copy", onCopy)
      document.removeEventListener("selectionchange", onSelection)
      document.removeEventListener("visibilitychange", onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expr])

  // ── Avatar's own interactions ──────────────────────────────────────────
  const onAvatarEnter = () => {
    if (!interactive) return
    reactionId.current += 1
    clearRevert()
    sticky.current = true
    setExpr("waving")
  }
  const onAvatarLeave = () => {
    if (!interactive || !sticky.current) return
    settle()
  }
  const onAvatarClick = () => {
    if (!interactive) return
    clickCount.current += 1
    // Bounded playfulness: alternate laugh / excited, never a random face.
    show(clickCount.current % 3 === 0 ? "excited" : "laugh", 1400)
  }

  // All faces share identical geometry: same box, same scale, no per-face
  // zoom. Nudged faces (06+ cut bottom edge) only shift the crop window via
  // object-position: never transform scale: so swaps can't pop small→big.
  // Geometry is static per face from first paint. 01–05 render exactly
  // as-is. Only 06+ faces render a touch larger (1.05) and sit 2px lower
  // to tuck the cut bottom. It lives on this wrapper (never the img: the
  // blink effect animates the img's own transform), so nothing shifts
  // after the image is visible.
  const nudged = NUDGE_DOWN.has(expr)
  const slow = slowNext.current

  return (
    <div
      ref={rootRef}
      onMouseEnter={onAvatarEnter}
      onMouseLeave={onAvatarLeave}
      onClick={onAvatarClick}
      onKeyDown={interactive ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAvatarClick() } } : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? "Tirup Mehta avatar: activate to say hi" : undefined}
      title={interactive ? "Say hi" : undefined}
      className={`relative shrink-0 flex-none select-none${interactive ? " cursor-pointer" : ""}`}
    >
      <div
        style={{ width: size, height: size }}
        className="rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-[var(--bg)] dark:bg-zinc-900 aspect-square"
      >
        <div className={nudged ? "h-full w-full scale-[1.05] translate-y-[2px]" : "h-full w-full"}>
        {/* No key on purpose: the same <img> element swaps src, so the old
            face stays painted until the new one decodes: never a blank gap.
            (key={expr} unmounted first = the disappear-reappear glitch.) */}
        <Image
          ref={imgRef}
          src={SRC[expr]}
          alt={size >= 40 ? "Tirup Mehta avatar" : ""}
          width={size * 2}
          height={size * 2}
          sizes={`${size}px`}
          quality={90}
          priority={interactive && size >= 40}
          draggable={false}
          style={nudged ? { objectPosition: "50% 62%" } : undefined}
          className={`h-full w-full object-cover [image-rendering:pixelated] motion-reduce:animate-none${slow ? " animate-expression-slow" : " animate-expression-in"}`}
        />
        </div>
      </div>
      {/* Background warm-up (interactive instance only): hidden Next Images
          with byte-identical props, so the exact optimizer URLs face swaps
          use are already browser-cached before first paint settles.
          Raw `new Image()` preloads can't do this (different URLs). */}
      {interactive && (
        <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
          {WARM.map((f) => (
            <Image
              key={f}
              src={SRC[f]}
              alt=""
              width={size * 2}
              height={size * 2}
              sizes={`${size}px`}
              quality={90}
              priority
              draggable={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
