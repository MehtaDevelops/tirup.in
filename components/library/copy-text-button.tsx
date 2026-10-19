"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { copyText } from "@/lib/utils"

/**
 * One-off copy control in the links-row language of the component doc pages
 * ("Copy for AI"). Used where a large payload (whole registry JSON) needs a
 * copy affordance instead of a link that would drag the browser into the
 * raw dump the viewer exists to avoid.
 */
export function CopyTextButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        await copyText(text)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      }}
      className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
    >
      <span className="link-hover pb-0.5">{copied ? "Copied" : label}</span>
      {copied ? (
        <Check size={12} className="text-emerald-500 dark:text-emerald-400" />
      ) : (
        <Copy size={12} className="opacity-40 group-hover:opacity-100" />
      )}
    </button>
  )
}
