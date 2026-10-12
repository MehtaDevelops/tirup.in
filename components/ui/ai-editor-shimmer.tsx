"use client"

import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

export function TextShimmer({
  children,
  duration = 2,
  spread = 2,
  className,
}: {
  children: string
  duration?: number
  spread?: number
  className?: string
}) {
  return (
    <span
      className={cn("relative inline-block rtl:[animation-direction:reverse]", className)}
      style={
        {
          "--spread": `${children.length * spread}px`,
          backgroundImage:
            "linear-gradient(90deg, transparent calc(50% - var(--spread)), currentColor, transparent calc(50% + var(--spread))), linear-gradient(color-mix(in oklab, currentColor var(--shimmer-dim, 45%), transparent), color-mix(in oklab, currentColor var(--shimmer-dim, 45%), transparent))",
          backgroundSize: "250% 100%, auto",
          backgroundRepeat: "no-repeat",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animationName: "ai-editor-shimmer",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        } as CSSProperties
      }
    >
      {children}
    </span>
  )
}

export function StreamingText({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <span className={cn("ai-streaming-text", className)}>
      {children}
      <span className="ai-streaming-caret" aria-hidden="true" />
    </span>
  )
}
