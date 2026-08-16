"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RotateCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Global Error Boundary Caught]", error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-300">
      <div className="max-w-xl w-full text-center space-y-6 reveal-in">
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-black/35 dark:text-white/35">
          System Signal Interrupted
        </span>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif italic font-medium tracking-tight leading-none">
          Unable to complete request.
        </h1>

        <p className="text-sm md:text-base font-light leading-relaxed text-black/60 dark:text-white/60 max-w-md mx-auto">
          An unexpected glitch occurred while rendering this page. You can reload or navigate back home.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wider uppercase border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] rounded-full text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <RotateCw size={12} />
            <span>Reload</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wider uppercase border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] rounded-full text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
