"use client"

import { useSyncExternalStore } from "react"

/**
 * Whether the floating song bubble is open. A tiny external store so the
 * player itself can live in the root layout — client-side navigation never
 * unmounts it, so the audio keeps streaming while the visitor moves between
 * pages — while anything on the site (today: the hero's yellow dot) can open
 * and close it through these one-line commands.
 */
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
