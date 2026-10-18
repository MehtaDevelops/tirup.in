"use client"

import { useEffect, useRef, useState } from "react"

/**
 * AnimatedNumber: Skiper37-style smooth counting, zero dependencies.
 * - Counts from `start` to `value` with rAF + easing when scrolled into view.
 * - Respects prefers-reduced-motion (jumps straight to value).
 * - Tabular numerals keep width stable while counting.
 */

type EasingName = "expo" | "cubic" | "spring"

const EASINGS: Record<EasingName, (t: number) => number> = {
  expo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  cubic: (t) => 1 - Math.pow(1 - t, 3),
  // Gentle overshoot that settles — spring feel without a physics lib.
  spring: (t) => {
    const c = 1.4
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
  },
}

export type AnimatedNumberProps = {
  value: number
  start?: number
  duration?: number
  delay?: number
  decimals?: number
  prefix?: string
  suffix?: string
  easing?: EasingName
  separator?: boolean
  once?: boolean
  className?: string
}

function format(n: number, decimals: number, separator: boolean) {
  const fixed = n.toFixed(decimals)
  if (!separator) return fixed
  const [int, frac] = fixed.split(".")
  const grouped = Number(int).toLocaleString("en-US")
  return frac !== undefined ? `${grouped}.${frac}` : grouped
}

export function AnimatedNumber({
  value,
  start = 0,
  duration = 1600,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  easing = "expo",
  separator = true,
  once = true,
  className = "",
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [display, setDisplay] = useState(start)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  useEffect(() => {
    if (!inView) {
      setDisplay(start)
      return
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value)
      return
    }
    let raf = 0
    const t0 = performance.now() + delay
    const ease = EASINGS[easing]
    const tick = (now: number) => {
      const raw = (now - t0) / duration
      if (raw < 0) {
        raf = requestAnimationFrame(tick)
        return
      }
      const t = Math.min(raw, 1)
      setDisplay(start + (value - start) * ease(t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, start, duration, delay, easing])

  return (
    <span
      ref={ref}
      className={`tabular-nums ${className}`}
      aria-label={`${prefix}${format(value, decimals, separator)}${suffix}`}
    >
      <span aria-hidden="true">
        {prefix}
        {format(display, decimals, separator)}
        {suffix}
      </span>
    </span>
  )
}
