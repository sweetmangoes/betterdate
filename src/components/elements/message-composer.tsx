'use client'

import { clsx } from 'clsx/lite'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition, type FormEvent } from 'react'

import { normalizePhone, SMS_CONSENT_TEXT } from '@/lib/sms-consent'

const VIBE_PLACEHOLDERS = [
  'tonight, she’s in the Glebe, keep it easy',
  'last-minute Friday, cozy, under $80',
  'need a plan in 2 hours, drinks near Elgin',
]

const VIBE_EXAMPLES = [
  { label: 'Tonight, easy', value: 'tonight, she’s in the Glebe, keep it easy' },
  { label: 'Last-minute Friday', value: 'last-minute Friday, cozy, under $80' },
  { label: 'Drinks in 2 hours', value: 'need a plan in 2 hours, drinks near Elgin' },
]

const FIRST_MESSAGE_KEY = 'betterdate:firstMessage'

export function MessageComposer({
  className,
  autoFocus = false,
}: {
  className?: string
  autoFocus?: boolean
}) {
  const router = useRouter()
  const [step, setStep] = useState<'vibe' | 'phone'>('vibe')
  const [vibe, setVibe] = useState('')
  const [phone, setPhone] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (step !== 'vibe' || vibe) return
    const timer = window.setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % VIBE_PLACEHOLDERS.length)
    }, 3200)
    return () => window.clearInterval(timer)
  }, [step, vibe])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (step === 'vibe') {
      const trimmed = vibe.trim()
      if (trimmed) sessionStorage.setItem(FIRST_MESSAGE_KEY, trimmed)
      else sessionStorage.removeItem(FIRST_MESSAGE_KEY)
      setStep('phone')
      return
    }

    if (!normalizePhone(phone)) {
      setError('Enter a 10-digit phone number, like (613) 555-0142.')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/sms/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, consent: true, firstMessage: vibe.trim() || undefined }),
        })
        const body = (await response.json().catch(() => ({}))) as { error?: string; texted?: boolean }
        if (!response.ok) {
          setError(body.error ?? 'Something went wrong. Please try again.')
          return
        }
        router.push(body.texted ? '/start' : '/start?waitlist=1')
      } catch {
        setError('Network error. Check your connection and try again.')
      }
    })
  }

  return (
    <form id="hero-composer" onSubmit={onSubmit} className={clsx('w-full', className)}>
      <p className="mb-3 text-center text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">
        {step === 'vibe' ? '1 of 2 · What’s the vibe?' : '2 of 2 · Where should I text you?'}
      </p>
      <div className="flex items-center gap-2 rounded-full border border-mauve-300 bg-white py-1.5 pr-1.5 pl-5 shadow-[0_18px_50px_oklch(20%_0.02_30_/_0.08)] focus-within:border-mauve-500 dark:border-white/15 dark:bg-white/10">
        {step === 'phone' && (
          <span className="border-r border-mauve-200 pr-3 text-sm font-semibold text-mauve-700 dark:border-white/10 dark:text-mauve-300">
            +1
          </span>
        )}
        {step === 'vibe' ? (
          <input
            id="date-vibe"
            type="text"
            autoComplete="off"
            autoFocus={autoFocus}
            aria-label="What’s the vibe?"
            placeholder={VIBE_PLACEHOLDERS[placeholderIndex]}
            value={vibe}
            onChange={(event) => setVibe(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-base text-mauve-950 placeholder:text-mauve-400 focus:outline-hidden dark:text-white"
          />
        ) : (
          <input
            id="date-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            autoFocus
            required
            aria-label="Your phone number"
            placeholder="Your phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-base text-mauve-950 placeholder:text-mauve-400 focus:outline-hidden dark:text-white"
          />
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {pending ? 'Sending…' : step === 'vibe' ? 'Continue' : 'Text me'}
          {step === 'phone' && (
            <span aria-hidden className="grid size-5 place-items-center rounded-full bg-white/20 text-xs">
              ↑
            </span>
          )}
        </button>
      </div>
      {step === 'vibe' && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {VIBE_EXAMPLES.map((example) => (
            <button
              key={example.value}
              type="button"
              onClick={() => setVibe(example.value)}
              className="rounded-full border border-mauve-200 bg-white/70 px-3 py-1 text-xs/5 text-mauve-700 hover:border-rose-300 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-mauve-300 dark:hover:border-rose-400/40 dark:hover:text-rose-300"
            >
              {example.label}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-center text-sm/6 text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      {step === 'phone' && (
        <div className="mt-3 text-center text-xs/5 text-mauve-500">
          <p>
            {SMS_CONSENT_TEXT}{' '}
            <a href="/sms-terms" className="underline underline-offset-2">
              SMS terms
            </a>{' '}
            ·{' '}
            <a href="/privacy-policy" className="underline underline-offset-2">
              Privacy
            </a>
          </p>
          <button
            type="button"
            onClick={() => {
              setStep('vibe')
              setError(null)
            }}
            className="mt-1 font-medium text-mauve-700 underline-offset-2 hover:underline dark:text-mauve-300"
          >
            Back to vibe
          </button>
        </div>
      )}
    </form>
  )
}
