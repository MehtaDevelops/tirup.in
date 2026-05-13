"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface TextWithBlurProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function TextWithBlur({ children, className = "", delay = 0 }: TextWithBlurProps) {
  const [isVisible, setIsVisible] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  // Use IntersectionObserver only, it's more performant than scroll listeners
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.01, rootMargin: "50px 0px" },
    )

    if (textRef.current) {
      observer.observe(textRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={textRef}
      className={`relative ${className}`}
      style={{
        filter: isVisible ? "blur(0px)" : "blur(5px)",
        transition: "filter 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  )
}
