"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTouch } from "@/hooks/use-touch"

interface ParallaxImageProps {
  src: string
  alt: string
  priority?: boolean
}

export default function ParallaxImage({ src, alt, priority = false }: ParallaxImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const isTouchDevice = useTouch()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        setIsVisible(entry.isIntersecting)
      },
      {
        threshold: 0.1,
      },
    )

    const currentElement = document.getElementById(`image-${alt.replace(/\s+/g, "-").toLowerCase()}`)

    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [alt])

  useEffect(() => {
    if (!isTouchDevice) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({
          x: e.clientX / window.innerWidth - 0.5,
          y: e.clientY / window.innerHeight - 0.5,
        })
      }

      window.addEventListener("mousemove", handleMouseMove)
      return () => window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isTouchDevice])

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTouchDevice && e.touches[0]) {
      setMousePosition({
        x: e.touches[0].clientX / window.innerWidth - 0.5,
        y: e.touches[0].clientY / window.innerHeight - 0.5,
      })
    }
  }

  return (
    <div
      id={`image-${alt.replace(/\s+/g, "-").toLowerCase()}`}
      className="image-container subtle-shadow w-full h-[50vh]"
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchMove}
    >
      <div
        className="image-parallax h-full w-full"
        style={{
          transform: isVisible ? `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)` : "none",
        }}
      >
        <div className={`image-zoom relative h-full w-full ${isLoaded ? "loaded" : ""}`}>
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            fill
            className={`object-cover lazy-image ${isLoaded ? "loaded" : ""}`}
            onLoad={() => setIsLoaded(true)}
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* 1px inset boundary outline to define bounds on bright/white backgrounds */}
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] border border-black/[0.04] dark:border-white/[0.04]" />
        </div>
      </div>
    </div>
  )
}
