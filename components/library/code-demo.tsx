"use client"

import { useEffect, useRef } from "react"

/**
 * Static code blocks rendered through the site's own .blog-content styling
 * (globals.css `.blog-content pre` + `.code-copy-btn` + `.code-lang-label`),
 * identical to the code boxes on the blog. The copy button and language badge
 * are injected client-side by this component using the exact same DOM that
 * components/blog-content-renderer produces.
 */
export function CodeDemo({ blocks }: { blocks: Array<{ lang: string; code: string }> }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    const cleanups: (() => void)[] = []

    container.querySelectorAll("pre").forEach((pre) => {
      pre.style.position = "relative"
      const codeElement = pre.querySelector("code")
      const lang = codeElement?.className.match(/(?:lang|language)-([a-zA-Z0-9_-]+)/i)?.[1] ?? ""

      if (lang && !pre.querySelector(".code-lang-label")) {
        const langBadge = document.createElement("span")
        langBadge.className = "code-lang-label"
        langBadge.setAttribute("aria-hidden", "true")
        langBadge.textContent = lang.toLowerCase()
        pre.appendChild(langBadge)
        cleanups.push(() => langBadge.remove())
      }

      if (pre.querySelector(".code-copy-btn")) return

      const button = document.createElement("button")
      button.type = "button"
      button.className = "code-copy-btn"
      button.setAttribute("aria-label", "Copy code to clipboard")
      button.setAttribute("title", "Copy code")

      button.innerHTML = `
        <svg aria-hidden="true" class="copy-icon transition-transform duration-150" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        <svg aria-hidden="true" class="check-icon hidden text-emerald-500 dark:text-emerald-400 transition-transform duration-150" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `

      const copyFallback = (text: string) => {
        const ta = document.createElement("textarea")
        ta.value = text
        ta.setAttribute("readonly", "")
        ta.style.position = "absolute"
        ta.style.left = "-9999px"
        document.body.appendChild(ta)
        ta.select()
        try { document.execCommand("copy") } catch { /* ignore */ }
        document.body.removeChild(ta)
      }

      let timeoutId: ReturnType<typeof setTimeout> | null = null

      const handleCopy = async (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        const textToCopy = codeElement ? codeElement.innerText : pre.textContent || ""
        try {
          if (navigator.clipboard?.writeText && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy)
          } else {
            copyFallback(textToCopy)
          }
          const copyIcon = button.querySelector(".copy-icon")
          const checkIcon = button.querySelector(".check-icon")
          if (copyIcon && checkIcon) {
            copyIcon.classList.add("hidden")
            checkIcon.classList.remove("hidden")
            button.classList.add("copied")
            button.setAttribute("title", "Copied!")
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
              copyIcon.classList.remove("hidden")
              checkIcon.classList.add("hidden")
              button.classList.remove("copied")
              button.setAttribute("title", "Copy code")
            }, 2000)
          }
        } catch (err) {
          console.error("Failed to copy code block:", err)
        }
      }

      button.addEventListener("click", handleCopy)
      pre.appendChild(button)
      cleanups.push(() => {
        if (timeoutId) clearTimeout(timeoutId)
        button.removeEventListener("click", handleCopy)
        button.remove()
      })
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [blocks])

  return (
    <div ref={ref} className="blog-content">
      {blocks.map((b, i) => (
        <pre key={i} data-language={b.lang}>
          <code className={`language-${b.lang}`}>{b.code}</code>
        </pre>
      ))}
    </div>
  )
}
