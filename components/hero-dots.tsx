"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import TextWithBlur from "@/components/text-with-blur"

const LiquidAscii = dynamic(() => import("@/components/liquid-ascii"), {
  ssr: false,
  loading: () => null,
})

function RedDot() {
  return (
    <span
      title="coming soon"
      aria-hidden="true"
      style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: "#ff6b6b", opacity: 0.6, flexShrink: 0, display: "block" }}
    />
  )
}

function YellowDot() {
  return (
    <span
      title="coming soon"
      aria-hidden="true"
      style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: "#feca57", opacity: 0.6, flexShrink: 0, display: "block" }}
    />
  )
}

/**
 * HeroDots — dots row + fluid easter egg (desktop only).
 * On mobile the green dot is inert: nothing mounts, nothing loads,
 * zero cost. The canvas portals to body, so it adds zero space.
 */
export default function HeroDots() {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const sync = () => {
      setIsMobile(mq.matches)
      if (mq.matches) setOpen(false)
    }
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  const toggle = useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches) return
    setOpen((v) => !v)
  }, [])

  return (
    <>
      <TextWithBlur delay={350}>
        <div className="flex gap-2 mt-8 select-none items-center" role="group" aria-label="Decorative dots">
          <RedDot />
          <YellowDot />
          {isMobile ? (
            <span
              title="desktop only"
              aria-hidden="true"
              style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: "#1dd1a1", opacity: 0.6, flexShrink: 0, display: "block" }}
            />
          ) : (
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle liquid ASCII easter egg"
            aria-pressed={open}
            title="psst… click me"
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              backgroundColor: "#1dd1a1",
              opacity: open ? 1 : 0.6,
              boxShadow: open ? "0 0 8px #1dd1a1" : "none",
              flexShrink: 0,
              display: "block",
              padding: 0,
              border: "none",
              cursor: "pointer",
            }}
          />
          )}
        </div>
      </TextWithBlur>
      {open && !isMobile && <LiquidAscii onClose={close} />}
    </>
  )
}
