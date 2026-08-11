'use client'

import { useCallback, useEffect, useState } from 'react'

export type BrowserCoords = {
  lat: number
  lng: number
}

export type BrowserLocationStatus = 'idle' | 'pending' | 'granted' | 'denied' | 'unavailable'

type SharedLocationState = {
  coords: BrowserCoords | null
  status: BrowserLocationStatus
}

let shared: SharedLocationState = { coords: null, status: 'idle' }
let inflight: Promise<SharedLocationState> | null = null
const listeners = new Set<(state: SharedLocationState) => void>()

function publish(next: SharedLocationState) {
  shared = next
  for (const listener of listeners) listener(next)
}

function readPosition(): Promise<SharedLocationState> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return Promise.resolve({ coords: null, status: 'unavailable' as const })
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          status: 'granted',
        })
      },
      (error) => {
        resolve({
          coords: null,
          status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 5 * 60_000,
      },
    )
  })
}

function requestBrowserLocation(force = false): Promise<SharedLocationState> {
  if (!force && shared.status === 'granted' && shared.coords) {
    return Promise.resolve(shared)
  }
  if (!force && inflight) return inflight

  publish({ ...shared, status: 'pending' })
  inflight = readPosition().then((result) => {
    publish(result)
    inflight = null
    return result
  })
  return inflight
}

/** Shared browser geolocation for location autocomplete bias (prompts once). */
export function useBrowserLocation(autoRequest = true) {
  const [coords, setCoords] = useState<BrowserCoords | null>(shared.coords)
  const [status, setStatus] = useState<BrowserLocationStatus>(shared.status)

  useEffect(() => {
    const onUpdate = (state: SharedLocationState) => {
      setCoords(state.coords)
      setStatus(state.status)
    }
    listeners.add(onUpdate)
    onUpdate(shared)

    if (autoRequest && shared.status === 'idle') {
      void requestBrowserLocation()
    }

    return () => {
      listeners.delete(onUpdate)
    }
  }, [autoRequest])

  const requestPermission = useCallback(() => requestBrowserLocation(true), [])

  return { coords, status, requestPermission }
}
