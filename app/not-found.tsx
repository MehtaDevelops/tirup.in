"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-300">
      <div className="max-w-xl w-full text-center space-y-6 reveal-in">
        {/* Error Code Tag */}
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-black/35 dark:text-white/35">
          Error 404
        </span>

        {/* Elegant Editorial Heading */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif italic font-medium tracking-tight leading-none">
          This page is currently off-grid.
        </h1>

        {/* Minimal Description */}
        <p className="text-sm md:text-base font-light leading-relaxed text-black/60 dark:text-white/60 max-w-md mx-auto">
          The link you followed went dark, or this destination is restricted. Let's establish a secure handshake back home.
        </p>

        {/* Return Button */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wider uppercase border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] rounded-full text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Return to Grid</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
