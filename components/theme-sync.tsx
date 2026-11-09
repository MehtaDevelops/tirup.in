"use client"

import { useEffect } from "react"

import { applyTheme, resolveTheme } from "@/lib/theme-preference"
import { applyTint, getStoredTint } from "@/lib/theme-tint"

/**
 * Next answers 404s with an error shell plus an RSC payload, so the page is
 * rendered on the client and the inline pre-paint theme script in the root
 * layout never executes. Without this, a missing page would always paint light
 * no matter which mode the reader chose, and an active tint would vanish.
 *
 * On normal pages the class and tint are already correct, so this is a no-op.
 */
export default function ThemeSync() {
  useEffect(() => {
    const tint = getStoredTint()
    if (tint) {
      applyTint(tint)
      return
    }
    applyTheme(resolveTheme())
  }, [])
  return null
}
