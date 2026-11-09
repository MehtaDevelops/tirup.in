"use client"

import { useEffect, useRef, useState } from "react"

interface CopyEmailProps {
  email: string
  className?: string
}

/** Legacy copy path for browsers without the async Clipboard API. */
function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.setAttribute("readonly", "")
    ta.style.position = "absolute"
    ta.style.left = "-9999px"
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/**
 * Footer email link. mailto: does nothing on many desktops (no mail client
 * registered), so a click copies the address and shows a tiny "Copied" pill.
 * If copying is impossible the browser falls back to the normal mailto: link.
 */
export default function CopyEmail({ email, className }: CopyEmailProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    let ok = false
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(email)
        ok = true
      } else {
        ok = legacyCopy(email)
      }
    } catch {
      ok = legacyCopy(email)
    }
    if (!ok) {
      window.location.href = `mailto:${email}`
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <span className="relative inline-block">
      <a
        href={`mailto:${email}`}
        onClick={handleClick}
        className={className}
        data-tip="Click to copy"
      >
        {email}
      </a>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Email address copied" : ""}
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-full left-0 mb-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-black px-2.5 py-1 text-[11px] font-medium leading-none text-white shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none dark:bg-white dark:text-black ${
          copied ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-95 opacity-0"
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Copied
      </span>
    </span>
  )
}
