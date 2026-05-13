"use client"

import type React from "react"

import { useRef, type ReactNode } from "react"
import TextWithBlur from "./text-with-blur"

interface InteractiveTextProps {
  children: ReactNode
  className?: string
}

export default function InteractiveText({ children, className = "" }: InteractiveTextProps) {
  const textRef = useRef<HTMLDivElement>(null)

  return (
    <TextWithBlur className={className}>
      <div
        ref={textRef}
        className="relative"
      >
        <div className="relative z-10">{children}</div>
      </div>
    </TextWithBlur>
  )
}
