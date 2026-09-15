"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

/**
 * LiquidAscii — self-owned FLIP fluid (Zhu & Bridson style), mapped onto
 * the React Bits Pro prop spec. No Pro dependency, no license, no registry.
 *
 * | Pro prop        | Pro default | Ours                                             |
 * |-----------------|-------------|--------------------------------------------------|
 * | speed           | 0.9         | 1.15                                             |
 * | cellSize        | 15 (6–30)   | 30 sim grid (12 render / 17 mobile, denser ask)  |
 * | gravity         | -25         | real gravity on particles, px/s²                |
 * | fillHeight      | 0.4         | 0.4                                              |
 * | cursorRadius    | 0.25        | 0.25 × short side                                |
 * | cursorForce     | 66          | 66-equivalent                                    |
 * | flipRatio       | 0.3         | 0.5 PIC/FLIP blend — livelier, less damping      |
 * | pressureIters   | 30          | 30 Gauss-Seidel iterations — the real thing      |
 * | overRelaxation  | 1.5         | 1.5 — the real thing                             |
 * | separationIters | 3           | 3 density passes — the real thing                |
 * | characters      | 11 glyphs   | 70-step ramp (variety request)                   |
 * | autoWave        | true        | false — input only, loop sleeps when settled     |
 *
 * Pipeline per step: cursor → particles → grid (bilinear) → gravity →
 * pressure projection (divergence-free) → grid → particles (PIC/FLIP
 * blend) → advect → walls → separation → ASCII bins.
 *
 * Touch-only cursor: moving through air does nothing. Force applies
 * only while the cursor sits on fluid. No cursor ring, no chrome.
 * Desktop only (mobile never mounts it). Two substeps per frame.
 */

const GLYPHS =
  " .·'`^,:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"

const P = {
  speed: 1.15,
  simCellD: 30,
  simCellM: 32,
  renderCellD: 12,
  renderCellM: 17,
  renderCap: 12000,
  ppc: 5, // particles per sim cell at seed (dense body)
  pmax: 8000,
  gravityPx: 1500, // ≈ Pro gravity -25, scaled to px/s²
  fillHeight: 0.4,
  cursorRadius: 0.25,
  cursorForce: 66,
  flipRatio: 0.5, // Pro default 0.3; raised — less numerical dissipation,
  // motion stays alive longer instead of dying in a second
  pressureIters: 30,
  overRelaxation: 1.5,
  separationIters: 3,
  autoWave: false,
  maxSpeed: 1200, // px/s clamp (CFL stability)
} as const

const FORCE = P.cursorForce / 66
const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v
const fract = (n: number) => n - Math.floor(n)
const hash1 = (n: number) => fract(Math.sin(n * 12.9898) * 43758.5453)

export default function LiquidAscii({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let W = 0
    let H = 0
    // sim grid (coarse — solver lives here)
    let nx = 0
    let ny = 0
    let h: number = P.simCellD
    let u = new Float32Array(0)
    let v = new Float32Array(0)
    let u0 = new Float32Array(0)
    let v0 = new Float32Array(0)
    let pr = new Float32Array(0)
    let wgt = new Float32Array(0)
    let cnt = new Uint16Array(0)
    let fluid = new Uint8Array(0)
    // particles
    let px = new Float32Array(P.pmax)
    let py = new Float32Array(P.pmax)
    let pu = new Float32Array(P.pmax)
    let pv = new Float32Array(P.pmax)
    let active = 0
    let seeded = 0
    // dense ASCII render bins
    let rcols = 0
    let rrows = 0
    let rcell: number = P.renderCellD
    let rcount = new Float32Array(0)
    let rspd = new Float32Array(0)
    let surfRow = new Float32Array(0) // per-column fluid top (render rows)
    // cursor
    let lastMX = -9999
    let lastMY = -9999
    let lastT = 0
    let cvx = 0
    let cvy = 0
    let lastInput = 0
    let frame = 0 // advances every step — separation jitter varies per
    // frame so it averages to zero instead of drifting the pile thin
    let visible = true
    let inView = true
    let sleeping = false
    let running = false
    let isDarkNow = document.documentElement.classList.contains("dark")

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const isSolid = (i: number, j: number) =>
      i <= 0 || j <= 0 || i >= nx - 1 || j >= ny - 1

    // ---- bilinear helpers (collocated centers at (i+.5)*h) ----
    const cellCoords = (x: number, y: number) => {
      let gx = clamp(x / h - 0.5, 0, nx - 1.001)
      let gy = clamp(y / h - 0.5, 0, ny - 1.001)
      const i0 = Math.floor(gx)
      const j0 = Math.floor(gy)
      return { i0, j0, fx: gx - i0, fy: gy - j0 }
    }
    const sample = (f: Float32Array, x: number, y: number) => {
      const { i0, j0, fx, fy } = cellCoords(x, y)
      const a = f[j0 * nx + i0]
      const b = f[j0 * nx + i0 + 1]
      const c = f[(j0 + 1) * nx + i0]
      const d = f[(j0 + 1) * nx + i0 + 1]
      return (
        a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy
      )
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const cw = W / rcols
      const chh = H / rrows
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = `${Math.round(rcell * 0.95)}px ui-monospace, SFMono-Regular, Menlo, monospace`
      const n = GLYPHS.length
      // fluid top per column: first row with neighborhood support (≥3 in
      // a 3-wide window) — lone stuck dots can't fake a surface.
      for (let x = 0; x < rcols; x++) {
        let s = rrows
        for (let y = 0; y < rrows; y++) {
          let sup = rcount[y * rcols + x]
          if (x > 0) sup += rcount[y * rcols + x - 1]
          if (x < rcols - 1) sup += rcount[y * rcols + x + 1]
          if (sup >= 3) {
            s = y
            break
          }
        }
        surfRow[x] = s
      }
      for (let y = 0; y < rrows; y++) {
        for (let x = 0; x < rcols; x++) {
          const i = y * rcols + x
          const c = rcount[i]
          const depth = y - surfRow[x]
          let idx: number
          let alpha: number
          if (depth < -0.5) {
            // air: only fast spray renders — stuck dots stay invisible
            if (c < 1) continue
            const asp = rspd[i] / c
            if (asp < 160) continue
            idx = Math.max(
              1,
              Math.min(
                n - 2,
                Math.floor(n * 0.55 + Math.min(1, asp / 1200) * n * 0.4)
              )
            )
            alpha = Math.min(0.7, 0.3 + asp * 0.0006)
          } else if (depth < 0.9) {
            // dense surface line, like the old tank look
            idx = n - 1 - Math.floor(hash1(x + 1) * 2)
            alpha = 0.65
          } else {
            if (c < 0.5) continue
            const fade = Math.max(0, 1 - depth / (rrows * 0.45))
            const hash =
              Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1
            const w = hash * fade + Math.min(1.2, rspd[i] * 0.0007 + c * 0.1)
            if (w < 0.18) continue
            idx = Math.max(1, Math.min(n - 2, Math.floor(w * n)))
            alpha = Math.min(0.75, 0.2 + w * 0.4)
          }
          ctx.fillStyle = isDarkNow
            ? `rgba(244,244,245,${alpha.toFixed(3)})`
            : `rgba(18,19,20,${alpha.toFixed(3)})`
          ctx.fillText(GLYPHS[idx], x * cw + cw / 2, y * chh + chh / 2)
        }
      }
    }

    let last = performance.now()

    // shared render-bin pass: particles → dense ASCII counts
    const renderParticles = () => {
      rcount.fill(0)
      rspd.fill(0)
      for (let p = 0; p < active; p++) {
        if (!Number.isFinite(px[p]) || !Number.isFinite(py[p])) continue
        const i = clamp(Math.floor((px[p] / W) * rcols), 0, rcols - 1)
        const j = clamp(Math.floor((py[p] / H) * rrows), 0, rrows - 1)
        const k = j * rcols + i
        rcount[k] += 1
        const sp = Math.hypot(pu[p], pv[p])
        rspd[k] += Number.isFinite(sp) ? sp : 0
      }
    }

    // bin particles → counts + fluid flags
    const bin = () => {
      cnt.fill(0)
      fluid.fill(0)
      for (let p = 0; p < active; p++) {
        const i = clamp(Math.floor(px[p] / h), 0, nx - 1)
        const j = clamp(Math.floor(py[p] / h), 0, ny - 1)
        cnt[j * nx + i]++
      }
      for (let j = 1; j < ny - 1; j++)
        for (let i = 1; i < nx - 1; i++)
          if (cnt[j * nx + i] > 0) fluid[j * nx + i] = 1
    }

    const step = (paint: boolean) => {
      frame++
      // gravity on particles (all of them — lone spray falls back too)
      for (let p = 0; p < active; p++) pv[p] += P.gravityPx * dtCur
      // --- particles → grid (bilinear splat) ---
      u.fill(0)
      v.fill(0)
      wgt.fill(0)
      for (let p = 0; p < active; p++) {
        const { i0, j0, fx, fy } = cellCoords(px[p], py[p])
        const w00 = (1 - fx) * (1 - fy)
        const w10 = fx * (1 - fy)
        const w01 = (1 - fx) * fy
        const w11 = fx * fy
        const a = j0 * nx + i0
        const b = a + 1
        const c = a + nx
        const d = c + 1
        u[a] += w00 * pu[p]
        u[b] += w10 * pu[p]
        u[c] += w01 * pu[p]
        u[d] += w11 * pu[p]
        v[a] += w00 * pv[p]
        v[b] += w10 * pv[p]
        v[c] += w01 * pv[p]
        v[d] += w11 * pv[p]
        wgt[a] += w00
        wgt[b] += w10
        wgt[c] += w01
        wgt[d] += w11
      }
      for (let i = 0; i < nx * ny; i++) {
        if (wgt[i] > 1e-9) {
          u[i] /= wgt[i]
          v[i] /= wgt[i]
        }
      }
      // (gravity lives on the particles now, so lone spray falls back)
      u0.set(u)
      v0.set(v)
      // walls: zero velocity in solid ring
      for (let j = 0; j < ny; j++)
        for (let i = 0; i < nx; i++)
          if (isSolid(i, j)) {
            u[j * nx + i] = 0
            v[j * nx + i] = 0
          }

      // --- pressure projection (Gauss-Seidel × pressureIters, ω) ---
      // Free surface: air neighbors are Dirichlet p=0. Solid neighbors
      // are excluded (Neumann: ghost value = center, cancels out).
      const h2dt = (h * h) / dtCur
      for (let it = 0; it < P.pressureIters; it++) {
        for (let j = 1; j < ny - 1; j++) {
          for (let i = 1; i < nx - 1; i++) {
            const k = j * nx + i
            if (!fluid[k]) continue
            let sum = 0
            let n = 0
            if (!isSolid(i - 1, j)) {
              n++
              if (fluid[k - 1]) sum += pr[k - 1]
            }
            if (!isSolid(i + 1, j)) {
              n++
              if (fluid[k + 1]) sum += pr[k + 1]
            }
            if (!isSolid(i, j - 1)) {
              n++
              if (fluid[k - nx]) sum += pr[k - nx]
            }
            if (!isSolid(i, j + 1)) {
              n++
              if (fluid[k + nx]) sum += pr[k + nx]
            }
            if (n === 0) continue
            const div = (u[k + 1] - u[k - 1] + (v[k + nx] - v[k - nx])) / (2 * h)
            const rhs = (sum - div * h2dt) / n
            pr[k] += P.overRelaxation * (rhs - pr[k])
          }
        }
      }
      // subtract pressure gradient (same neighbor rule)
      for (let j = 1; j < ny - 1; j++) {
        for (let i = 1; i < nx - 1; i++) {
          const k = j * nx + i
          if (!fluid[k]) continue
          const pL = i - 1 <= 0 || !fluid[k - 1] || isSolid(i - 1, j) ? (isSolid(i - 1, j) ? pr[k] : 0) : pr[k - 1]
          const pR = i + 1 >= nx - 1 || !fluid[k + 1] || isSolid(i + 1, j) ? (isSolid(i + 1, j) ? pr[k] : 0) : pr[k + 1]
          const pB = j - 1 <= 0 || !fluid[k - nx] || isSolid(i, j - 1) ? (isSolid(i, j - 1) ? pr[k] : 0) : pr[k - nx]
          const pT = j + 1 >= ny - 1 || !fluid[k + nx] || isSolid(i, j + 1) ? (isSolid(i, j + 1) ? pr[k] : 0) : pr[k + nx]
          u[k] -= dtCur * ((pR - pL) / (2 * h))
          v[k] -= dtCur * ((pT - pB) / (2 * h))
        }
      }
      for (let j = 0; j < ny; j++)
        for (let i = 0; i < nx; i++)
          if (isSolid(i, j)) {
            u[j * nx + i] = 0
            v[j * nx + i] = 0
          }

      // --- grid → particles (PIC/FLIP blend, flipRatio) + advect ---
      let maxS = 0
      const fr = P.flipRatio
      for (let p = 0; p < active; p++) {
        const picU = sample(u, px[p], py[p])
        const picV = sample(v, px[p], py[p])
        const dU = picU - sample(u0, px[p], py[p])
        const dV = picV - sample(v0, px[p], py[p])
        const flipU = pu[p] + dU
        const flipV = pv[p] + dV
        let nu = (1 - fr) * picU + fr * flipU
        let nv = (1 - fr) * picV + fr * flipV
        const sp = Math.hypot(nu, nv)
        if (sp > P.maxSpeed) {
          nu *= P.maxSpeed / sp
          nv *= P.maxSpeed / sp
        }
        pu[p] = nu
        pv[p] = nv
        if (sp > maxS) maxS = sp
        px[p] += nu * dtCur
        py[p] += nv * dtCur
        // walls: impact-aware contact. Gentle touches rest and slide
        // (smooth sheeting), hard impacts rebound damped. Kills the
        // every-step micro-bounce that made piles shimmer.
        if (px[p] < h) {
          px[p] = h
          if (pu[p] < 0) pu[p] = pu[p] < -150 ? -pu[p] * 0.35 : 0
        } else if (px[p] > W - h) {
          px[p] = W - h
          if (pu[p] > 0) pu[p] = pu[p] > 150 ? -pu[p] * 0.35 : 0
        }
        if (py[p] < h) {
          py[p] = h
          if (pv[p] < 0) pv[p] = pv[p] < -150 ? -pv[p] * 0.35 : 0
        } else if (py[p] > H - h) {
          py[p] = H - h
          if (pv[p] > 0) pv[p] = pv[p] > 150 ? -pv[p] * 0.25 : 0
        }
      }

      // --- separation (density passes): thin overfull cells ---
      const kept = new Uint16Array(nx * ny)
      for (let s = 0; s < P.separationIters; s++) {
        bin()
        kept.fill(0)
        for (let p = 0; p < active; p++) {
          const i = clamp(Math.floor(px[p] / h), 1, nx - 2)
          const j = clamp(Math.floor(py[p] / h), 1, ny - 2)
          const k = j * nx + i
          if (kept[k] < P.ppc) {
            kept[k]++
          } else {
            // time-varying push (frame in the hash): averages to zero over
            // frames instead of marching the pile in one direction.
            px[p] = clamp(
              px[p] + (hash1(p * 3 + s * 131 + frame * 17) - 0.5) * h * 0.5,
              h,
              W - h
            )
            py[p] = clamp(
              py[p] + (hash1(p * 7 + s * 17 + frame * 41) - 0.5) * h * 0.5,
              h,
              H - h
            )
          }
        }
      }
      bin()

      // top-up if particles escaped over time (fires sooner)
      if (active < seeded * 0.8) {
        let need = Math.min(seeded - active, 200)
        while (need-- > 0 && active < P.pmax) {
          px[active] = h + Math.random() * (W - 2 * h)
          py[active] = H * (1 - P.fillHeight) + Math.random() * (H * P.fillHeight - h)
          pu[active] = 0
          pv[active] = 0
          active++
        }
        bin()
      }

      // --- render bins (dense ASCII grid from particles) ---
      renderParticles()

      if (paint) draw()
      return maxS
    }

    let dtCur = 1 / 60

    const tick = (now: number) => {
      if (!visible || !inView) {
        running = false
        return
      }
      // dt floor of 1/240: a zero dt makes h²/dt infinite, and
      // 0 × Infinity = NaN poisons the whole pressure field in one step.
      const dt = Math.max(Math.min((now - last) / 1000, 1 / 45), 1 / 240) * P.speed
      last = now
      // two half-steps: cleaner fast flicks, less tunneling (desktop-only
      // feature now, so the extra solver cost is affordable)
      dtCur = dt / 2
      step(false)
      const maxS = step(true)
      // NaN watchdog: if the solver ever blows up, reseed instead of
      // rendering nothing forever.
      if (!Number.isFinite(maxS)) {
        seed()
        renderParticles()
        draw()
      }
      if (maxS < 10 && now - lastInput > 500) {
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
      last = performance.now()
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }

    const themeObs = new MutationObserver(() => {
      isDarkNow = document.documentElement.classList.contains("dark")
      if (sleeping) draw()
      else wake()
    })
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    const seed = () => {
      active = 0
      const y0 = H * (1 - P.fillHeight)
      for (let j = 1; j < ny - 1 && active < P.pmax; j++) {
        for (let i = 1; i < nx - 1 && active < P.pmax; i++) {
          const cy = (j + 0.5) * h
          if (cy < y0) continue
          for (let n = 0; n < P.ppc && active < P.pmax; n++) {
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

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      const mobile = W < 768
      h = mobile ? P.simCellM : P.simCellD
      canvas.width = W
      canvas.height = H
      nx = Math.max(8, Math.floor(W / h))
      ny = Math.max(8, Math.floor(H / h))
      const n = nx * ny
      u = new Float32Array(n)
      v = new Float32Array(n)
      u0 = new Float32Array(n)
      v0 = new Float32Array(n)
      pr = new Float32Array(n)
      wgt = new Float32Array(n)
      cnt = new Uint16Array(n)
      fluid = new Uint8Array(n)
      rcell = mobile ? P.renderCellM : P.renderCellD
      rcols = Math.max(16, Math.floor(W / rcell))
      rrows = Math.max(16, Math.floor(H / (rcell * 1.5)))
      if (rcols * rrows > P.renderCap) {
        const s = Math.sqrt((rcols * rrows) / P.renderCap)
        rcols = Math.floor(rcols / s)
        rrows = Math.floor(rrows / s)
      }
      rcount = new Float32Array(rcols * rrows)
      rspd = new Float32Array(rcols * rrows)
      surfRow = new Float32Array(rcols)
      seed()
      // paint first frame so the tank is visible before any touch
      renderParticles()
      draw()
      wake()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    window.addEventListener("resize", resize, { passive: true })

    const io = new IntersectionObserver(([e]) => {
      const was = inView
      inView = e.isIntersecting
      if (inView && !was) wake()
    })
    io.observe(canvas)

    // cursor touches fluid? (3×3 sim cells around cursor hold particles)
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

    const onPoint = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect()
      const x = clientX - r.left
      const y = clientY - r.top
      if (x < 0 || y < 0 || x > r.width || y > r.height) return
      const now = performance.now()
      const dte = Math.max((now - lastT) / 1000, 1 / 240)
      if (lastMX > -9000) {
        const ix = (x - lastMX) / dte
        const iy = (y - lastMY) / dte
        cvx += (clamp(ix, -4000, 4000) - cvx) * 0.45
        cvy += (clamp(iy, -4000, 4000) - cvy) * 0.45
      }
      lastT = now
      lastMX = clientX
      lastMY = clientY
      // Air does nothing — only a cursor ON fluid stirs it.
      if (!touching(x, y)) return
      lastInput = now
      const R = P.cursorRadius * Math.min(W, H)
      const spd = Math.hypot(cvx, cvy)
      for (let p = 0; p < active; p++) {
        const dx = px[p] - x
        const dy = py[p] - y
        const d2 = dx * dx + dy * dy
        if (d2 > R * R) continue
        const d = Math.sqrt(d2)
        let f = 1 - d / R
        f *= f
        const nxd = dx / (d + 1)
        const nyd = dy / (d + 1)
        pu[p] += (cvx * 0.3 + nxd * spd * 0.3) * f * FORCE
        pv[p] += (cvy * 0.3 + nyd * spd * 0.3) * f * FORCE
      }
      wake()
    }
    const onPointerMove = (e: PointerEvent) => onPoint(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) onPoint(t.clientX, t.clientY)
    }
    const onLeave = () => {
      lastMX = -9999
      lastMY = -9999
      cvx = 0
      cvy = 0
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchstart", onTouchMove as EventListener, {
      passive: true,
    } as AddEventListenerOptions)
    document.documentElement.addEventListener("mouseleave", onLeave)

    const onVis = () => {
      visible = !document.hidden
      if (visible) {
        last = performance.now()
        wake()
      }
    }
    document.addEventListener("visibilitychange", onVis)

    // Start settled: flat seeded tank, one painted frame, asleep.
    draw()
    sleeping = true

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchstart", onTouchMove as EventListener)
      document.documentElement.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("visibilitychange", onVis)
      themeObs.disconnect()
    }
  }, [])

  // Portal to body: escapes transformed ancestors — truly viewport-fixed,
  // whole website, no top limit. Transparent + click-through.
  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />,
    document.body
  )
}
