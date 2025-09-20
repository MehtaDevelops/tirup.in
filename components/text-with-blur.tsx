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

  useEffect(() => {
    // Create a more reliable intersection observer with better settings
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        // Update visibility state based on whether element is in viewport
        setIsVisible(entry.isIntersecting)
      },
      {
        // Lower threshold to detect earlier
        threshold: [0.01],
        // Adjust rootMargin to trigger slightly before element enters viewport
        rootMargin: "50px 0px",
      },
    )

    const currentRef = textRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    // Force check visibility on mount
    setTimeout(() => {
      if (currentRef && currentRef.getBoundingClientRect().top < window.innerHeight) {
        setIsVisible(true)
      }
    }, 100)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  // Add scroll event listener as a backup to ensure visibility state is correct
  useEffect(() => {
    const handleScroll = () => {
      if (textRef.current) {
        const rect = textRef.current.getBoundingClientRect()
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0

        if (isInViewport !== isVisible) {
          setIsVisible(isInViewport)
        }
      }
    }

    // Initial check
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isVisible])

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
