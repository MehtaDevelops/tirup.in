"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RotateCw } from "lucide-react"

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Blog Error Boundary Caught]", error)
  }, [error])

  const actionClass =
    "inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wider uppercase border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] rounded-full text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white transition-colors cursor-pointer active:scale-[0.97]"

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-[#121314] dark:text-[#fafafa]">
      <div className="max-w-xl w-full text-center reveal-in">
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-black/35 dark:text-white/35">
          Temporary Sync Error
        </span>

        <h1 className="mt-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif italic font-medium tracking-tight leading-tight">
          Article stream momentarily interrupted.
        </h1>

        <p className="mt-4 text-sm md:text-base font-light leading-relaxed text-black/60 dark:text-white/60 max-w-md mx-auto">
          We encountered an issue syncing this article. Reload to try again or return to writing archives.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={() => reset()} className={actionClass}>
            <RotateCw size={12} aria-hidden="true" />
            <span>Reload</span>
          </button>
          <Link href="/writing" className={actionClass}>
            <ArrowLeft size={12} aria-hidden="true" />
            <span>All Articles</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
