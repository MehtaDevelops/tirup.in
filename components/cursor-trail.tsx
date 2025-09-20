"use client"

import { useEffect, useState } from "react"

export default function CursorTrail() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState<{ x: number; y: number; opacity: number }[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", updateMousePosition)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
    }
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const interval = setInterval(() => {
      setTrail((prevTrail) => {
        // Add new position to the beginning
        const newTrail = [
          { x: mousePosition.x, y: mousePosition.y, opacity: 0.5 },
          ...prevTrail.slice(0, 5).map((point) => ({
            ...point,
            opacity: point.opacity * 0.8, // Fade out
          })),
        ]
        return newTrail
      })
    }, 50)

    return () => clearInterval(interval)
  }, [mousePosition, isMounted])

  if (!isMounted) return null

  return (
    <>
      {trail.map((point, index) => (
        <div
          key={index}
          className="cursor-trail"
          style={{
            left: point.x,
            top: point.y,
            opacity: point.opacity,
            width: `${8 - index}px`,
            height: `${8 - index}px`,
          }}
        />
      ))}
    </>
  )
}
