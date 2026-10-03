"use client"

import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import type { ContributionDay } from "@/lib/github-contributions"

export type GraphView = "perspective" | "top"

interface GithubActivity3DProps {
  weeks: ContributionDay[][]
  monthLabels: { month: string; colIndex: number }[]
  view: GraphView
  dark: boolean
  selectedDate: string | null
  onInspect: (day: ContributionDay | null) => void
  onSelect: (day: ContributionDay) => void
  onEmptyClick: () => void
}

const BAR = 0.88 // bar footprint within a 1-unit cell
const SLAB = 0.12 // flat height for zero-contribution days
const TOP_H = 3.0 // tallest bar in world units
const ROWS = 7
const RECENT_COLS = 16 // ~3.5 months: the 3D view opens framed here, zoom out for the full range
// Bar ramp follows the card theme: soft emeralds on the light card,
// GitHub dark-mode greens on the dark card.
const LIGHT_BARS = ["", "#86e3b8", "#34d399", "#10b981", "#047857"]
const DARK_BARS = ["", "#0e4429", "#006d32", "#26a641", "#39d353"]
const HOVER_LIFT = 0.1 // lightness added to hovered / selected bars

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2

interface Flight {
  t: number
  dur: number
  fromP: THREE.Vector3
  toP: THREE.Vector3
  fromT: THREE.Vector3
  toT: THREE.Vector3
}

interface SceneApi {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  clock: THREE.Clock
  raycaster: THREE.Raycaster
  pointer: THREE.Vector2
  mesh: THREE.InstancedMesh | null
  labelGroup: THREE.Group | null
  dayByInstance: (ContributionDay | null)[]
  baseColors: THREE.Color[]
  curH: Float32Array
  tgtH: Float32Array
  boost: Float32Array
  prevH: Map<string, number>
  flight: Flight | null
  interacted: boolean
  keyCursor: string | null
  hoverDirty: boolean
  pointerClient: { x: number; y: number } | null
  lastInspected: string | null
  cols: number
  maxCount: number
  reduced: boolean
  visible: boolean
}

function makeLabel(text: string, color: string): THREE.Sprite {
  const fs = 46
  const pad = 20
  const canvas = document.createElement("canvas")
  let ctx = canvas.getContext("2d")!
  ctx.font = `500 ${fs}px Inter, system-ui, sans-serif`
  canvas.width = Math.ceil(ctx.measureText(text).width) + pad * 2
  canvas.height = fs + pad * 2
  ctx = canvas.getContext("2d")!
  ctx.font = `500 ${fs}px Inter, system-ui, sans-serif`
  ctx.fillStyle = color
  ctx.textBaseline = "middle"
  ctx.fillText(text, pad, canvas.height / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  )
  const s = 0.0105
  sprite.scale.set(canvas.width * s, canvas.height * s, 1)
  return sprite
}

/**
 * GithubActivity3D — the contribution graph as a 3D bar field, in the
 * spirit of "the shape of your week" panels: weeks run along X, weekdays
 * along Z, bar height is volume. One InstancedMesh = one draw call.
 * Drag to orbit, scroll/pinch to zoom, right-drag to pan, click a bar to
 * fly in. Top view reads like the classic flat calendar.
 */
export default function GithubActivity3D({
  weeks,
  monthLabels,
  view,
  dark,
  selectedDate,
  onInspect,
  onSelect,
  onEmptyClick,
}: GithubActivity3DProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)
  const apiRef = useRef<SceneApi | null>(null)
  const propsRef = useRef({ weeks, monthLabels, view, dark, selectedDate, onInspect, onSelect, onEmptyClick })
  propsRef.current = { weeks, monthLabels, view, dark, selectedDate, onInspect, onSelect, onEmptyClick }
  const downAt = useRef<{ x: number; y: number } | null>(null)
  const wasFocused = useRef(false)

  // ---- scene setup (mount once) ----
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    } catch {
      setFailed(true)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1200)
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = true
    controls.panSpeed = 0.8
    controls.minDistance = 5
    controls.maxDistance = 320
    controls.maxPolarAngle = 1.45

    // Stage the camera top-down: switching Top → 3D then plays a swoop
    // from the flat graph down into the angled close-up (snapped under
    // reduced motion).
    {
      const cols0 = Math.max(propsRef.current.weeks.length, 1)
      const fit0 =
        ((Math.max(cols0, 12) * 0.5) / Math.tan(THREE.MathUtils.degToRad(19))) * 1.06
      camera.position.set(0, fit0 * 1.0, 0.6)
      controls.target.set(0, 0, 0.6)
    }

    scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa0a6, 0.9))
    const sun = new THREE.DirectionalLight(0xffffff, 1.25)
    sun.position.set(6, 12, 4)
    scene.add(sun)

    const api: SceneApi = {
      renderer,
      scene,
      camera,
      controls,
      clock: new THREE.Clock(),
      raycaster: new THREE.Raycaster(),
      pointer: new THREE.Vector2(),
      mesh: null,
      labelGroup: null,
      dayByInstance: [],
      baseColors: [],
      curH: new Float32Array(0),
      tgtH: new Float32Array(0),
      boost: new Float32Array(0),
      prevH: new Map(),
      flight: null,
      interacted: false,
      keyCursor: null,
      hoverDirty: false,
      pointerClient: null,
      lastInspected: null,
      cols: 0,
      maxCount: 1,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      visible: true,
    }
    apiRef.current = api

    const onControlStart = () => {
      api.flight = null
      api.interacted = true
    }
    controls.addEventListener("start", onControlStart)

    const resize = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (w === 0 || h === 0) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      // Refit after rotation/window changes — unless the user has manually
      // moved the camera, in which case their framing wins.
      if (api.cols > 0 && !api.interacted) flyPreset(propsRef.current.view)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const io = new IntersectionObserver(([entry]) => {
      api.visible = entry.isIntersecting
    })
    io.observe(wrap)

    const onPointerMove = (e: PointerEvent) => {
      api.pointerClient = { x: e.clientX, y: e.clientY }
      api.hoverDirty = true
    }
    const onPointerLeave = () => {
      api.pointerClient = null
      if (api.lastInspected !== null) {
        api.lastInspected = null
        propsRef.current.onInspect(null)
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      downAt.current = { x: e.clientX, y: e.clientY }
    }
    const onPointerUp = (e: PointerEvent) => {
      const down = downAt.current
      downAt.current = null
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7) return
      const day = pickAt(e.clientX, e.clientY)
      if (day && day.date) propsRef.current.onSelect(day)
      else propsRef.current.onEmptyClick()
    }
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerleave", onPointerLeave)
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointerup", onPointerUp)

    function pickAt(cx: number, cy: number): ContributionDay | null {
      const { mesh, camera: cam, raycaster, pointer } = api
      const el = canvasRef.current
      if (!mesh || !el) return null
      const box = el.getBoundingClientRect()
      pointer.set(((cx - box.left) / box.width) * 2 - 1, -((cy - box.top) / box.height) * 2 + 1)
      raycaster.setFromCamera(pointer, cam)
      const hits = raycaster.intersectObject(mesh)
      if (hits.length === 0) return null
      const id = hits[0].instanceId
      return id === undefined ? null : api.dayByInstance[id] ?? null
    }

    const dummy = new THREE.Object3D()
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (document.hidden || !api.visible) return
      const dt = Math.min(api.clock.getDelta(), 0.05)
      const { mesh } = api

      if (mesh) {
        const n = api.curH.length
        for (let i = 0; i < n; i++) {
          const c = api.curH[i]
          const t = api.tgtH[i]
          const next = Math.abs(t - c) < 0.004 ? t : c + (t - c) * (1 - Math.exp(-10 * dt))
          api.curH[i] = next
          // Geometry origin sits at the bar base, so bars grow from the floor (y = 0).
          const gone = next <= 0.002
          const col = Math.floor(i / ROWS)
          const row = i % ROWS
          const b = api.boost[i] || 1
          dummy.position.set(col - (api.cols - 1) / 2, gone ? -10 : 0, row - (ROWS - 1) / 2)
          dummy.scale.set(gone ? 0.0001 : BAR * b, Math.max(next, 0.0001), gone ? 0.0001 : BAR * b)
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)
        }
        mesh.instanceMatrix.needsUpdate = true
      }

      if (api.hoverDirty) {
        api.hoverDirty = false
        if (api.pointerClient) {
          const day = pickAt(api.pointerClient.x, api.pointerClient.y)
          const key = day?.date ?? null
          if (key !== api.lastInspected) {
            api.lastInspected = key
            api.keyCursor = null
            propsRef.current.onInspect(day)
            paintHighlight()
            canvas.style.cursor = day ? "pointer" : "grab"
          }
        }
      }

      const f = api.flight
      if (f) {
        if (api.reduced) {
          camera.position.copy(f.toP)
          controls.target.copy(f.toT)
          api.flight = null
        } else {
          f.t += dt
          const k = easeInOutCubic(Math.min(1, f.t / f.dur))
          camera.position.lerpVectors(f.fromP, f.toP, k)
          controls.target.lerpVectors(f.fromT, f.toT, k)
          if (k >= 1) api.flight = null
        }
      }

      // Keep panning near the field so users can't get lost.
      const t = controls.target
      const xLim = api.cols / 2 + 4
      t.x = Math.max(-xLim, Math.min(xLim, t.x))
      t.y = Math.max(0, Math.min(8, t.y))
      t.z = Math.max(-8, Math.min(8, t.z))

      controls.update()
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerleave", onPointerLeave)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointerup", onPointerUp)
      controls.removeEventListener("start", onControlStart)
      controls.dispose()
      disposeField()
      scene.traverse((obj) => {
        const meshObj = obj as THREE.Mesh
        if (meshObj.isMesh) {
          meshObj.geometry?.dispose()
          const mat = meshObj.material as THREE.Material | THREE.Material[]
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat?.dispose()
        }
      })
      renderer.dispose()
      apiRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function disposeField() {
    const api = apiRef.current
    if (!api) return
    if (api.mesh) {
      api.scene.remove(api.mesh)
      api.mesh.geometry.dispose()
      ;(api.mesh.material as THREE.Material).dispose()
      api.mesh.dispose()
      api.mesh = null
    }
    if (api.labelGroup) {
      api.scene.remove(api.labelGroup)
      api.labelGroup.traverse((obj) => {
        const sprite = obj as THREE.Sprite
        if (sprite.isSprite) {
          const mat = sprite.material as THREE.SpriteMaterial
          mat.map?.dispose()
          mat.dispose()
        }
      })
      api.labelGroup = null
    }
  }

  function computeFit(span: number): number {
    const api = apiRef.current
    const canvas = canvasRef.current
    if (!api || !canvas) return 40
    const w = canvas.clientWidth || 1
    const h = canvas.clientHeight || 1
    const halfFov = THREE.MathUtils.degToRad(19)
    const vFit = ((ROWS + 4) * 0.5) / Math.tan(halfFov)
    const hFit = ((span + 3) * 0.5) / (Math.tan(halfFov) * (w / h))
    return Math.max(vFit, hFit) * 1.04
  }

  function flyTo(pos: THREE.Vector3, tgt: THREE.Vector3, dur = 0.9) {
    const api = apiRef.current
    if (!api) return
    if (api.reduced) {
      api.camera.position.copy(pos)
      api.controls.target.copy(tgt)
      return
    }
    api.flight = {
      t: 0,
      dur,
      fromP: api.camera.position.clone(),
      toP: pos.clone(),
      fromT: api.controls.target.clone(),
      toT: tgt.clone(),
    }
  }

  function flyPreset(v: GraphView) {
    const api = apiRef.current
    if (!api) return
    const fitFull = computeFit(api.cols)
    if (v === "top") {
      // Exact top-down: reads like the classic flat calendar.
      flyTo(new THREE.Vector3(0, fitFull * 1.0, 0.6), new THREE.Vector3(0, 0, 0.6), 0.9)
    } else {
      // Open framed on the recent window (~3 months), low and close — the
      // full range is one zoom-out away. maxDistance always covers everything.
      const span = Math.min(api.cols, RECENT_COLS)
      const fitRecent = computeFit(span)
      const recentCenter = api.cols - span / 2 - 0.5 - (api.cols - 1) / 2
      const dir = new THREE.Vector3(0.5, 0.52, 1).normalize()
      const tgt = new THREE.Vector3(recentCenter, 1.0, 0)
      flyTo(tgt.clone().add(dir.multiplyScalar(fitRecent * 0.85)), tgt, 1.1)
    }
    api.controls.maxDistance = fitFull * 2.4
  }

  // ---- keyboard exploration: arrows move a day cursor, Enter selects ----
  function moveCursor(dcol: number, drow: number) {
    const api = apiRef.current
    const { weeks } = propsRef.current
    if (!api || weeks.length === 0) return
    let col = -1
    let row = -1
    if (api.keyCursor) {
      const idx = api.dayByInstance.findIndex((d) => d?.date === api.keyCursor)
      if (idx >= 0) {
        col = Math.floor(idx / ROWS)
        row = idx % ROWS
      }
    }
    if (col < 0) {
      // No cursor yet: start at the most recent valid day.
      outer: for (let c = weeks.length - 1; c >= 0; c--) {
        for (let r = ROWS - 1; r >= 0; r--) {
          if (weeks[c][r]?.date) {
            col = c
            row = r
            break outer
          }
        }
      }
      if (col < 0) return
    } else {
      col = Math.max(0, Math.min(weeks.length - 1, col + dcol))
      row = Math.max(0, Math.min(ROWS - 1, row + drow))
    }
    const day = weeks[col]?.[row]
    if (day?.date) {
      api.keyCursor = day.date
      propsRef.current.onInspect(day)
    } else {
      api.keyCursor = null
      propsRef.current.onInspect(null)
    }
    paintHighlight()
  }

  function onCanvasKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault()
      const dx = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0
      const dy = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0
      moveCursor(dx, dy)
      return
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      const date = apiRef.current?.keyCursor
      if (!date) return
      for (const week of propsRef.current.weeks) {
        const day = week.find((d) => d.date === date)
        if (day) {
          propsRef.current.onSelect(day)
          return
        }
      }
      return
    }
    if (event.key === "Escape") {
      const api = apiRef.current
      if (api) {
        api.keyCursor = null
        paintHighlight()
      }
      propsRef.current.onInspect(null)
      propsRef.current.onEmptyClick()
    }
  }

  // ---- rebuild bars + labels when data or theme changes ----
  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    disposeField()
    const cols = weeks.length
    api.cols = cols
    if (cols === 0) return

    let max = 0
    for (const week of weeks) for (const d of week) if (d.count > max) max = d.count
    api.maxCount = Math.max(max, 1)

    const count = cols * ROWS
    const geo = new THREE.BoxGeometry(1, 1, 1)
    geo.translate(0, 0.5, 0) // origin at bar base: scale Y grows upward from the floor
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const mesh = new THREE.InstancedMesh(geo, mat, count)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    api.mesh = mesh
    api.scene.add(mesh)

    const slab = new THREE.Color(dark ? "#161b22" : "#e3e4e0")
    const ramp = dark ? DARK_BARS : LIGHT_BARS
    api.dayByInstance = new Array(count).fill(null)
    api.baseColors = new Array(count)
    api.curH = new Float32Array(count)
    api.tgtH = new Float32Array(count)
    api.boost = new Float32Array(count).fill(1)

    const dummy = new THREE.Object3D()
    let i = 0
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < ROWS; r++) {
        const day = weeks[c][r]
        const x = c - (cols - 1) / 2
        const z = r - (ROWS - 1) / 2
        const hasDay = !!day?.date
        const h = !hasDay
          ? 0
          : day.count > 0
            ? SLAB + Math.pow(day.count / api.maxCount, 0.65) * (TOP_H - SLAB)
            : SLAB
        api.dayByInstance[i] = hasDay ? day : null
        const color = !hasDay
          ? new THREE.Color(0x000000)
          : day.count > 0
            ? new THREE.Color(ramp[day.level] || ramp[1])
            : slab.clone()
        api.baseColors[i] = color
        mesh.setColorAt(i, color)
        const prev = hasDay && day.date ? api.prevH.get(day.date) : undefined
        api.curH[i] = api.reduced ? h : (prev ?? (h > 0 ? SLAB : 0))
        api.tgtH[i] = h
        if (h <= 0) dummy.position.set(x, -10, z)
        else dummy.position.set(x, 0, z)
        dummy.scale.set(h <= 0 ? 0.0001 : BAR, Math.max(h, 0.0001), h <= 0 ? 0.0001 : BAR)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        i++
      }
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.instanceMatrix.needsUpdate = true

    // Labels (declutter months on wide ranges so they stop colliding)
    const group = new THREE.Group()
    const labelColor = dark ? "#8b949e" : "#8a8a93"
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    for (const r of [1, 3, 5]) {
      const sp = makeLabel(dayNames[r], labelColor)
      sp.position.set(-(cols - 1) / 2 - 2.0, 0.15, r - (ROWS - 1) / 2)
      group.add(sp)
    }
    const showMonths = monthLabels.filter((_, i) => cols <= 26 || i % 2 === 0)
    for (const { month, colIndex } of showMonths) {
      if (colIndex < 0 || colIndex >= cols) continue
      const sp = makeLabel(month, labelColor)
      sp.position.set(colIndex - (cols - 1) / 2, 0.15, ROWS / 2 + 1.4)
      group.add(sp)
    }
    api.labelGroup = group
    api.scene.add(group)
    api.flight = null
    paintHighlight()
  }, [weeks, monthLabels, dark])

  // ---- camera preset ----
  useEffect(() => {
    const api = apiRef.current
    if (!api || api.cols === 0) return
    api.interacted = false
    if (api.reduced) {
      // Snap on first mount under reduced motion; animate thereafter.
      flyPreset(view)
    } else {
      // Defer one frame so fresh geometry is in before the flight starts.
      const id = requestAnimationFrame(() => flyPreset(view))
      return () => cancelAnimationFrame(id)
    }
  }, [view])

  // Repaints bar emphasis for the selected day, the pointer-hovered bar,
  // and the keyboard cursor. Call after any of them change, and after
  // every field rebuild (which resets all instance colors).
  function paintHighlight() {
    const api = apiRef.current
    if (!api || !api.mesh) return
    const { selectedDate } = propsRef.current
    const lift = new THREE.Color()
    for (let i = 0; i < api.dayByInstance.length; i++) {
      const day = api.dayByInstance[i]
      const date = day?.date ?? null
      const active =
        !!date && (date === selectedDate || date === api.lastInspected || date === api.keyCursor)
      api.boost[i] = active ? 1.07 : 1
      lift.copy(api.baseColors[i])
      if (active) lift.offsetHSL(0, 0, HOVER_LIFT)
      api.mesh.setColorAt(i, lift)
    }
    if (api.mesh.instanceColor) api.mesh.instanceColor.needsUpdate = true
  }

  // ---- selection highlight + fly-to ----
  useEffect(() => {
    const api = apiRef.current
    if (!api || !api.mesh) return
    paintHighlight()

    if (selectedDate) {
      const idx = api.dayByInstance.findIndex((d) => d?.date === selectedDate)
      if (idx >= 0) {
        wasFocused.current = true
        const col = Math.floor(idx / ROWS)
        const row = idx % ROWS
        const h = Math.max(api.tgtH[idx], SLAB)
        const tgt = new THREE.Vector3(col - (api.cols - 1) / 2, h * 0.6, row - (ROWS - 1) / 2)
        const offset = api.camera.position.clone().sub(api.controls.target)
        const dist = Math.max(6, Math.min(18, offset.length() * 0.42))
        flyTo(tgt.clone().add(offset.normalize().multiplyScalar(dist)), tgt, 0.8)
      }
    } else if (wasFocused.current) {
      wasFocused.current = false
      flyPreset(propsRef.current.view)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  // Remember heights across tab/range switches so bars morph instead of popping.
  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    const map = new Map<string, number>()
    api.dayByInstance.forEach((day, i) => {
      if (day?.date) map.set(day.date, api.tgtH[i] || api.curH[i])
    })
    api.prevH = map
  }, [weeks])

  if (failed) {
    return (
      <div className="flex h-[340px] sm:h-[420px] w-full items-center justify-center rounded-lg border border-black/10 dark:border-white/10 px-6 text-center">
        <p className="max-w-sm text-sm font-light text-black/50 dark:text-white/50">
          The 3D graph needs WebGL, which this device or browser has disabled. Your activity
          totals above are unaffected.
        </p>
      </div>
    )
  }
  if (weeks.length === 0) {
    return (
      <div className="flex h-[340px] sm:h-[420px] w-full items-center justify-center rounded-lg border border-black/10 dark:border-white/10 px-6 text-center">
        <p className="text-sm font-light text-black/50 dark:text-white/50">No activity data to shape yet.</p>
      </div>
    )
  }

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      role="application"
      aria-label="3D contribution graph. Arrow keys explore days, Enter selects a day, Escape clears."
      onKeyDown={onCanvasKey}
      onBlur={() => {
        const api = apiRef.current
        if (api && api.keyCursor) {
          api.keyCursor = null
          propsRef.current.onInspect(null)
          paintHighlight()
        }
      }}
      className="relative h-[340px] sm:h-[420px] w-full select-none outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 dark:focus-visible:ring-white/40"
    >
      <canvas ref={canvasRef} className="block h-full w-full" style={{ cursor: "grab", touchAction: "none" }} />
    </div>
  )
}
