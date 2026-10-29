import { clsx } from 'clsx/lite'

export function formatDatesPlanned(n: number) {
  return n.toLocaleString('en-US')
}

/** Quiet live count under the Better Date signup form. */
export function DatesPlannedTicker({ count, className }: { count: number; className?: string }) {
  return (
    <p className={clsx('mt-6 flex items-baseline gap-2.5', className)}>
      <span className="font-display text-[1.75rem]/none tracking-tight text-rose-700 tabular-nums dark:text-rose-300">
        {formatDatesPlanned(count)}
      </span>
      <span className="text-sm/6 text-mauve-700 dark:text-mauve-400">
        <span
          aria-hidden
          className="mr-1.5 inline-block size-1.5 rounded-full bg-rose-600 motion-safe:animate-pulse dark:bg-rose-400"
        />
        {count === 1 ? 'date planned' : 'dates planned'}
      </span>
    </p>
  )
}

/** Personal number on a generated plan. */
export function DateNumberBanner({ n, className }: { n: number; className?: string }) {
  if (n < 1) return null

  return (
    <div
      className={clsx(
        'mt-6 rounded-3xl border border-rose-600/20 bg-rose-50/70 px-5 py-4 dark:border-rose-400/20 dark:bg-rose-950/30',
        className,
      )}
    >
      <p className="text-sm/6 font-semibold text-mauve-950 dark:text-white">
        You’re date {formatDatesPlanned(n)}.
      </p>
      <p className="mt-0.5 text-sm/6 text-mauve-700 dark:text-mauve-400">
        That’s how many plans we’ve made. Yours just got counted.
      </p>
    </div>
  )
}
