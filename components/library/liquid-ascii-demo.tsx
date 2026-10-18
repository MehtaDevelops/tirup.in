"use client"

import { useEffect, useRef } from "react"

/**
 * LiquidAsciiDemo: self-owned FLIP fluid rendered as ASCII, in a box.
 * Zero dependencies. Single grid: cellSize drives sim + render together.
 *
 * Props mirror the familiar spec: speed, cellSize, gravity (-50–0),
 * fillHeight, cursorRadius, cursorForce, autoWave.
 */

export type LiquidAsciiDemoProps = {
  speed?: number
  cellSize?: number
  gravity?: number
  fillHeight?: number
  cursorRadius?: number
  cursorForce?: number
  autoWave?: boolean
  className?: string
}

const GLYPHS =
  " .·'`^,:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"

const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v
const fract = (n: number) => n - Math.floor(n)
const hash1 = (n: number) => fract(Math.sin(n * 12.9898) * 43758.5453)

// Pre-built fill styles keyed by quantized alpha (0.0–0.9, step 0.05).
// Avoids allocating an `rgba(...)` string per glyph per frame.
const DARK_STYLES: string[] = []
const LIGHT_STYLES: string[] = []
for (let q = 0; q <= 18; q++) {
  const a = (q * 0.05).toFixed(2)
  DARK_STYLES[q] = `rgba(244,244,245,${a})`
  LIGHT_STYLES[q] = `rgba(18,19,20,${a})`
}
const styleFor = (alpha: number, dark: boolean) => {
  const q = clamp(Math.round(alpha * 20), 0, 18)
  return dark ? DARK_STYLES[q] : LIGHT_STYLES[q]
}

export function LiquidAsciiDemo({
  speed = 1,
  cellSize = 10,
  gravity = -25,
  fillHeight = 0.5,
  cursorRadius = 0.25,
  cursorForce = 66,
  autoWave = true,
  className = "",
}: LiquidAsciiDemoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const cfgRef = useRef({ speed, cellSize, gravity, fillHeight, cursorRadius, cursorForce, autoWave })
  cfgRef.current = { speed, cellSize, gravity, fillHeight, cursorRadius, cursorForce, autoWave }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const cfg = () => cfgRef.current

    let raf = 0
    let W = 0
    let H = 0
    let nx = 0
    let ny = 0
    let h = 15
    // MAC (staggered) grid: U lives on vertical faces (ny rows of nx+1),
    // V on horizontal faces (ny+1 rows of nx). Faces touching a solid cell
    // are wall faces: always zero, never touched by the pressure gradient.
    let U = new Float32Array(0)
    let V = new Float32Array(0)
    let U0 = new Float32Array(0)
    let V0 = new Float32Array(0)
    let WU = new Float32Array(0)
    let WV = new Float32Array(0)
    let pr = new Float32Array(0)
    let cnt = new Uint16Array(0)
    let fluid = new Uint8Array(0)
    let rspd = new Float32Array(0)
    let surfRow = new Float32Array(0)
    // Display-only state: temporally smoothed density (anti-flicker) and the
    // raw surface target per column. Physics never reads these.
    let dcnt = new Float32Array(0)
    let surfT = new Float32Array(0)
    const PMAX = 20000
    const px = new Float32Array(PMAX)
    const py = new Float32Array(PMAX)
    const pu = new Float32Array(PMAX)
    const pv = new Float32Array(PMAX)
    let active = 0
    let seeded = 0
    let lastMX = -9999
    let lastMY = -9999
    let lastT = 0
    let cvx = 0
    let cvy = 0
    let lastInput = 0
    let prevMaxS = 999
    let frame = 0
    let visible = true
    let inView = true
    let sleeping = false
    let running = false
    let dtCur = 1 / 60
    let lastCell = clamp(cfg().cellSize, 6, 30)
    let resizeTimer = 0
    let isDarkNow = document.documentElement.classList.contains("dark")
    // Resolve the site's mono font at runtime: next/font registers JetBrains
    // Mono under a hashed family name exposed as --font-jetbrains-mono, and a
    // canvas never sees CSS font stacks alone. Falls back to system mono.
    let monoFamily: string | null = null
    const resolveMonoFamily = () =>
      (monoFamily ??= getComputedStyle(document.documentElement)
        .getPropertyValue("--font-jetbrains-mono")
        .trim() || '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace')

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // High FLIP share keeps the motion lively; PIC share keeps it stable.
    const FLIP = 0.72
    const PPC = 4
    // Wall gap is a fraction of a cell. The old full-cell margin pinned a
    // visible dead lane along both side walls. Free-slip: kill only the
    // normal component, keep the tangential slide with light friction.
    const wallGap = () => h * 0.35
    const WALL_FRICTION = 0.985

    const themeObs = new MutationObserver(() => {
      isDarkNow = document.documentElement.classList.contains("dark")
      if (sleeping) draw()
    })
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    const isSolid = (i: number, j: number) => i <= 0 || j <= 0 || i >= nx - 1 || j >= ny - 1

    const Ui = (i: number, j: number) => j * (nx + 1) + i
    const Vi = (i: number, j: number) => j * nx + i
    // A face bordering any solid cell is a wall face: prescribed zero
    // (no penetration), so tangential slide survives while normal flow stops.
    const isWallU = (i: number) => i <= 1 || i >= nx - 1
    const isWallV = (j: number) => j <= 1 || j >= ny - 1

    const zeroWallFaces = () => {
      for (let j = 0; j < ny; j++)
        for (let i = 0; i <= nx; i++) if (isWallU(i)) U[Ui(i, j)] = 0
      for (let j = 0; j <= ny; j++)
        for (let i = 0; i < nx; i++) if (isWallV(j)) V[Vi(i, j)] = 0
    }

    const splatFaces = (
      F: Float32Array, W: Float32Array, SW: number, SH: number,
      gx: number, gy: number, val: number
    ) => {
      const i0 = Math.floor(gx)
      const j0 = Math.floor(gy)
      const fx = gx - i0
      const fy = gy - j0
      const tap = (i: number, j: number, w: number) => {
        if (i < 0 || j < 0 || i >= SW || j >= SH) return
        F[j * SW + i] += w * val
        W[j * SW + i] += w
      }
      tap(i0, j0, (1 - fx) * (1 - fy))
      tap(i0 + 1, j0, fx * (1 - fy))
      tap(i0, j0 + 1, (1 - fx) * fy)
      tap(i0 + 1, j0 + 1, fx * fy)
    }

    const sampleFaces = (
      F: Float32Array, SW: number, SH: number,
      gx: number, gy: number
    ) => {
      const i0 = Math.floor(gx)
      const j0 = Math.floor(gy)
      const fx = gx - i0
      const fy = gy - j0
      const at = (i: number, j: number) =>
        F[clamp(j, 0, SH - 1) * SW + clamp(i, 0, SW - 1)]
      return (
        at(i0, j0) * (1 - fx) * (1 - fy) +
        at(i0 + 1, j0) * fx * (1 - fy) +
        at(i0, j0 + 1) * (1 - fx) * fy +
        at(i0 + 1, j0 + 1) * fx * fy
      )
    }

    // Samples read INTERIOR faces only. Wall faces are strict zeros for the
    // solve, but sampling them damps every near-wall particle toward
    // stillness while gravity keeps refilling downward motion: a one-way
    // ratchet that slowly drains the tank. Interior sampling removes it.
    const sampleU = (F: Float32Array, x: number, y: number) =>
      sampleFaces(F, nx + 1, ny, clamp(x / h, 2, nx - 2.001), clamp(y / h - 0.5, 0, ny - 1.001))
    const sampleV = (F: Float32Array, x: number, y: number) =>
      sampleFaces(F, nx, ny + 1, clamp(x / h - 0.5, 0, nx - 1.001), clamp(y / h, 2, ny - 2.001))

    const draw = () => {
      ctx.setTransform(dpr(), 0, 0, dpr(), 0, 0)
      ctx.clearRect(0, 0, W, H)
      const cw = W / nx
      const chh = H / ny
      const dark = isDarkNow
      const fillH = cfg().fillHeight
      const depthDenom = ny * fillH + 2
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = `${Math.round(h * 0.95)}px ${resolveMonoFamily()}`
      const n = GLYPHS.length
      // Temporal anti-alias: blend the displayed density toward the physical
      // one. Display-only — bin() keeps exact counts for physics, solver and
      // touch detection; this only decouples ink from single-frame spikes.
      // While the loop is paused (settled theme switch, resize re-draw) there
      // is no next frame to converge on, so snap instead of blend.
      if (running) {
        for (let i = 0; i < dcnt.length; i++) dcnt[i] += (cnt[i] - dcnt[i]) * 0.34
      } else {
        dcnt.set(cnt)
      }
      // Smoothed waterline: raw per-column surface into surfT, then an
      // asymmetric EMA into the rendered line — rising water snaps, receding
      // water settles calm, so waves read as surface motion instead of
      // per-frame row flicker below the surface glyph band.
      for (let x = 0; x < nx; x++) {
        let s = ny
        for (let y = 0; y < ny; y++) {
          let sup = dcnt[y * nx + x]
          if (x > 0) sup += dcnt[y * nx + x - 1]
          if (x < nx - 1) sup += dcnt[y * nx + x + 1]
          if (sup >= 2.4) {
            s = y
            break
          }
        }
        surfT[x] = s
        const prev = surfRow[x]
        surfRow[x] = running
          ? prev + (s - prev) * (s < prev ? 0.55 : 0.14)
          : s
      }
      for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
          const i = y * nx + x
          const c = dcnt[i]
          const depth = y - surfRow[x]
          let idx: number
          let alpha: number
          if (depth < -0.5) {
            // air: only fast spray renders — a high bar keeps the air clean
            // instead of a faint static band, so clouds read as real spit
            if (c < 1) continue
            const asp = rspd[i] / c
            if (asp < 190) continue
            idx = Math.max(
              1,
              Math.min(n - 2, Math.floor(n * 0.55 + Math.min(1, asp / 1200) * n * 0.4))
            )
            alpha = Math.min(0.62, 0.24 + asp * 0.00042)
          } else if (depth < 0.9) {
            idx = n - 1 - Math.floor(hash1(x + 1) * 3)
            alpha = 0.9
          } else {
            if (c < 0.5) continue
            const fade = Math.max(0, 1 - depth / depthDenom)
            const hh = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1
            const w = hh * fade + Math.min(1.2, (rspd[i] / Math.max(1, c)) * 0.0007 + c * 0.06)
            if (w < 0.15) continue
            idx = Math.max(1, Math.min(n - 2, Math.floor(w * n)))
            alpha = Math.min(0.92, 0.3 + w * 0.48)
          }
          ctx.fillStyle = styleFor(alpha, dark)
          ctx.fillText(GLYPHS[idx], x * cw + cw / 2, y * chh + chh / 2)
        }
      }
    }

    const dpr = () => Math.min(window.devicePixelRatio || 1, 2)

    const bin = () => {
      cnt.fill(0)
      fluid.fill(0)
      rspd.fill(0)
      for (let p = 0; p < active; p++) {
        const i = clamp(Math.floor(px[p] / h), 0, nx - 1)
        const j = clamp(Math.floor(py[p] / h), 0, ny - 1)
        const k = j * nx + i
        cnt[k]++
        const ux = pu[p]
        const vy = pv[p]
        const sp = Math.sqrt(ux * ux + vy * vy)
        if (sp === sp) rspd[k] += sp
      }
      for (let j = 1; j < ny - 1; j++)
        for (let i = 1; i < nx - 1; i++) if (cnt[j * nx + i] > 0) fluid[j * nx + i] = 1
    }

    const step = (paint: boolean) => {
      frame++
      const c = cfg()
      const g = (Math.abs(c.gravity) / 25) * 1500
      for (let p = 0; p < active; p++) pv[p] += g * dtCur
      U.fill(0)
      V.fill(0)
      WU.fill(0)
      WV.fill(0)
      for (let p = 0; p < active; p++) {
        splatFaces(U, WU, nx + 1, ny,
          clamp(px[p] / h, 0, nx - 0.001), clamp(py[p] / h - 0.5, 0, ny - 1.001), pu[p])
        splatFaces(V, WV, nx, ny + 1,
          clamp(px[p] / h - 0.5, 0, nx - 1.001), clamp(py[p] / h, 0, ny - 0.001), pv[p])
      }
      for (let i = 0; i < U.length; i++) if (WU[i] > 1e-9) U[i] /= WU[i]
      for (let i = 0; i < V.length; i++) if (WV[i] > 1e-9) V[i] /= WV[i]
      zeroWallFaces()
      U0.set(U)
      V0.set(V)
      const h2dt = (h * h) / dtCur
      for (let it = 0; it < 30; it++) {
        for (let j = 1; j < ny - 1; j++) {
          for (let i = 1; i < nx - 1; i++) {
            const k = j * nx + i
            if (!fluid[k]) continue
            let sum = 0
            let nn = 0
            if (!isSolid(i - 1, j)) {
              nn++
              if (fluid[k - 1]) sum += pr[k - 1]
            }
            if (!isSolid(i + 1, j)) {
              nn++
              if (fluid[k + 1]) sum += pr[k + 1]
            }
            if (!isSolid(i, j - 1)) {
              nn++
              if (fluid[k - nx]) sum += pr[k - nx]
            }
            if (!isSolid(i, j + 1)) {
              nn++
              if (fluid[k + nx]) sum += pr[k + nx]
            }
            if (nn === 0) continue
            // Compact 1-cell divergence straight from the faces. Wall faces
            // are prescribed zero, so the floor and sides feed the true
            // no-penetration signal into the solve: no fake inflow, and the
            // gradient below is its exact adjoint, so pressure can neither
            // pump energy in nor leak volume out.
            const div = (U[Ui(i + 1, j)] - U[Ui(i, j)] + V[Vi(i, j + 1)] - V[Vi(i, j)]) / h
            pr[k] += 1.5 * ((sum - div * h2dt) / nn - pr[k])
          }
        }
      }
      // Compact gradient onto interior faces only. Wall faces stay
      // prescribed zero. Air-side pressure reads as 0 (free surface).
      for (let j = 1; j < ny - 1; j++) {
        for (let i = 2; i < nx - 1; i++) {
          const k = j * nx + i
          U[Ui(i, j)] -= dtCur * (((fluid[k] ? pr[k] : 0) - (fluid[k - 1] ? pr[k - 1] : 0)) / h)
        }
      }
      for (let j = 2; j < ny - 1; j++) {
        for (let i = 1; i < nx - 1; i++) {
          const k = j * nx + i
          V[Vi(i, j)] -= dtCur * (((fluid[k] ? pr[k] : 0) - (fluid[k - nx] ? pr[k - nx] : 0)) / h)
        }
      }
      zeroWallFaces()
      let maxS = 0
      for (let p = 0; p < active; p++) {
        const picU = sampleU(U, px[p], py[p])
        const picV = sampleV(V, px[p], py[p])
        const flipU = pu[p] + (picU - sampleU(U0, px[p], py[p]))
        const flipV = pv[p] + (picV - sampleV(V0, px[p], py[p]))
        let nu = (1 - FLIP) * picU + FLIP * flipU
        let nv = (1 - FLIP) * picV + FLIP * flipV
        const sp = Math.sqrt(nu * nu + nv * nv)
        if (sp > 1500) {
          nu *= 1500 / sp
          nv *= 1500 / sp
        }
        pu[p] = nu
        pv[p] = nv
        if (sp > maxS) maxS = sp
        px[p] += nu * dtCur
        py[p] += nv * dtCur
        const wg = wallGap()
        if (px[p] < wg) {
          px[p] = wg
          if (pu[p] < 0) pu[p] = pu[p] < -150 ? -pu[p] * 0.45 : 0
          pv[p] *= WALL_FRICTION
        } else if (px[p] > W - wg) {
          px[p] = W - wg
          if (pu[p] > 0) pu[p] = pu[p] > 150 ? -pu[p] * 0.45 : 0
          pv[p] *= WALL_FRICTION
        }
        if (py[p] < wg) {
          py[p] = wg
          if (pv[p] < 0) pv[p] = pv[p] < -150 ? -pv[p] * 0.45 : 0
          pu[p] *= WALL_FRICTION
        } else if (py[p] > H - wg) {
          py[p] = H - wg
          if (pv[p] > 0) pv[p] = pv[p] > 150 ? -pv[p] * 0.35 : 0
          pu[p] *= WALL_FRICTION
        }
      }
      if (prevMaxS >= 15) {
        const kept = new Uint16Array(nx * ny)
        const wg = wallGap()
        for (let s = 0; s < 2; s++) {
          bin()
          kept.fill(0)
          for (let p = 0; p < active; p++) {
            const i = clamp(Math.floor(px[p] / h), 1, nx - 2)
            const j = clamp(Math.floor(py[p] / h), 1, ny - 2)
            const k = j * nx + i
            if (kept[k] < PPC) kept[k]++
            else {
              px[p] = clamp(px[p] + (hash1(p * 3 + s * 131 + frame * 17) - 0.5) * h * 0.5, wg, W - wg)
              py[p] = clamp(py[p] + (hash1(p * 7 + s * 17 + frame * 41) - 0.5) * h * 0.5, wg, H - wg)
            }
          }
        }
      }
      bin()
      if (active < seeded * 0.8) {
        let need = Math.min(seeded - active, 200)
        const wg = wallGap()
        while (need-- > 0 && active < PMAX) {
          px[active] = wg + Math.random() * (W - 2 * wg)
          py[active] = H * (1 - c.fillHeight) + Math.random() * (H * c.fillHeight - wg)
          pu[active] = 0
          pv[active] = 0
          active++
        }
        bin()
      }
      if (paint) draw()
      prevMaxS = maxS
      return maxS
    }

    const syncCellSize = () => {
      // cellSize changes rebuild grids live: particles kept, then density
      // matched to the new cell count, so the quantity stays put.
      // Checked once per frame. No polling timer needed.
      const target = clamp(cfg().cellSize, 6, 30)
      if (target === lastCell) return
      lastCell = target
      const keep = Math.min(active, PMAX)
      const sx = px.slice(0, keep)
      const sy = py.slice(0, keep)
      const su = pu.slice(0, keep)
      const sv = pv.slice(0, keep)
      rebuild()
      const wg = wallGap()
      for (let p = 0; p < keep; p++) {
        px[p] = clamp(sx[p], wg, W - wg)
        py[p] = clamp(sy[p], wg, H - wg)
        pu[p] = su[p]
        pv[p] = sv[p]
      }
      active = keep
      matchDensity()
      draw()
      wake()
    }

    let last = performance.now()
    const tick = (now: number) => {
      if (!visible || !inView) {
        running = false
        return
      }
      const c = cfg()
      syncCellSize()
      const dt = Math.max(Math.min((now - last) / 1000, 1 / 45), 1 / 240) * c.speed
      last = now
      dtCur = dt / 2
      step(false)
      const maxS = step(true)
      if (!Number.isFinite(maxS)) {
        seed()
        draw()
      }
      // Idle wave: a slow swell travelling across the surface so the
      // showcase keeps breathing when untouched. Applies every frame
      // while idle (no input for 2s); any touch pauses it via lastInput.
      if (c.autoWave && now - lastInput > 2000) {
        const t = now * 0.0016
        const span = Math.max(1, W)
        for (let p = 0; p < active; p++) {
          const i = Math.floor(px[p] / h)
          if (i < 1 || i >= nx - 1) continue
          const j = Math.floor(py[p] / h)
          if (j <= 0 || j >= ny) continue
          const k = j * nx + i
          // surface fluid only: fluid here, air directly above
          if (!fluid[k] || fluid[k - nx]) continue
          const phase = (px[p] / span) * Math.PI * 2 - t
          pv[p] += Math.sin(phase) * 9
          pu[p] += Math.cos(phase) * 3.5
        }
      }
      if (!c.autoWave && maxS < 4 && now - lastInput > 900) {
        sleeping = true
        running = false
        return
      }
      raf = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (reducedMotion || running) return
      if (!visible || !inView) return
      sleeping = false
      running = true
      prevMaxS = 999
      last = performance.now()
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }

    const seed = () => {
      const c = cfg()
      active = 0
      const y0 = H * (1 - c.fillHeight)
      for (let j = 1; j < ny - 1 && active < PMAX; j++) {
        for (let i = 1; i < nx - 1 && active < PMAX; i++) {
          if ((j + 0.5) * h < y0) continue
          for (let n = 0; n < PPC && active < PMAX; n++) {
            px[active] = (i + Math.random()) * h
            py[active] = (j + Math.random()) * h
            pu[active] = 0
            pv[active] = 0
            active++
          }
        }
      }
      seeded = active
      pr.fill(0)
      bin()
    }

    // How many particles the current grid + fillHeight needs for constant
    // density (PPC per fluid cell). Used to top up after a cell-size or box
    // change so the liquid level never thins out when things get smaller.
    const targetCount = () => {
      const y0 = H * (1 - cfg().fillHeight)
      let cells = 0
      for (let j = 1; j < ny - 1; j++) {
        if ((j + 0.5) * h < y0) continue
        cells += nx - 2
      }
      return Math.min(PMAX, cells * PPC)
    }

    // Hold exact density across cell-size or box changes: top up with fresh
    // still particles when short, thin randomly when over. Random thinning
    // is invisible in a dense field, and constant particles-per-cell means
    // the quantity of liquid never changes in any box, at any cell size.
    const matchDensity = () => {
      const c = cfg()
      const wg = wallGap()
      const y0 = H * (1 - c.fillHeight)
      const span = Math.max(1, H - wg - y0)
      let need = targetCount() - active
      while (need-- > 0 && active < PMAX) {
        px[active] = wg + Math.random() * Math.max(1, W - 2 * wg)
        py[active] = Math.min(H - wg, y0 + Math.random() * span)
        pu[active] = 0
        pv[active] = 0
        active++
      }
      const target = targetCount()
      while (active > target) {
        const victim = (Math.random() * active) | 0
        active--
        px[victim] = px[active]
        py[victim] = py[active]
        pu[victim] = pu[active]
        pv[victim] = pv[active]
      }
      seeded = active
      bin()
    }

    const rebuild = () => {
      const r = canvas.getBoundingClientRect()
      W = Math.max(200, Math.floor(r.width))
      H = Math.max(200, Math.floor(r.height || 320))
      h = lastCell
      const scale = dpr()
      canvas.width = Math.floor(W * scale)
      canvas.height = Math.floor(H * scale)
      nx = Math.max(8, Math.floor(W / h))
      ny = Math.max(8, Math.floor(H / h))
      const n = nx * ny
      U = new Float32Array(ny * (nx + 1))
      V = new Float32Array((ny + 1) * nx)
      U0 = new Float32Array(ny * (nx + 1))
      V0 = new Float32Array((ny + 1) * nx)
      WU = new Float32Array(ny * (nx + 1))
      WV = new Float32Array((ny + 1) * nx)
      pr = new Float32Array(n)
      cnt = new Uint16Array(n)
      fluid = new Uint8Array(n)
      rspd = new Float32Array(n)
      dcnt = new Float32Array(n)
      surfRow = new Float32Array(nx)
      surfT = new Float32Array(nx)
      surfRow.fill(ny)
      surfT.fill(ny)
    }

    const resize = () => {
      // Box resize keeps the liquid: positions rescale so the relative level
      // is unchanged, then density is topped up for the new grid.
      const oldW = W
      const oldH = H
      rebuild()
      if (oldW > 0 && oldH > 0 && active > 0) {
        const sx = W / oldW
        const sy = H / oldH
        const wg = wallGap()
        const keep = Math.min(active, PMAX)
        for (let p = 0; p < keep; p++) {
          px[p] = clamp(px[p] * sx, wg, W - wg)
          py[p] = clamp(py[p] * sy, wg, H - wg)
        }
        active = keep
        pr.fill(0)
        matchDensity()
      } else {
        seed()
      }
      draw()
      wake()
    }

    const queueResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 120)
    }

    // ResizeObserver alone covers window resizes that change the canvas box,
    // so no separate window resize listener (avoids double rebuilds).
    const ro = new ResizeObserver(queueResize)
    ro.observe(canvas)
    resize()

    // Kick the self-hosted mono font into loading before the first settled
    // draw, so sleeping/reduced-motion canvases never render in a fallback
    // face and then swap glyphs later.
    if (typeof document !== "undefined" && document.fonts) {
      void document.fonts
        .load(`16px ${resolveMonoFamily()}`)
        .then(() => draw())
        .catch(() => {})
    }

    const io = new IntersectionObserver(([e]) => {
      const was = inView
      inView = e.isIntersecting
      if (inView && !was) wake()
    })
    io.observe(canvas)

    const touching = (cx: number, cy: number) => {
      const i = Math.floor(cx / h)
      const j = Math.floor(cy / h)
      for (let jj = j - 1; jj <= j + 1; jj++)
        for (let ii = i - 1; ii <= i + 1; ii++) {
          if (ii < 1 || jj < 1 || ii >= nx - 1 || jj >= ny - 1) continue
          if (cnt[jj * nx + ii] > 0) return true
        }
      return false
    }

    const FORCE = 1
    const onPoint = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect()
      const x = clientX - r.left
      const y = clientY - r.top
      const now = performance.now()
      const dte = Math.max((now - lastT) / 1000, 1 / 240)
      if (x < 0 || y < 0 || x > r.width || y > r.height) {
        // Keep tracking in canvas space so re-entry velocity stays correct.
        lastMX = x
        lastMY = y
        lastT = now
        return
      }
      const c = cfg()
      if (lastMX > -9000) {
        cvx += (clamp((x - lastMX) / dte, -4000, 4000) - cvx) * 0.45
        cvy += (clamp((y - lastMY) / dte, -4000, 4000) - cvy) * 0.45
      }
      lastT = now
      lastMX = x
      lastMY = y
      if (!touching(x, y)) return
      lastInput = now
      const R = c.cursorRadius * Math.min(W, H)
      const fscale = c.cursorForce / 66
      const spd = Math.sqrt(cvx * cvx + cvy * cvy)
      for (let p = 0; p < active; p++) {
        const dx = px[p] - x
        const dy = py[p] - y
        const d2 = dx * dx + dy * dy
        if (d2 > R * R) continue
        const d = Math.sqrt(d2)
        let f = 1 - d / R
        f *= f
        pu[p] += (cvx * 0.3 + (dx / (d + 1)) * spd * 0.3) * f * fscale * FORCE
        pv[p] += (cvy * 0.3 + (dy / (d + 1)) * spd * 0.3) * f * fscale * FORCE
      }
      wake()
    }
    const onPointerMove = (e: PointerEvent) => onPoint(e.clientX, e.clientY)
    const onPointerDown = (e: PointerEvent) => onPoint(e.clientX, e.clientY)
    const onPointerEnd = () => {
      // Drop stale tracking so the next stroke starts fresh, not flung.
      lastMX = -9999
      lastMY = -9999
      cvx = 0
      cvy = 0
    }
    canvas.addEventListener("pointermove", onPointerMove, { passive: true })
    canvas.addEventListener("pointerdown", onPointerDown, { passive: true })
    canvas.addEventListener("pointerleave", onPointerEnd, { passive: true })
    canvas.addEventListener("pointercancel", onPointerEnd, { passive: true })

    const onVis = () => {
      visible = !document.hidden
      if (visible) {
        last = performance.now()
        wake()
      }
    }
    document.addEventListener("visibilitychange", onVis)

    if (reducedMotion) {
      draw()
    } else {
      draw()
      wake()
    }

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointerleave", onPointerEnd)
      canvas.removeEventListener("pointercancel", onPointerEnd)
      document.removeEventListener("visibilitychange", onVis)
      themeObs.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-label="Interactive liquid ASCII fluid demo. Move your cursor through it"
      className={`block h-full w-full cursor-crosshair touch-none select-none ${className}`}
    >
      Liquid ASCII fluid simulation. Enable JavaScript and move your cursor through it.
    </canvas>
  )
}
