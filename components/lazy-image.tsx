"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface LazyImageProps {
  src: string
  alt: string
  priority?: boolean
}

export default function LazyImage({ src, alt, priority = false }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (priority) {
      setIsLoaded(true)
    }
  }, [priority])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setIsLoaded(true)}
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      {/* 1px inset boundary outline to define bounds on bright/white backgrounds */}
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] border border-black/[0.04] dark:border-white/[0.04]" />
    </div>
  )
}
