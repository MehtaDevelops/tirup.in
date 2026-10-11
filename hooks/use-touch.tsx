"use client"

import { useState, useEffect } from "react"

export function useTouch() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    // Check if the device supports touch events
    const touchSupported = "ontouchstart" in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(touchSupported)
  }, [])

  return isTouchDevice
}
