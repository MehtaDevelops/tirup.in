"use client"

import { useEffect, useState, useRef } from "react"

interface StaggeredTextProps {
  text: string
  className?: string
  delay?: number
}

export default function StaggeredText({ text, className = "", delay = 0 }: StaggeredTextProps) {
  const [isVisible, setIsVisible] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set initial visibility after a short delay to ensure it's visible on page load
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -10% 0px",
      },
    )

    if (textRef.current) {
      observer.observe(textRef.current)
    }

    return () => {
      clearTimeout(timer)
      if (textRef.current) {
        observer.unobserve(textRef.current)
      }
    }
  }, [delay, isVisible])

  // Split text into words
  const words = text.split(" ")

  return (
    <div ref={textRef} className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em]">
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className="inline-block"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.5s ease, transform 0.5s ease`,
                transitionDelay: `${delay + (wordIndex * 0.05 + charIndex * 0.03)}s`,
              }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </div>
  )
}
