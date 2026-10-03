"use client"

import { useEffect, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import { Check, Moon, RotateCcw, Sun } from "lucide-react"
import { TINT_PRESETS } from "@/lib/theme-tint"

interface ThemeTintPickerProps {
  /** Current tint, `#rrggbb`. */
  value: string
  /** Whether a custom tint is currently applied (mode switch hides while true). */
  tintActive: boolean
  /** Fired when a preset swatch is chosen. */
  onChange: (hex: string) => void
  onReset: () => void
  onClose: () => void
}

/**
 * ThemeTintPicker — preset theme colors for the red-dot easter egg. No
 * custom picking, just options: a row of curated swatches, a Light/Dark
 * mode switch, Reset and Done. Tab cycles inside the panel while open.
 */
export default function ThemeTintPicker({
  value,
  tintActive,
  onChange,
  onReset,
  onClose,
}: ThemeTintPickerProps) {
  const [isDark, setIsDark] = useState(false)

  // Light / dark mode lives here too, next to the tints — same mechanism as
  // the header toggle (html.dark class + localStorage), so the two never fight.
  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"))
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  function setMode(darkMode: boolean) {
    setIsDark(darkMode)
    if (darkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
    try {
      localStorage.setItem("theme", darkMode ? "dark" : "light")
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }

  // Keep Tab cycling inside the panel while it is open.
  function onRootKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return
    const root = event.currentTarget
    const items = Array.from(
      root.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )
    ).filter((el) => el.tabIndex >= 0)
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || !root.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Site theme colors"
      onKeyDown={onRootKey}
      className="max-h-[calc(100dvh-16px)] w-[248px] max-w-[calc(100vw-16px)] overflow-y-auto rounded-xl border border-black/10 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-zinc-900"
    >
      {/* Preview row */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="h-9 w-9 shrink-0 rounded-full border border-black/10 dark:border-white/15"
          style={{ backgroundColor: value }}
        />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-xs font-medium text-black dark:text-white">
            Theme color
          </p>
          <p className="font-mono text-[11px] uppercase text-black/50 dark:text-white/50">
            {value}
          </p>
        </div>
      </div>

      {/* Presets */}
      <div
        className="mt-2.5 flex items-center justify-between"
        role="group"
        aria-label="Preset theme colors"
      >
        {TINT_PRESETS.map((preset) => {
          const selected = preset.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              aria-label={`Use theme color ${preset}`}
              aria-pressed={selected}
              title={preset}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border shadow-sm outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/60 ${
                selected
                  ? "border-black/60 ring-2 ring-black/30 dark:border-white/80 dark:ring-white/30"
                  : "border-black/10 bg-white dark:border-white/25 dark:bg-white/10"
              }`}
            >
              <span
                aria-hidden="true"
                className="block h-4 w-4 rounded-full"
                style={{ backgroundColor: preset }}
              />
            </button>
          )
        })}
      </div>

      {/* Appearance — light/dark mode. Removed while a theme color is set
          (the look is frozen then); a hint explains where it went. */}
      {tintActive ? (
        <p className="mt-2.5 border-t border-black/5 pt-2.5 text-[11px] font-light text-black/40 dark:border-white/10 dark:text-white/40">
          Light/Dark is paused while a theme color is set — Reset brings it back.
        </p>
      ) : (
      <div className="mt-2.5 border-t border-black/5 pt-2.5 dark:border-white/10">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-black/50 dark:text-white/50">Appearance</span>
        <div className="flex items-center gap-0.5 rounded-md bg-black/[0.04] p-0.5 dark:bg-white/[0.06]" role="group" aria-label="Light or dark mode">
          {(
            [
              { id: false, label: "Light", Icon: Sun },
              { id: true, label: "Dark", Icon: Moon },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={isDark === id}
              className={`inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-[11px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/60 ${
                isDark === id
                  ? "bg-black/[0.08] text-black dark:bg-white/[0.15] dark:text-white"
                  : "text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>
      </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2.5 dark:border-white/10">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-black/50 transition-colors hover:bg-black/5 hover:text-black dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <RotateCcw size={12} /> Reset
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-black"
        >
          <Check size={12} /> Done
        </button>
      </div>
    </div>
  )
}
