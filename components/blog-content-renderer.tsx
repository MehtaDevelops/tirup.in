"use client"

import { useEffect, useRef } from "react"

interface BlogContentRendererProps {
  html: string
}

export function BlogContentRenderer({ html }: BlogContentRendererProps) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preElements = container.querySelectorAll("pre")
    const cleanups: (() => void)[] = []

    preElements.forEach((pre) => {
      // Check if copy button is already attached
      if (pre.querySelector(".code-copy-btn")) return

      pre.style.position = "relative"

      const codeElement = pre.querySelector("code")

      // Extract and display language badge if available (e.g. "typescript", "tsx", "bash", "json")
      let lang = ""
      if (codeElement?.className) {
        const match = codeElement.className.match(/(?:lang|language)-([a-zA-Z0-9_-]+)/i)
        if (match) lang = match[1]
      }
      if (!lang) {
        lang = pre.getAttribute("data-language") || pre.getAttribute("data-lang") || codeElement?.getAttribute("data-language") || ""
      }
      if (!lang && codeElement?.innerText) {
        const codeText = codeElement.innerText.trim()
        if (codeText.startsWith("import ") || codeText.startsWith("export ") || codeText.startsWith("interface ") || codeText.startsWith("const ") || codeText.startsWith("type ")) {
          lang = "typescript"
        } else if (codeText.startsWith("curl ") || codeText.startsWith("npm ") || codeText.startsWith("pnpm ") || codeText.startsWith("bun ") || codeText.startsWith("git ")) {
          lang = "bash"
        }
      }

      if (lang && !pre.querySelector(".code-lang-label")) {
        const langBadge = document.createElement("span")
        langBadge.className = "code-lang-label"
        langBadge.textContent = lang.toLowerCase()
        pre.appendChild(langBadge)
        cleanups.push(() => langBadge.remove())
      }

      // Create copy button
      const button = document.createElement("button")
      button.type = "button"
      button.className = "code-copy-btn"
      button.setAttribute("aria-label", "Copy code to clipboard")
      button.setAttribute("title", "Copy code")

      button.innerHTML = `
        <svg class="copy-icon transition-transform duration-150" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        <svg class="check-icon hidden text-emerald-500 dark:text-emerald-400 transition-transform duration-150" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `

      let timeoutId: ReturnType<typeof setTimeout> | null = null

      const handleCopy = async (e: Event) => {
        e.preventDefault()
        e.stopPropagation()

        const textToCopy = codeElement ? codeElement.innerText : pre.innerText

        try {
          await navigator.clipboard.writeText(textToCopy)

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
  }, [html])

  return (
    <article
      ref={containerRef}
      className="blog-content text-black/80 dark:text-white/85 max-w-3xl mb-16"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
