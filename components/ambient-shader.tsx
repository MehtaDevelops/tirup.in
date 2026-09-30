"use client"

import { useEffect, useRef } from "react"

/**
 * AmbientShader Component
 * 
 * An ultra-subtle, monochrome ambient light field — pure light and shadow,
 * zero color tint.
 * - In Dark Mode: A faint top-down white glow over deep charcoal.
 * - In Light Mode: Whisper-soft gray shading over warm paper for depth.
 * - Zero performance overhead: throttled render loop, pauses when tab is inactive.
 */
export default function AmbientShader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    let isDark = false

    const updateTheme = () => {
      isDark = document.documentElement.classList.contains("dark")
    }

    const resize = () => {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    updateTheme()
    resize()

    window.addEventListener("resize", resize, { passive: true })

    const observer = new MutationObserver(() => {
      updateTheme()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    let t = 0
    let lastTime = performance.now()
    let isVisible = true

    const handleVisibilityChange = () => {
      isVisible = !document.hidden
      if (isVisible) {
        lastTime = performance.now()
        render(lastTime)
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    const render = (time: number) => {
      if (!isVisible) return

      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time
      t += dt * 0.12

      ctx.clearRect(0, 0, width, height)

      if (isDark) {
        // --- Monochrome Dark: faint white top-glow over charcoal ---

        // 1. Top primary studio spotlight (breathing apex glow)
        const topX = width * 0.5 + width * 0.08 * Math.sin(t * 0.4)
        const topY = -height * 0.1 + height * 0.05 * Math.cos(t * 0.5)
        const topRadius = Math.max(width, height) * 0.75

        const gTop = ctx.createRadialGradient(topX, topY, 0, topX, topY, topRadius)
        gTop.addColorStop(0, "rgba(255, 255, 255, 0.055)")
        gTop.addColorStop(0.35, "rgba(255, 255, 255, 0.022)")
        gTop.addColorStop(0.7, "rgba(255, 255, 255, 0.008)")
        gTop.addColorStop(1, "rgba(255, 255, 255, 0)")
        ctx.fillStyle = gTop
        ctx.fillRect(0, 0, width, height)

        // 2. Subtle center-right lift (adds dimensional depth)
        const crX = width * 0.85 - width * 0.08 * Math.cos(t * 0.6)
        const crY = height * 0.45 + height * 0.1 * Math.sin(t * 0.5)
        const crRadius = Math.max(width, height) * 0.55

        const gCR = ctx.createRadialGradient(crX, crY, 0, crX, crY, crRadius)
        gCR.addColorStop(0, "rgba(255, 255, 255, 0.03)")
        gCR.addColorStop(0.5, "rgba(255, 255, 255, 0.012)")
        gCR.addColorStop(1, "rgba(255, 255, 255, 0)")
        ctx.fillStyle = gCR
        ctx.fillRect(0, 0, width, height)

        // 3. Ultra-subtle bottom-left counter-lift (floor balance)
        const blX = width * 0.15 + width * 0.06 * Math.sin(t * 0.5)
        const blY = height * 0.85 - height * 0.08 * Math.cos(t * 0.6)
        const blRadius = Math.max(width, height) * 0.6

        const gBL = ctx.createRadialGradient(blX, blY, 0, blX, blY, blRadius)
        gBL.addColorStop(0, "rgba(255, 255, 255, 0.022)")
        gBL.addColorStop(0.6, "rgba(255, 255, 255, 0.008)")
        gBL.addColorStop(1, "rgba(255, 255, 255, 0)")
        ctx.fillStyle = gBL
        ctx.fillRect(0, 0, width, height)

      } else {
        // --- Monochrome Light: whisper-soft gray shading over paper ---
        const x1 = width * (0.25 + 0.15 * Math.sin(t * 0.6))
        const y1 = height * (0.15 + 0.12 * Math.cos(t * 0.5))
        const r1 = Math.max(width, height) * 0.6

        const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1)
        g1.addColorStop(0, "rgba(0, 0, 0, 0.035)")
        g1.addColorStop(0.5, "rgba(0, 0, 0, 0.015)")
        g1.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = g1
        ctx.fillRect(0, 0, width, height)

        const x2 = width * (0.8 - 0.15 * Math.cos(t * 0.7))
        const y2 = height * (0.45 + 0.15 * Math.sin(t * 0.6))
        const r2 = Math.max(width, height) * 0.65

        const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2)
        g2.addColorStop(0, "rgba(0, 0, 0, 0.028)")
        g2.addColorStop(0.5, "rgba(0, 0, 0, 0.012)")
        g2.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = g2
        ctx.fillRect(0, 0, width, height)

        const x3 = width * (0.4 + 0.18 * Math.cos(t * 0.5))
        const y3 = height * (0.8 + 0.12 * Math.sin(t * 0.7))
        const r3 = Math.max(width, height) * 0.55

        const g3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, r3)
        g3.addColorStop(0, "rgba(0, 0, 0, 0.022)")
        g3.addColorStop(0.5, "rgba(0, 0, 0, 0.01)")
        g3.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = g3
        ctx.fillRect(0, 0, width, height)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Studio Light Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-100 transition-opacity duration-1000"
      />
    </div>
  )
}
