"use client"

import { useState } from "react"
import { ArrowUpRight, Check, Copy } from "lucide-react"
import { copyText } from "@/lib/utils"

/**
 * Copy-to-clipboard pill rendered with the exact border-pill treatment of the
 * writing page ("Read all blogs"), so every action button on the site shares
 * one visual system. The icon swaps to a check on a successful copy.
 */
export default function CopyCommand({
  command,
  label = "Copy",
}: {
  command: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyText(command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : `Copy: ${command}`}
      className="group inline-flex items-center gap-1.5 pl-4 pr-3 h-9 text-xs font-medium tracking-wide rounded-full border bg-transparent transition-all duration-150 select-none cursor-pointer active:scale-[0.97] border-[rgba(18,19,20,0.15)] hover:border-[rgba(18,19,20,0.3)] hover:bg-[rgba(18,19,20,0.05)] text-[rgba(18,19,20,0.7)] hover:text-black dark:border-[rgba(255,255,255,0.07)] dark:hover:border-[rgba(255,255,255,0.16)] dark:hover:bg-[rgba(255,255,255,0.05)] dark:text-[rgba(244,244,245,0.7)] dark:hover:text-white"
    >
      <span className="leading-none select-none whitespace-nowrap">{label}</span>
      {copied ? (
        <Check size={13} className="text-emerald-500 dark:text-emerald-400" />
      ) : (
        <Copy size={12} className="opacity-70" />
      )}
    </button>
  )
}
