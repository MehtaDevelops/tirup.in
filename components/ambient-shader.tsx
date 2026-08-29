"use client"

import { useEffect, useRef } from "react"

/**
 * AmbientShader Component
 * 
 * An ultra-subtle, high-performance organic ambient canvas shader.
 * - Renders gentle, undulating chromatic radial light fields in the background.
 * - Perfectly calibrated for both light and dark themes.
 * - Ultra-low resource consumption: throttled render loop, pauses when tab is hidden.
 * - Overlay micro-noise dither prevents any gradient banding.
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
      // Use lower pixel density for ambient background to maximize GPU efficiency
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
      // Very slow, soothing drift speed
      t += dt * 0.15

      ctx.clearRect(0, 0, width, height)

      // Light & Dark calibrated palette nodes
      if (isDark) {
        // Dark theme: deep celestial indigo, midnight purple, subtle oceanic teal
        const x1 = width * (0.3 + 0.18 * Math.cos(t * 0.7))
        const y1 = height * (0.2 + 0.15 * Math.sin(t * 0.5))
        const r1 = Math.max(width, height) * 0.55

        const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1)
        g1.addColorStop(0, "rgba(42, 54, 110, 0.16)")
        g1.addColorStop(0.5, "rgba(28, 32, 75, 0.08)")
        g1.addColorStop(1, "rgba(8, 9, 11, 0)")
        ctx.fillStyle = g1
        ctx.fillRect(0, 0, width, height)

        const x2 = width * (0.75 - 0.15 * Math.sin(t * 0.6))
        const y2 = height * (0.55 + 0.18 * Math.cos(t * 0.8))
        const r2 = Math.max(width, height) * 0.6

        const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2)
        g2.addColorStop(0, "rgba(56, 38, 95, 0.14)")
        g2.addColorStop(0.6, "rgba(22, 18, 50, 0.06)")
        g2.addColorStop(1, "rgba(8, 9, 11, 0)")
        ctx.fillStyle = g2
        ctx.fillRect(0, 0, width, height)

        const x3 = width * (0.5 + 0.15 * Math.sin(t * 0.4))
        const y3 = height * (0.85 - 0.12 * Math.cos(t * 0.7))
        const r3 = Math.max(width, height) * 0.5

        const g3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, r3)
        g3.addColorStop(0, "rgba(20, 55, 75, 0.12)")
        g3.addColorStop(0.6, "rgba(12, 30, 45, 0.04)")
        g3.addColorStop(1, "rgba(8, 9, 11, 0)")
        ctx.fillStyle = g3
        ctx.fillRect(0, 0, width, height)
      } else {
        // Light theme: soft iris, warm alabaster glow, airy pale sky
        const x1 = width * (0.25 + 0.15 * Math.sin(t * 0.6))
        const y1 = height * (0.15 + 0.12 * Math.cos(t * 0.5))
        const r1 = Math.max(width, height) * 0.6

        const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1)
        g1.addColorStop(0, "rgba(215, 225, 255, 0.45)")
        g1.addColorStop(0.5, "rgba(235, 240, 255, 0.2)")
        g1.addColorStop(1, "rgba(250, 250, 249, 0)")
        ctx.fillStyle = g1
        ctx.fillRect(0, 0, width, height)

        const x2 = width * (0.8 - 0.15 * Math.cos(t * 0.7))
        const y2 = height * (0.45 + 0.15 * Math.sin(t * 0.6))
        const r2 = Math.max(width, height) * 0.65

        const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2)
        g2.addColorStop(0, "rgba(240, 225, 255, 0.35)")
        g2.addColorStop(0.5, "rgba(248, 240, 255, 0.15)")
        g2.addColorStop(1, "rgba(250, 250, 249, 0)")
        ctx.fillStyle = g2
        ctx.fillRect(0, 0, width, height)

        const x3 = width * (0.4 + 0.18 * Math.cos(t * 0.5))
        const y3 = height * (0.8 + 0.12 * Math.sin(t * 0.7))
        const r3 = Math.max(width, height) * 0.55

        const g3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, r3)
        g3.addColorStop(0, "rgba(220, 245, 245, 0.3)")
        g3.addColorStop(0.5, "rgba(235, 250, 250, 0.12)")
        g3.addColorStop(1, "rgba(250, 250, 249, 0)")
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
      {/* Animated Light Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-100 transition-opacity duration-1000"
      />

      {/* Subtle Micro-Noise Film Grain Overlay — eliminates color banding and adds organic tactility */}
      <div
        className="absolute inset-0 w-full h-full opacity-[0.028] dark:opacity-[0.038] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
