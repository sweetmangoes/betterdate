'use client'

import { useEffect, useState } from 'react'

/** Follows you down the page. Taps take you back to the real composer — not a second form. */
export function StickyTextCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const composer = document.getElementById('hero-composer')
    if (!composer) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 },
    )
    observer.observe(composer)
    return () => observer.disconnect()
  }, [])

  function goToComposer() {
    document.getElementById('text-us')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      const input = document.getElementById('date-vibe') ?? document.getElementById('date-phone')
      input?.focus()
    }, 400)
  }

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-mauve-100 from-40% to-transparent px-4 pt-16 pb-5 dark:from-mauve-950">
      <button
        type="button"
        onClick={goToComposer}
        className="pointer-events-auto mx-auto flex w-full max-w-[560px] items-center gap-2 rounded-full border border-mauve-300 bg-white py-1.5 pr-1.5 pl-5 text-left shadow-[0_18px_50px_oklch(20%_0.02_30_/_0.12)] dark:border-white/15 dark:bg-white/10"
      >
        <span className="min-w-0 flex-1 truncate text-base text-mauve-400">I’ll text you a plan</span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white">
          Text me
          <span aria-hidden className="grid size-5 place-items-center rounded-full bg-white/20 text-xs">
            ↑
          </span>
        </span>
      </button>
    </div>
  )
}
