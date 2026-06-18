"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import TextWithBlur from "@/components/text-with-blur"
import { ArrowUpRight, Download, X } from "lucide-react"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

export default function Header() {
  const pathname = usePathname()
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    // Check localStorage for popup dismissal
    const hasDismissed = localStorage.getItem("dismissedBlogPopup")
    if (!hasDismissed) {
      setShowPopup(true)
    }
  }, [])

  const handleDismissPopup = () => {
    setShowPopup(false)
    localStorage.setItem("dismissedBlogPopup", "true")
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Top Notice Banner */}
      {showPopup && (
        <div className="reveal-in w-full bg-black/[0.015] dark:bg-white/[0.01] border-b border-black/5 dark:border-white/5 py-2.5 text-xs font-light text-black/50 dark:text-white/50">
          <div className="max-w-4xl mx-auto w-full px-6 md:px-20 flex items-center justify-between gap-4">
             <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-accent font-medium uppercase tracking-[0.15em] text-[10px]">blogs</span>
              <span className="text-black/20 dark:text-white/20 select-none">/</span>
              <span>
                <span className="hidden sm:inline">Thoughts on development, design, and security. Read at </span>
                <span className="sm:hidden">Read thoughts at </span>
                <a href="https://blogs.tirup.in" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-accent hover:text-accent dark:hover:text-white transition-colors font-medium">blogs.tirup.in</a> ↗
              </span>
            </div>
            <button 
              onClick={handleDismissPopup}
              className="p-1 rounded-full text-black/35 dark:text-white/35 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 shrink-0 cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Intro/Hero Header Area */}
      <div className="max-w-4xl mx-auto w-full px-6 md:px-20 pt-10 md:pt-28 pb-0">
        {/* Avatar + Title inline */}
        <TextWithBlur>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 shrink-0">
              <Image
                src="/profile.png"
                alt="Tirup Mehta avatar"
                width={112}
                height={112}
                className="w-full h-full object-cover"
                priority
                unoptimized
              />
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white">
                Tirup Mehta
              </h1>
              <a 
                href="/Resume_Tirup_Mehta.pdf" 
                download
                className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium tracking-wide bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 rounded-full text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-all duration-300 select-none cursor-pointer transform hover:-translate-y-[1px]"
              >
                <Download size={10} />
                <span>Resume</span>
              </a>
            </div>
          </div>
        </TextWithBlur>

        {/* Navigation Tabs */}
        <div className="flex justify-between items-center gap-4 mb-8 border-b border-black/5 dark:border-white/5 pb-4 flex-nowrap">
          <TextWithBlur delay={100} className="min-w-0">
            <div className="flex gap-3 sm:gap-6 text-[13px] sm:text-sm md:text-base font-light whitespace-nowrap">
              <Link 
                href="/" 
                className={`transition-colors ${isActive("/") ? "text-black dark:text-white font-normal" : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"}`}
              >
                Home
              </Link>
              <Link 
                href="/work" 
                className={`transition-colors ${isActive("/work") ? "text-black dark:text-white font-normal" : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"}`}
              >
                Work
              </Link>
              <Link 
                href="/skills" 
                className={`transition-colors ${isActive("/skills") ? "text-black dark:text-white font-normal" : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"}`}
              >
                Skills
              </Link>
              <Link 
                href="/blogs" 
                className={`transition-colors ${isActive("/blogs") || pathname?.startsWith("/blogs") ? "text-black dark:text-white font-normal" : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"}`}
              >
                Writing
              </Link>
            </div>
          </TextWithBlur>
          
          {/* Theme Switcher on the far right */}
          <AnimatedThemeToggler 
            variant="circle"
            className="flex items-center justify-center w-8 h-8 rounded-full text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer shrink-0"
          />
        </div>
      </div>
    </>
  )
}
