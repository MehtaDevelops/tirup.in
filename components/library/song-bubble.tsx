"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react"
import { createPortal } from "react-dom"
import { useSyncExternalStore } from "react"

/**
 * SongBubble: a floating Spotify-style "now playing" mini player with a
 * real YouTube engine inside it.
 *
 * One single-file component you mount once (ideally in the root layout, so
 * client-side navigation never unmounts it and the audio keeps streaming
 * while the visitor moves between pages). Anything in your app — a footer
 * dot, a nav button, an easter egg — opens and closes it through the store
 * commands exported from this same file.
 *
 * The card: a clean floating player docked bottom-left (bottom-center on
 * mobile) with the song title / artist / a full-bleed progress line /
 * elapsed + remaining times, plus the transport and volume tucked into one
 * quiet row. It collapses into a 56px cover orb on outside click; escape
 * and morph with a spring, no new dependencies. Grab any quiet part of the
 * card to drag it; the parking spot persists across reloads and is clamped
 * to the viewport. No lyrics pane.
 *
 * Audio is a hidden YouTube embed driven through the iframe postMessage
 * API. Paste a youtube.com / youtu.be / shorts link into the card, press
 * Enter, and the oEmbed metadata + artwork are pulled in automatically.
 *
 * Colors ride your site's own theme tokens when they exist (--bg, --fg,
 * --border-color, --text-muted, --text-secondary) and fall back to the
 * Spotify-dark palette when they don't, so it looks at home on any site.
 */

export interface SongBubbleProps {
  /** A song to load automatically the first time the card opens (per session). */
  defaultVideoUrl?: string
  /** Cover art for the closed orb. Leave empty for a built-in vinyl disc. */
  defaultThumbnail?: string
  /** Accent for the play button, wave bars, focus rings. */
  accent?: string
  /** localStorage key for the parked position. */
  positionKey?: string
  /** Stacking of the floating root. */
  zIndex?: number
}

/* ---- open-state store ------------------------------------------------- */

let open = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function openSongBubble() {
  if (!open) {
    open = true
    emit()
  }
}

export function closeSongBubble() {
  if (open) {
    open = false
    emit()
  }
}

export function toggleSongBubble() {
  open = !open
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useSongBubbleOpen() {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false
  )
}

/* ---- component -------------------------------------------------------- */

const EMPTY_TITLE = "No song playing"
const EMPTY_ARTIST = "Insert a YouTube link below"
const DEFAULT_VOLUME = 100
const URL_HELP = "Supports youtube.com/watch · youtu.be · youtube.com/shorts"

type CommandArgs = Array<string | number | boolean>

type PlayerInfo = {
  currentTime?: unknown
  duration?: unknown
  playerState?: unknown
}

type PlayerMessage = {
  event?: string
  info?: unknown
}

type PendingCommand = { func: string; args: CommandArgs }

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

/** Pull an 11-character video id out of every common YouTube URL shape. */
function extractVideoId(input: string): string | null {
  let value = input.trim()
  if (!value) return null
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`

  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, "")
    const parts = url.pathname.split("/").filter(Boolean)
    let id: string | null = null

    if (host === "youtu.be") {
      id = parts[0] ?? null
    } else if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") id = url.searchParams.get("v")
      else if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
        id = parts[1] ?? null
      }
    }

    if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) return id
  } catch {
    /* fall through to the forgiving regex below */
  }

  const match = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})(?:[&#?/]|$)/i
  )
  return match ? match[1] : null
}

function Wave({ playing }: { playing: boolean }) {
  return (
    <span className="flex h-3 items-center gap-[2.5px]" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="song-bubble-wave-bar w-[2.5px] rounded-[2px]"
          style={{
            height: 10,
            animation: `song-bubble-wave-${index} 1s ease-in-out infinite`,
            animationDelay: `${index * 0.2}s`,
            animationPlayState: playing ? "running" : "paused",
            animationFillMode: "both",
          }}
        />
      ))}
    </span>
  )
}

export default function SongBubble({
  defaultVideoUrl,
  defaultThumbnail,
  accent,
  positionKey = "song-bubble-pos",
  zIndex = 9999,
}: SongBubbleProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const currentRef = useRef(0)
  const playingRef = useRef(false)
  const widgetReadyRef = useRef(false)
  const pendingRef = useRef<PendingCommand[]>([])
  const volumeRailRef = useRef<HTMLDivElement | null>(null)
  const loadSeqRef = useRef(0)
  const seekFreezeRef = useRef(0)
  const scrubRef = useRef({ active: false, lastCommit: 0 })
  const progressRef = useRef<HTMLDivElement | null>(null)
  const autoLoadedRef = useRef(false)
  const [dragging, setDragging] = useState(false)
  const dragStartRef = useRef({ px: 0, py: 0, baseX: 0, baseY: 0 })
  const movedRef = useRef(false)
  const posRef = useRef<{ x: number; y: number } | null>(null)

  const open = useSongBubbleOpen()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")
  const [videoId, setVideoId] = useState<string | null>(null)
  const [title, setTitle] = useState(EMPTY_TITLE)
  const [artist, setArtist] = useState(EMPTY_ARTIST)
  const [thumbnail, setThumbnail] = useState(defaultThumbnail ?? "")
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [draggingVolume, setDraggingVolume] = useState(false)
  const [origin, setOrigin] = useState("")
  // The player is docked bottom-left by default, but it can be grabbed and
  // parked anywhere on screen; the parking spot survives reloads.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    posRef.current = pos
  }, [pos])

  // The YT embed widget sometimes never boots its message bridge if it is
  // hammered with commands before its own api object attaches (the handler
  // crashes internally and the frame goes permanently silent). So every
  // command is buffered until the widget greets us, then flushed in order.
  useEffect(() => {
    playingRef.current = playing
  }, [playing])

  const hasVideo = Boolean(videoId)
  const progress = duration > 0 ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0
  const remaining = Math.max(0, duration - current)
  const muted = volume === 0
  // The URL bar owns the card until a song is loaded; afterwards it only
  // comes back when the change-song button is pressed.
  const inputMode = expanded && (!hasVideo || editing)
  const playerMode = expanded && hasVideo && !editing

  const postCommand = useCallback((func: string, args: CommandArgs = []) => {
    const frame = iframeRef.current
    if (!frame) return
    if (!widgetReadyRef.current) {
      // Buffer; keep the queue short so stale ticks never outlive intent.
      pendingRef.current = [...pendingRef.current.slice(-12), { func, args }]
      return
    }
    frame.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*"
    )
  }, [])

  // Flush queued commands the moment the widget says hello on any event.
  const flushWhenReady = useCallback((volume: number) => {
    if (widgetReadyRef.current) return
    widgetReadyRef.current = true
    const pending = pendingRef.current
    pendingRef.current = []
    const frame = iframeRef.current
    if (!frame) return
    for (const cmd of pending) {
      frame.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: cmd.func, args: cmd.args }),
        "*"
      )
    }
    frame.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "setVolume", args: [volume] }),
      "*"
    )
    if (playingRef.current) {
      frame.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: [] }),
        "*"
      )
    }
  }, [])

  // Official handshake: the YT api client never assumes the widget will talk
  // first — it opens the session with a "listening" envelope. Some embed
  // boots only start broadcasting once this lands, so send it on a short
  // poll until the widget responds.
  useEffect(() => {
    if (!videoId) return
    const knock = () => {
      const frame = iframeRef.current
      if (!frame || widgetReadyRef.current) return
      frame.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
        "*"
      )
    }
    knock()
    const interval = window.setInterval(knock, 1200)
    return () => window.clearInterval(interval)
  }, [videoId])

  // Open with the orb -> card expansion rather than a static fully-open
  // panel. One frame at the orb size is enough for CSS to animate.
  // A defaultVideoUrl (think demo pages) loads itself on that first open.
  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => setExpanded(true), 40)
    if (defaultVideoUrl && !videoId && !autoLoadedRef.current) {
      autoLoadedRef.current = true
      void loadFromUrl(defaultVideoUrl)
    }
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Closing the card mirrors an unmount-forget behavior: the song, its
  // metadata and the widget session are discarded (the parked position is
  // the one thing that survives). Reopening starts fresh from the deck.
  useEffect(() => {
    if (open) return
    setExpanded(false)
    setEditing(false)
    setUrl("")
    setError("")
    setVideoId(null)
    setTitle(EMPTY_TITLE)
    setArtist(EMPTY_ARTIST)
    setThumbnail(defaultThumbnail ?? "")
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    widgetReadyRef.current = false
    pendingRef.current = []
    loadSeqRef.current = 0
    autoLoadedRef.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    setOrigin(window.location.origin)
    rootRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    currentRef.current = current
  }, [current])

  // YouTube iframe -> React. Only trust messages from our own embed window.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = iframeRef.current
      if (!frame || event.source !== frame.contentWindow) return

      let host = ""
      try {
        host = new URL(event.origin).hostname.replace(/^www\./, "")
      } catch {
        return
      }
      if (
        host !== "youtube.com" &&
        host !== "youtube-nocookie.com" &&
        host !== "m.youtube.com"
      ) {
        return
      }
      if (typeof event.data !== "string") return

      let payload: PlayerMessage
      try {
        payload = JSON.parse(event.data) as PlayerMessage
      } catch {
        return
      }

      flushWhenReady(volume)

      if (payload.event === "infoDelivery" && payload.info && typeof payload.info === "object") {
        const info = payload.info as PlayerInfo
        // While a fresh seek is still settling (or the user is scrubbing the
        // bar), ignore embed-reported currentTime: far seeks in long videos
        // re-buffer for a while, and the next infoDelivery would otherwise
        // yank the readout back to the pre-seek position mid-seek.
        if (
          typeof info.currentTime === "number" &&
          Number.isFinite(info.currentTime) &&
          Date.now() >= seekFreezeRef.current &&
          !scrubRef.current.active
        ) {
          setCurrent(info.currentTime)
        }
        if (typeof info.duration === "number" && info.duration > 0) {
          setDuration(info.duration)
        }
        if (typeof info.playerState === "number") {
          setPlaying(info.playerState === 1)
        }
      } else if (payload.event === "onStateChange" && typeof payload.info === "number") {
        setPlaying(payload.info === 1)
        if (payload.info === 0) setCurrent(0)
      } else if (payload.event === "onReady") {
        postCommand("setVolume", [volume])
      }
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [postCommand, flushWhenReady, volume])

  // Ask the embed for a fresh currentTime/duration while a video is loaded —
  // not just while playing: during long re-buffers (far seeks in big videos)
  // the state flaps between buffering and playing, and the readout must keep
  // up when the dust settles instead of freezing at a stale tick.
  useEffect(() => {
    if (!videoId) return
    const tick = () => {
      const frame = iframeRef.current
      if (frame) {
        frame.contentWindow?.postMessage(
          JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
          "*"
        )
      }
    }
    tick()
    const interval = window.setInterval(tick, 500)
    return () => window.clearInterval(interval)
  }, [videoId])

  // A new video navigates the frame: the old widget dies and a fresh one
  // boots, so our "widget said hello" state has to reset with it.
  useEffect(() => {
    if (!videoId) return
    widgetReadyRef.current = false
    pendingRef.current = []
  }, [videoId])

  useEffect(() => {
    if (!videoId) return
    postCommand("setVolume", [volume])
  }, [videoId, volume, postCommand])

  // Outside click collapses to the orb. It does not close the whole thing:
  // the app's own UI is what turns it off entirely.
  useEffect(() => {
    if (!expanded) return
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      if (!root) return
      const target = event.target as HTMLElement | null
      if (root.contains(event.target as Node)) return
      setExpanded(false)
      setEditing(false)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [expanded])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSongBubble()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  // Accepts any input source (the deck's URL bar, a defaultVideoUrl, a
  // custom trigger UI): parse, resolve metadata, boot the embed.
  const loadFromUrl = useCallback(async (candidate: string) => {
    setError("")
    const id = extractVideoId(candidate)
    if (!id) {
      setError("Invalid YouTube URL. Try youtube.com/watch?v=... or youtu.be/...")
      return
    }

    const seq = ++loadSeqRef.current
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(
          `https://www.youtube.com/watch?v=${id}`
        )}&format=json`
      )
      if (!response.ok) throw new Error("Could not fetch video info")
      const data = (await response.json()) as { title?: string; author_name?: string }
      if (seq !== loadSeqRef.current) return
      setTitle(data.title || "Unknown Title")
      setArtist(data.author_name || "Unknown Artist")
    } catch {
      if (seq !== loadSeqRef.current) return
      setTitle("Unknown Title")
      setArtist("Unknown Artist")
    }

    if (seq !== loadSeqRef.current) return
    setThumbnail(`https://img.youtube.com/vi/${id}/mqdefault.jpg`)
    setVideoId(id)
    setCurrent(0)
    setDuration(0)
    setPlaying(true)
    setEditing(false)
    setUrl("")
  }, [])

  const togglePlay = useCallback(() => {
    if (!videoId) return
    if (playing) {
      postCommand("pauseVideo")
      setPlaying(false)
    } else {
      postCommand("playVideo")
      setPlaying(true)
    }
  }, [playing, postCommand, videoId])

  const seekTo = useCallback(
    (seconds: number) => {
      if (!videoId) return
      const upper = duration > 0 ? duration : 0
      const next = Math.max(0, Math.min(seconds, upper))
      // Freeze embed-driven readouts briefly: far seeks in long videos
      // re-buffer, and without this the next infoDelivery snaps the bar
      // back to the pre-seek position while the seek is still landing.
      seekFreezeRef.current = Date.now() + 2000
      postCommand("seekTo", [next, true])
      setCurrent(next)
    },
    [duration, postCommand, videoId]
  )

  const seekBy = useCallback(
    (seconds: number) => seekTo(currentRef.current + seconds),
    [seekTo]
  )

  // Scrub the timeline like the volume rail: pointerdown seeks, dragging
  // keeps seeking (throttled so long unbuffered jumps don't thrash the
  // buffer), release commits. The readout previews every move instantly.
  const commitScrub = useCallback(
    (clientX: number, force: boolean) => {
      const bar = progressRef.current
      if (!bar || duration <= 0) return
      const rect = bar.getBoundingClientRect()
      if (rect.width <= 0) return
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const now = Date.now()
      if (force || now - scrubRef.current.lastCommit > 120) {
        scrubRef.current.lastCommit = now
        seekFreezeRef.current = now + 2000
        postCommand("seekTo", [ratio * duration, true])
      }
      setCurrent(ratio * duration)
    },
    [duration, postCommand]
  )

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (scrubRef.current.active) commitScrub(event.clientX, false)
    }
    const onEnd = (event: PointerEvent) => {
      if (!scrubRef.current.active) return
      commitScrub(event.clientX, true)
      scrubRef.current.active = false
      document.body.style.cursor = ""
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onEnd)
    window.addEventListener("pointercancel", onEnd)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onEnd)
      window.removeEventListener("pointercancel", onEnd)
    }
  }, [commitScrub])

  const onProgressPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!hasVideo || !duration) return
    if (!event.isPrimary || event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    scrubRef.current = { active: true, lastCommit: 0 }
    document.body.style.cursor = "col-resize"
    commitScrub(event.clientX, true)
  }

  const changeVolume = useCallback((next: number) => {
    setVolume(Math.max(0, Math.min(100, next)))
  }, [])

  const volumeFromClientX = useCallback(
    (clientX: number) => {
      const rail = volumeRailRef.current
      if (!rail) return
      const rect = rail.getBoundingClientRect()
      if (rect.width <= 0) return
      changeVolume(((clientX - rect.left) / rect.width) * 100)
    },
    [changeVolume]
  )

  useEffect(() => {
    if (!draggingVolume) return
    const onMove = (event: PointerEvent) => volumeFromClientX(event.clientX)
    const onUp = () => setDraggingVolume(false)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [draggingVolume, volumeFromClientX])

  // Keep the parked card fully on screen (8px breathing room). The card
  // morphs between the 56px orb and the (usually) 260px card, so clamp
  // against the largest size the card can take at this viewport — else a
  // spot valid for the orb overflows once the card expands.
  const clampPos = useCallback((x: number, y: number) => {
    const root = rootRef.current
    const pad = 8
    const currentW = root ? root.offsetWidth : 260
    const expandedW = window.innerWidth <= 480 ? window.innerWidth - 32 : 260
    const width = Math.max(currentW, expandedW)
    const maxHeight = 152 // expanded card height at every breakpoint
    const maxX = Math.max(pad, window.innerWidth - width - pad)
    const maxY = Math.max(pad, window.innerHeight - maxHeight - pad)
    return { x: Math.min(Math.max(x, pad), maxX), y: Math.min(Math.max(y, pad), maxY) }
  }, [])

  // Restore the parked spot from a previous visit.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(positionKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as { x?: number; y?: number }
      if (typeof parsed.x !== "number" || typeof parsed.y !== "number") return
      posRef.current = { x: parsed.x, y: parsed.y }
      setPos(posRef.current)
    } catch {
      /* ignore malformed parking spots */
    }
  }, [positionKey])

  // ...and clamp once the card is actually on screen: while closed the root
  // has no size, so a spot parked on a wide desktop could still overflow a
  // narrow phone viewport (or vice versa) without this re-clamp.
  useEffect(() => {
    if (!open || !posRef.current) return
    const clamped = clampPos(posRef.current.x, posRef.current.y)
    if (clamped.x !== posRef.current.x || clamped.y !== posRef.current.y) {
      posRef.current = clamped
      setPos(clamped)
    }
  }, [open, clampPos])

  // Grab from any non-interactive part of the card (titles, art, blank areas);
  // buttons, the input and the sliders keep their own behavior.
  const onDragPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return
    const target = event.target as HTMLElement
    if (
      target.closest(
        "button, input, .song-bubble-rail, .song-bubble-progress, .song-bubble-url-bar"
      )
    ) {
      return
    }
    const root = rootRef.current
    if (!root) return
    event.preventDefault()
    const rect = root.getBoundingClientRect()
    const base = posRef.current ?? { x: rect.left, y: rect.top }
    dragStartRef.current = {
      px: event.clientX,
      py: event.clientY,
      baseX: base.x,
      baseY: base.y,
    }
    movedRef.current = false
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (event: PointerEvent) => {
      const start = dragStartRef.current
      if (
        Math.abs(event.clientX - start.px) > 4 ||
        Math.abs(event.clientY - start.py) > 4
      ) {
        movedRef.current = true
        document.body.style.cursor = "grabbing"
      }
      const next = clampPos(
        start.baseX + (event.clientX - start.px),
        start.baseY + (event.clientY - start.py)
      )
      posRef.current = next
      setPos(next)
    }
    const onEnd = () => {
      document.body.style.cursor = ""
      setDragging(false)
      if (movedRef.current && posRef.current) {
        try {
          window.localStorage.setItem(positionKey, JSON.stringify(posRef.current))
        } catch {
          /* storage unavailable: the spot just won't persist */
        }
      }
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onEnd)
    window.addEventListener("pointercancel", onEnd)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onEnd)
      window.removeEventListener("pointercancel", onEnd)
    }
  }, [dragging, clampPos, positionKey])

  const onVolumePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!hasVideo) return
    event.preventDefault()
    setDraggingVolume(true)
    volumeFromClientX(event.clientX)
  }

  const onVolumeKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!hasVideo) return
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault()
      changeVolume(volume - 2)
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault()
      changeVolume(volume + 2)
    } else if (event.key === "Home") {
      event.preventDefault()
      changeVolume(0)
    } else if (event.key === "End") {
      event.preventDefault()
      changeVolume(100)
    }
  }

  const onBodyKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (expanded || event.target !== event.currentTarget) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      setExpanded(true)
    }
  }

  const videoSrc =
    videoId && origin
      ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&origin=${encodeURIComponent(
          origin
        )}`
      : null

  if (!open || typeof document === "undefined") return null

  const rootStyle: CSSProperties = { zIndex }
  if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
    rootStyle.left = pos.x
    rootStyle.top = pos.y
    rootStyle.right = "auto"
    rootStyle.bottom = "auto"
    rootStyle.transform = "none"
  }
  if (accent) (rootStyle as Record<string, string>)["--song-bubble-accent"] = accent

  return createPortal(
    <div
      ref={rootRef}
      role="region"
      aria-label="Now playing card"
      tabIndex={-1}
      className="song-bubble-root fixed bottom-16 left-1/2 flex -translate-x-1/2 flex-col items-center overflow-visible outline-none pointer-events-none md:bottom-6 md:left-6 md:translate-x-0"
      style={rootStyle}
    >
      <div
        className={`song-bubble-pop${!expanded && playing && hasVideo ? " is-orb-playing" : ""}`}
      >
        <div
          className={`song-bubble-body${expanded ? " is-expanded" : ""}`}
          onPointerDown={onDragPointerDown}
          onClick={() => {
            // A drag ends with a click event; don't let it also expand the orb.
            if (movedRef.current) {
              movedRef.current = false
              return
            }
            if (!expanded) setExpanded(true)
          }}
          onKeyDown={onBodyKeyDown}
          role={expanded ? undefined : "button"}
          tabIndex={expanded ? -1 : 0}
          aria-label={expanded ? undefined : "Expand now playing card"}
          aria-expanded={expanded}
        >
          <div className="song-bubble-sheen" aria-hidden="true" />

          <div
            className={`song-bubble-art${thumbnail ? "" : " is-vinyl"}`}
            style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined}
            aria-hidden="true"
          />

          {inputMode && (
            <div className="song-bubble-inputdeck">
              <div className="song-bubble-url-bar">
                <input
                  type="text"
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value)
                    setError("")
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      void loadFromUrl(url)
                    }
                  }}
                  placeholder="Paste a YouTube URL..."
                  className="song-bubble-url-input"
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="YouTube URL"
                  aria-invalid={Boolean(error)}
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    void loadFromUrl(url)
                  }}
                  disabled={!url}
                  className="song-bubble-url-go"
                  aria-label="Load song"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
              {error ? (
                <p className="song-bubble-error" role="alert">
                  <span className="font-medium">Error</span>: {error}
                </p>
              ) : (
                <p className="song-bubble-help">
                  {hasVideo ? "Pasting a new link replaces the current song." : URL_HELP}
                </p>
              )}
            </div>
          )}

          {playerMode && (
            <div className="song-bubble-deck">
              <div className="song-bubble-head">
                <div className="song-bubble-titles">
                  <span className="song-bubble-title">{title}</span>
                  <span className="song-bubble-artist">{artist}</span>
                </div>
                <Wave playing={playing} />
              </div>

              <div className="song-bubble-controls">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    seekBy(-10)
                  }}
                  disabled={!hasVideo}
                  className="song-bubble-icon-btn"
                  aria-label="Seek backward 10 seconds"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    togglePlay()
                  }}
                  disabled={!hasVideo}
                  className="song-bubble-play-btn"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    seekBy(10)
                  }}
                  disabled={!hasVideo}
                  className="song-bubble-icon-btn"
                  aria-label="Seek forward 10 seconds"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                  </svg>
                </button>

                <span className="song-bubble-spacer" />

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setVolume((value) => (value === 0 ? 50 : 0))
                  }}
                  disabled={!hasVideo}
                  className="song-bubble-icon-btn"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : volume < 50 ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 9v6h4l5 5V4L9 9H5zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
                <div
                  ref={volumeRailRef}
                  className="song-bubble-rail"
                  role="slider"
                  tabIndex={hasVideo ? 0 : -1}
                  aria-label="Volume"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(volume)}
                  aria-disabled={!hasVideo}
                  onPointerDown={onVolumePointerDown}
                  onKeyDown={onVolumeKeyDown}
                >
                  <div className="song-bubble-rail-track">
                    <div className="song-bubble-rail-fill" style={{ width: `${volume}%` }} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setEditing(true)
                  }}
                  className="song-bubble-icon-btn"
                  aria-label="Play a different song"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
              </div>

              <div className="song-bubble-progressblock">
                <div
                  ref={progressRef}
                  className="song-bubble-progress"
                  onPointerDown={onProgressPointerDown}
                  role="slider"
                  tabIndex={0}
                  aria-label="Track position"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(duration)}
                  aria-valuenow={Math.round(current)}
                  onKeyDown={(event) => {
                    if (!duration) return
                    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                      event.preventDefault()
                      seekTo(current - 5)
                    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                      event.preventDefault()
                      seekTo(current + 5)
                    }
                  }}
                >
                  <span className="song-bubble-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="song-bubble-times">
                  <span>{formatTime(current)}</span>
                  <span>{formatTime(remaining)}</span>
                </div>
              </div>
            </div>
          )}

          {!expanded && playing && hasVideo && (
            <span className="song-bubble-live" aria-hidden="true" />
          )}
        </div>
      </div>

      {videoSrc && (
        <iframe
          ref={iframeRef}
          src={videoSrc}
          // Offscreen but unclipped: fully hidden/clipped frames can leave
          // the embed player dormant; a 320x180 frame parked far offscreen
          // keeps the widget fully alive and audio audible.
          style={{
            position: "fixed",
            top: -10000,
            left: -10000,
            width: 320,
            height: 180,
            border: 0,
            pointerEvents: "none",
          }}
          allow="autoplay; encrypted-media"
          title="YouTube player"
        />
      )}

      <style>{`
        .song-bubble-root {
          touch-action: none;
        }
        .song-bubble-pop {
          position: relative;
          transform-origin: 0% 100%;
          animation: song-bubble-in 520ms cubic-bezier(0.34, 1.35, 0.5, 1) both;
        }
        .song-bubble-pop.is-orb-playing::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 999px;
          border: 1.5px solid color-mix(in srgb, var(--song-bubble-accent, #1ed760) 55%, transparent);
          pointer-events: none;
          animation: song-bubble-pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes song-bubble-in {
          from { opacity: 0; transform: translateY(28px) scale(0.7); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes song-bubble-pulse {
          0% { transform: scale(0.94); opacity: 0.8; }
          70%, 100% { transform: scale(1.18); opacity: 0; }
        }

        /* Colors ride the host site's tokens when they exist and fall back
           to the Spotify-dark palette when they don't. */
        .song-bubble-body {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 999px;
          background: var(--bg, #0a0a0b);
          cursor: pointer;
          pointer-events: auto;
          user-select: none;
          -webkit-user-select: none;
          transition:
            width 500ms cubic-bezier(0.22, 1, 0.36, 1),
            height 500ms cubic-bezier(0.22, 1, 0.36, 1),
            border-radius 500ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: width, height;
        }
        .song-bubble-body.is-expanded {
          width: 260px;
          height: 152px;
          border-radius: 18px;
          cursor: default;
        }
        @media (hover: hover) and (pointer: fine) {
          .song-bubble-body:not(.is-expanded):hover {
            transform: scale(1.1);
          }
        }
        @media (max-width: 480px) {
          .song-bubble-body.is-expanded {
            width: calc(100vw - 32px);
            height: 152px;
          }
        }
        .song-bubble-body:focus-visible {
          outline: 2px solid color-mix(in srgb, var(--song-bubble-accent, #1ed760) 85%, transparent);
          outline-offset: 3px;
        }

        .song-bubble-sheen {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background: linear-gradient(
            160deg,
            color-mix(in srgb, var(--fg, #fafafa) 6%, transparent),
            color-mix(in srgb, var(--fg, #fafafa) 1%, transparent) 42%,
            transparent 62%
          );
          box-shadow: inset 0 0 0 1px var(--border-color, rgba(255, 255, 255, 0.12));
        }
        .song-bubble-body.is-expanded {
          box-shadow:
            0 24px 60px rgba(0, 0, 0, 0.5),
            0 8px 22px rgba(0, 0, 0, 0.35);
        }
        html:not(.dark) .song-bubble-body.is-expanded {
          box-shadow:
            0 24px 60px rgba(0, 0, 0, 0.18),
            0 8px 22px rgba(0, 0, 0, 0.1);
        }

        .song-bubble-art {
          position: absolute;
          left: 7px;
          top: 7px;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background-color: color-mix(in srgb, var(--fg, #fafafa) 7%, var(--bg, #0a0a0b));
          background-position: center;
          background-size: cover;
          pointer-events: none;
          will-change: opacity, transform;
          transition:
            opacity 200ms ease,
            transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .song-bubble-art.is-vinyl {
          background:
            radial-gradient(circle at 50% 50%, var(--song-bubble-accent, #1ed760) 0 13%, transparent 13.5%),
            repeating-radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.045) 0 3px, transparent 3px 7px),
            radial-gradient(circle at 50% 50%, #141416, #050506 72%);
        }
        .song-bubble-art.is-spinning {
          animation: song-bubble-spin 7s linear infinite;
        }
        .song-bubble-body.is-expanded .song-bubble-art {
          opacity: 0;
          transform: scale(0.5);
        }
        @keyframes song-bubble-spin {
          to { transform: rotate(360deg); }
        }

        .song-bubble-live {
          position: absolute;
          right: 3px;
          top: 3px;
          z-index: 20;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: var(--song-bubble-accent, #1ed760);
          box-shadow:
            0 0 0 2px var(--bg, #0a0a0b),
            0 0 10px 2px color-mix(in srgb, var(--song-bubble-accent, #1ed760) 50%, transparent);
          pointer-events: none;
        }

        .song-bubble-deck {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          padding: 18px 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: song-bubble-fade-in 220ms ease-out 160ms both;
        }
        @keyframes song-bubble-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .song-bubble-head {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .song-bubble-titles {
          display: flex;
          min-width: 0;
          flex: 1;
          flex-direction: column;
          gap: 2px;
          cursor: grab;
        }
        .song-bubble-title {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14.5px;
          font-weight: 700;
          color: var(--fg, #fafafa);
          line-height: 18px;
          cursor: inherit;
        }
        .song-bubble-artist {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11.5px;
          color: var(--text-secondary, rgba(250, 250, 250, 0.66));
          line-height: 14px;
          cursor: inherit;
        }

        .song-bubble-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .song-bubble-wave-bar {
          background: var(--song-bubble-accent, #1ed760);
        }
        .song-bubble-icon-btn {
          display: flex;
          cursor: pointer;
          color: var(--text-muted, rgba(250, 250, 250, 0.44));
          transition: color 180ms ease, transform 180ms ease;
        }
        .song-bubble-icon-btn:hover:not(:disabled) {
          color: var(--fg, #fafafa);
        }
        .song-bubble-icon-btn:disabled {
          cursor: not-allowed;
          opacity: 0.3;
        }
        .song-bubble-icon-btn:focus-visible {
          outline: 2px solid color-mix(in srgb, var(--song-bubble-accent, #1ed760) 85%, transparent);
          outline-offset: 2px;
          border-radius: 4px;
        }
        .song-bubble-play-btn {
          display: flex;
          height: 32px;
          width: 32px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: var(--song-bubble-accent, #1ed760);
          color: color-mix(in srgb, var(--song-bubble-accent, #1ed760) 12%, #000);
          transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), background 160ms ease;
        }
        .song-bubble-play-btn:hover:not(:disabled) {
          background: color-mix(in srgb, var(--song-bubble-accent, #1ed760) 88%, #fff);
          transform: scale(1.08);
        }
        .song-bubble-play-btn:active:not(:disabled) {
          transform: scale(0.94);
        }
        .song-bubble-play-btn:disabled {
          cursor: not-allowed;
          opacity: 0.3;
        }
        .song-bubble-play-btn:focus-visible {
          outline: 2px solid color-mix(in srgb, var(--fg, #fafafa) 90%, transparent);
          outline-offset: 2px;
        }
        .song-bubble-spacer {
          flex: 1;
          min-width: 6px;
        }

        .song-bubble-rail {
          display: flex;
          height: 14px;
          width: 56px;
          min-width: 0;
          cursor: pointer;
          align-items: center;
        }
        .song-bubble-rail:focus-visible {
          outline: 2px solid color-mix(in srgb, var(--song-bubble-accent, #1ed760) 85%, transparent);
          outline-offset: 2px;
          border-radius: 4px;
        }
        .song-bubble-rail-track {
          height: 2.5px;
          width: 100%;
          border-radius: 999px;
          background: color-mix(in srgb, var(--fg, #fafafa) 18%, transparent);
          overflow: hidden;
        }
        .song-bubble-rail-fill {
          height: 100%;
          border-radius: inherit;
          background: color-mix(in srgb, var(--fg, #fafafa) 85%, transparent);
        }

        @keyframes song-bubble-wave-0 {
          0%, 100% { height: 3.5px; }
          25% { height: 9px; }
          50% { height: 5px; }
          75% { height: 7.5px; }
        }
        @keyframes song-bubble-wave-1 {
          0%, 100% { height: 9px; }
          25% { height: 5px; }
          50% { height: 7.5px; }
          75% { height: 3.5px; }
        }
        @keyframes song-bubble-wave-2 {
          0%, 100% { height: 5px; }
          25% { height: 7.5px; }
          50% { height: 3.5px; }
          75% { height: 9px; }
        }

        .song-bubble-progressblock {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin: auto -16px -2px;
          padding: 10px 16px 0;
        }
        .song-bubble-progress {
          position: relative;
          height: 10px;
          margin: 0 -16px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .song-bubble-progress::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--fg, #fafafa) 16%, transparent);
        }
        .song-bubble-progress-fill {
          position: relative;
          display: block;
          height: 2px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--fg, #fafafa) 92%, transparent);
          transition: width 250ms linear;
        }
        .song-bubble-progress:focus-visible {
          outline: 2px solid color-mix(in srgb, var(--song-bubble-accent, #1ed760) 85%, transparent);
          outline-offset: 2px;
          border-radius: 4px;
        }
        .song-bubble-times {
          display: flex;
          justify-content: space-between;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 10px;
          font-weight: 500;
          color: var(--text-muted, rgba(250, 250, 250, 0.44));
        }
        @media (max-width: 480px) {
          .song-bubble-rail {
            width: 46px;
          }
        }

        .song-bubble-inputdeck {
          position: absolute;
          left: 16px;
          right: 16px;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 7px;
          animation: song-bubble-fade-in 200ms ease-out 140ms both;
        }
        .song-bubble-url-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--fg, #fafafa) 6%, transparent);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--fg, #fafafa) 9%, transparent);
          padding: 0 5px 0 14px;
          height: 38px;
          transition: background 160ms ease, box-shadow 160ms ease;
        }
        .song-bubble-inputdeck:focus-within .song-bubble-url-bar {
          background: color-mix(in srgb, var(--fg, #fafafa) 10%, transparent);
          box-shadow:
            inset 0 0 0 1px color-mix(in srgb, var(--song-bubble-accent, #1ed760) 60%, transparent),
            0 0 0 3px color-mix(in srgb, var(--song-bubble-accent, #1ed760) 12%, transparent);
        }
        .song-bubble-url-input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: none;
          background: transparent;
          color: var(--fg, #fafafa);
          font-size: 12px;
          line-height: 16px;
        }
        .song-bubble-url-input::placeholder {
          color: color-mix(in srgb, var(--fg, #fafafa) 32%, transparent);
        }
        .song-bubble-url-go {
          display: flex;
          height: 28px;
          width: 28px;
          flex-shrink: 0;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: var(--song-bubble-accent, #1ed760);
          color: color-mix(in srgb, var(--song-bubble-accent, #1ed760) 12%, #000);
          transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), background 160ms ease;
        }
        .song-bubble-url-go:hover:not(:disabled) {
          background: color-mix(in srgb, var(--song-bubble-accent, #1ed760) 88%, #fff);
          transform: scale(1.08);
        }
        .song-bubble-url-go:disabled {
          cursor: not-allowed;
          opacity: 0.35;
        }
        .song-bubble-error {
          font-size: 11.5px;
          color: #ef4444;
          padding-left: 2px;
        }
        .song-bubble-help {
          font-size: 10.5px;
          color: var(--text-muted, rgba(250, 250, 250, 0.44));
          text-align: center;
        }

        @media (prefers-reduced-motion: reduce) {
          .song-bubble-pop,
          .song-bubble-body,
          .song-bubble-art,
          .song-bubble-deck,
          .song-bubble-inputdeck,
          .song-bubble-progress-fill {
            transition-duration: 1ms !important;
            animation: none !important;
          }
          .song-bubble-pop span[style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>,
    document.body
  )
}
