"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { copyText } from "@/lib/utils"

export function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await copyText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="relative rounded-xl border border-zinc-900/10 dark:border-white/10 bg-zinc-900/[0.04] dark:bg-black overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900/10 dark:border-white/10">
        <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 lowercase">{lang}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied to clipboard" : `Copy ${lang} code to clipboard`}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-100">
        {code}
      </pre>
    </div>
  )
}
