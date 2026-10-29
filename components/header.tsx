"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import ExpressionAvatar from "@/components/expression-avatar"
import ResumeModal from "@/components/resume-modal"
import { X, ArrowUpRight } from "lucide-react"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

// ---------------------------------------------------------------------------
// Nav items: single source of truth
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { label: "Home",    href: "/" },
  { label: "Work",    href: "/work" },
  { label: "Skills",  href: "/skills" },
  { label: "Writing", href: "/writing" },
] as const

// ---------------------------------------------------------------------------
// NavLinks: plain text links.
//
// Rule (ADR-0002): no sliding pill, no background wash on hover or active.
// The active route is marked with color only (black vs zinc), and hover only
// darkens the text. Backgrounds under nav links are what broke this site
// before; do not reintroduce them.
// --------------------------------------------------------------------------- 
function NavLinks({ pathname }: { pathname: string }) {
  function isLinkActive(href: string) {
    if (href === "/writing") return pathname === "/writing" || pathname?.startsWith("/writing/")
    if (href === "/work") return pathname === "/work" || pathname?.startsWith("/projects/")
    return pathname === href
  }

  return (
    <nav className="flex items-center gap-4 sm:gap-6">
      {NAV_ITEMS.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          style={{ transition: "color 160ms ease-out" }}
          className={[
            "py-1 text-sm sm:text-base md:text-lg font-light select-none cursor-pointer",
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
        <div className="w-full bg-black/[0.015] dark:bg-white/[0.01] border-b border-black/5 dark:border-white/5 py-2.5 text-xs font-light text-black/50 dark:text-white/50">
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
        <div className="flex items-center justify-between gap-x-4 gap-y-3 mb-4 md:mb-6 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <ExpressionAvatar size={56} />

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

        {/* ── Navigation tabs ─────────────────────────────────────────────── */}
        <div className="flex justify-between items-center gap-4 mb-5 md:mb-8 border-b border-black/5 dark:border-white/5 pb-3 md:pb-4 flex-nowrap">
          <div className="min-w-0">
            <NavLinks pathname={pathname} />
          </div>

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
