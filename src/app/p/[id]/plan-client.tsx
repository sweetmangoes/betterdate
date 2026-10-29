'use client'

import { useState } from 'react'

/** Hides itself when the map can't load (no Places key, or Maps Static API not enabled). */
export function PlanMap({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element -- proxied Google image, not worth next/image config
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="aspect-[8/5] w-full rounded-3xl border border-mauve-950/10 bg-mauve-200 object-cover dark:border-white/10"
    />
  )
}

export function SharePlanButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // dismissed or unsupported — fall back to copying
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex flex-1 items-center justify-center rounded-full border border-mauve-950/15 px-4 py-2.5 text-sm font-semibold text-mauve-950 hover:bg-mauve-950/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
    >
      {copied ? 'Link copied' : 'Share with your date'}
    </button>
  )
}
