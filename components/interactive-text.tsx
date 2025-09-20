"use client"

import type React from "react"

import { useState, useRef, type ReactNode } from "react"
import TextWithBlur from "./text-with-blur"

interface InteractiveTextProps {
  children: ReactNode
  className?: string
}

export default function InteractiveText({ children, className = "" }: InteractiveTextProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const textRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!textRef.current) return

    const rect = textRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <TextWithBlur className={className}>
      <div
        ref={textRef}
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {isHovered && (
          <div
            className="absolute bg-accent/10 rounded-sm pointer-events-none z-0"
            style={{
              left: `${mousePosition.x - 20}px`,
              top: `${mousePosition.y - 20}px`,
              width: "40px",
              height: "40px",
              transform: "translate(-50%, -50%)",
              transition: "width 0.2s, height 0.2s",
              opacity: 0.7,
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    </TextWithBlur>
  )
}
