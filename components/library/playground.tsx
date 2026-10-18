"use client"

import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { LiquidAsciiDemo } from "@/components/library/liquid-ascii-demo"

export type PlaygroundConfig = {
  speed: number
  cellSize: number
  gravity: number
  fillHeight: number
  cursorRadius: number
  cursorForce: number
  autoWave: boolean
}

export const DEFAULTS: PlaygroundConfig = {
  speed: 1,
  cellSize: 12,
  gravity: -25,
  fillHeight: 0.5,
  cursorRadius: 0.25,
  cursorForce: 66,
  autoWave: true,
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
        <span className="font-mono uppercase tracking-wider">{label}</span>
        <span className="font-mono text-zinc-900 dark:text-zinc-100" aria-hidden="true">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
      />
    </label>
  )
}

export function Playground({
  onConfig,
}: {
  onConfig: (c: PlaygroundConfig) => void
}) {
  const [cfg, setCfg] = useState<PlaygroundConfig>(DEFAULTS)
  const set = <K extends keyof PlaygroundConfig>(k: K, v: PlaygroundConfig[K]) => {
    const next = { ...cfg, [k]: v }
    setCfg(next)
    onConfig(next)
  }
  const reset = () => {
    setCfg(DEFAULTS)
    onConfig(DEFAULTS)
  }

  return (
    <div className="rounded-2xl border border-zinc-900/10 dark:border-white/10 overflow-hidden bg-zinc-900/[0.015] dark:bg-white/[0.02]">
      <div className="h-[380px] md:h-[440px] relative">
        <LiquidAsciiDemo
          speed={cfg.speed}
          cellSize={cfg.cellSize}
          gravity={cfg.gravity}
          fillHeight={cfg.fillHeight}
          cursorRadius={cfg.cursorRadius}
          cursorForce={cfg.cursorForce}
          autoWave={cfg.autoWave}
        />
        <p className="pointer-events-none absolute top-3 left-3 rounded-full bg-zinc-900/80 dark:bg-black/60 text-white backdrop-blur px-3 py-1 text-[11px] font-mono">
          drag through the fluid
        </p>
      </div>
      <div className="border-t border-zinc-900/10 dark:border-white/10 px-4 py-4 md:px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Customize
          </h3>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <Slider label="speed" value={cfg.speed} min={0.1} max={3} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => set("speed", v)} />
          <Slider label="cell size" value={cfg.cellSize} min={6} max={30} step={1} format={(v) => `${v}px`} onChange={(v) => set("cellSize", v)} />
          <Slider label="gravity" value={cfg.gravity} min={-50} max={0} step={1} format={(v) => `${v}`} onChange={(v) => set("gravity", v)} />
          <Slider label="fill height" value={cfg.fillHeight} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => set("fillHeight", v)} />
          <Slider label="cursor radius" value={cfg.cursorRadius} min={0.05} max={0.5} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => set("cursorRadius", v)} />
          <Slider label="cursor force" value={cfg.cursorForce} min={0} max={200} step={1} format={(v) => `${v}`} onChange={(v) => set("cursorForce", v)} />
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span id="autowave-label">Auto wave <span className="text-zinc-400 dark:text-zinc-500">(idle motion)</span></span>
            <button
              type="button"
              role="switch"
              aria-checked={cfg.autoWave}
              aria-labelledby="autowave-label"
              onClick={() => set("autoWave", !cfg.autoWave)}
              className={`relative w-9 h-5 rounded-full transition-colors ${cfg.autoWave ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-900/15 dark:bg-white/15"}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-all ${cfg.autoWave ? "left-[18px] bg-white dark:bg-zinc-900" : "left-0.5 bg-white dark:bg-zinc-400"}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
