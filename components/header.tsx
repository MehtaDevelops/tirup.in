"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import TextWithBlur from "@/components/text-with-blur"
import ResumeModal from "@/components/resume-modal"
import { X, ArrowUpRight } from "lucide-react"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

// ---------------------------------------------------------------------------
// Nav items — single source of truth
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { label: "Home",    href: "/" },
  { label: "Work",    href: "/work" },
  { label: "Skills",  href: "/skills" },
  { label: "Writing", href: "/blogs" },
] as const

// ---------------------------------------------------------------------------
// NavLinks — sliding background pill follows cursor & active route.
//
// Key correctness details:
//  1. The pill has NO transition on first render — it snaps to the active
//     link position silently. The transition class is added after the initial
//     paint via the `ready` ref so the pill never slides in from x=0.
//  2. Only `transform` and `width` are transitioned — both are GPU-composited
//     so the animation never triggers a layout or paint step.
//  3. Text color changes in 80ms — fast enough to feel instant, slow enough
//     to not look like a hard toggle.
// ---------------------------------------------------------------------------
function NavLinks({ pathname }: { pathname: string }) {
  const navRef   = useRef<HTMLElement>(null)
  const pillRef  = useRef<HTMLDivElement>(null)
  const ready    = useRef(false)           // true after first position is set
  const [hoverHref, setHoverHref] = useState<string | null>(null)

  function isLinkActive(href: string) {
    if (href === "/blogs") return pathname === "/blogs" || pathname?.startsWith("/blogs/")
    return pathname === href
  }

  const activeHref = NAV_ITEMS.find((n) => isLinkActive(n.href))?.href ?? "/"
  const targetHref = hoverHref ?? activeHref

  function positionPill(href: string, animate: boolean) {
    const nav  = navRef.current
    const pill = pillRef.current
    if (!nav || !pill) return

    const anchor = nav.querySelector<HTMLElement>(`[data-navhref="${href}"]`)
    if (!anchor) return

    const nRect = nav.getBoundingClientRect()
    const aRect = anchor.getBoundingClientRect()

    // Enable transition only after the initial snap is committed
    if (animate) {
      pill.style.transition =
        "transform 160ms cubic-bezier(0.16,1,0.3,1), width 160ms cubic-bezier(0.16,1,0.3,1)"
    } else {
      pill.style.transition = "none"
    }

    pill.style.width     = `${aRect.width}px`
    pill.style.transform = `translateX(${aRect.left - nRect.left}px)`
  }

  // Mount: snap to active position with zero transition
  useEffect(() => {
    // rAF ensures the browser has laid out the nav anchors before we measure
    const id = requestAnimationFrame(() => {
      positionPill(activeHref, false)
      // After the snap frame commits, re-enable transitions for interactions
      requestAnimationFrame(() => { ready.current = true })
    })
    return () => cancelAnimationFrame(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Subsequent moves (hover / route change): animate
  useEffect(() => {
    if (!ready.current) return
    positionPill(targetHref, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetHref])

  // Keep pill aligned if the container resizes (font-load, viewport change)
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      positionPill(ready.current ? targetHref : activeHref, false)
    })
    if (navRef.current) ro.observe(navRef.current)
    return () => ro.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetHref])

  return (
    <nav ref={navRef} className="relative flex items-center gap-4 sm:gap-6">
      {/* Sliding background pill — purely presentational, GPU-composited */}
      <div
        ref={pillRef}
        aria-hidden="true"
        className="absolute inset-y-0 rounded-md bg-black/[0.045] dark:bg-white/[0.055] pointer-events-none will-change-transform"
        // Transition is set imperatively above to prevent mount-slide
      />

      {NAV_ITEMS.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          data-navhref={href}
          onMouseEnter={() => setHoverHref(href)}
          onMouseLeave={() => setHoverHref(null)}
          style={{ transition: "color 80ms ease-out" }}
          className={[
            "relative z-10 py-1 px-2 rounded-md",
            "text-sm sm:text-base md:text-lg font-light select-none cursor-pointer",
            // Press scale only on transform — no `transition-all` bloat
            "[transition:color_80ms_ease-out,transform_100ms_cubic-bezier(0.16,1,0.3,1)]",
            "active:scale-[0.97]",
            isLinkActive(href)
              ? "text-black dark:text-white"
              : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white",
          ].join(" ")}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Main Header
// ---------------------------------------------------------------------------
export default function Header() {
  const pathname = usePathname()
  const [showPopup, setShowPopup] = useState(true)
  const [isResumeOpen, setIsResumeOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("dismissedBlogPopup")) setShowPopup(false)
  }, [])

  const handleDismissPopup = () => {
    setShowPopup(false)
    localStorage.setItem("dismissedBlogPopup", "true")
  }

  const isHome = pathname === "/"

  return (
    <>
      {/* ── Top notice banner ────────────────────────────────────────────── */}
      {showPopup && (
        <div className="reveal-in w-full bg-black/[0.015] dark:bg-white/[0.01] border-b border-black/5 dark:border-white/5 py-2.5 text-xs font-light text-black/50 dark:text-white/50">
          <div className="max-w-4xl mx-auto w-full px-6 md:px-20 flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[#646DBB] dark:text-accent font-medium uppercase tracking-[0.15em] text-[10px]">blogs</span>
              <span className="text-black/20 dark:text-white/20 select-none">/</span>
              <span>
                <span className="hidden sm:inline">Thoughts on development, design, and security. Read at </span>
                <span className="sm:hidden">Read thoughts at </span>
                <a
                  href="https://blogs.tirup.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-hover hover:text-accent dark:hover:text-white transition-colors font-medium"
                >
                  blogs.tirup.in
                </a>{" "}
                ↗
              </span>
            </div>
            <button
              onClick={handleDismissPopup}
              className="group p-1 rounded-full text-black/35 dark:text-white/35 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 shrink-0 cursor-pointer active:scale-[0.97]"
              aria-label="Dismiss banner"
            >
              <X size={13} className="transition-transform duration-200 group-hover:rotate-90" />
            </button>
          </div>
        </div>
      )}

      {/* ── Avatar + name ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto w-full px-6 md:px-20 pt-6 md:pt-28 pb-0">
        <TextWithBlur>
          <div className="flex items-center justify-between gap-x-4 gap-y-3 mb-4 md:mb-6 flex-wrap">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative shrink-0 select-none group">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src="/profile.png"
                  alt="Tirup Mehta avatar"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              {/* Waving hand — hover-triggered */}
              <div className="absolute -bottom-1 -left-1.5 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-waving-hand origin-[70%_75%] pointer-events-none">
                <Image
                  src="/waving-hand.png"
                  alt="Waving Hand Emoji (Yellow)"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain dark:hidden"
                />
                <Image
                  src="/waving-hand-white.png"
                  alt="Waving Hand Emoji (White)"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain hidden dark:block"
                />
              </div>
            </div>

            <div className="min-w-0">
              {isHome ? (
                <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white leading-none">
                  Tirup Mehta
                </h1>
              ) : (
                <p className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white leading-none">
                  Tirup Mehta
                </p>
              )}
            </div>
            </div>

            <button
              type="button"
              onClick={() => setIsResumeOpen(true)}
              className="group inline-flex items-center gap-1 pl-4 pr-3 h-8 text-xs font-medium tracking-wide rounded-full border bg-transparent transition-all duration-150 select-none cursor-pointer shrink-0 active:scale-[0.97] border-[rgba(18,19,20,0.15)] hover:border-[rgba(18,19,20,0.3)] hover:bg-[rgba(18,19,20,0.05)] text-[rgba(18,19,20,0.7)] hover:text-black dark:border-[rgba(255,255,255,0.07)] dark:hover:border-[rgba(255,255,255,0.16)] dark:hover:bg-[rgba(255,255,255,0.05)] dark:text-[rgba(244,244,245,0.7)] dark:hover:text-white"
            >
              <span className="leading-none select-none">Resume</span>
              <ArrowUpRight size={13} className="icon-arrow-hover opacity-70" />
            </button>
          </div>
        </TextWithBlur>

        {/* ── Navigation tabs ─────────────────────────────────────────────── */}
        <div className="flex justify-between items-center gap-4 mb-5 md:mb-8 border-b border-black/5 dark:border-white/5 pb-3 md:pb-4 flex-nowrap">
          <TextWithBlur delay={100} className="min-w-0">
            <NavLinks pathname={pathname} />
          </TextWithBlur>

          {/* Theme switcher */}
          <AnimatedThemeToggler
            variant="circle"
            className="flex items-center justify-center w-8 h-8 rounded-full text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer shrink-0 active:scale-[0.97]"
          />
        </div>
      </div>

      {/* ── Resume preview popup (inline, no auto-download) ── */}
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </>
  )
}
