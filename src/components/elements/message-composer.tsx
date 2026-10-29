'use client'

import { clsx } from 'clsx/lite'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition, type FormEvent } from 'react'

import { normalizePhone, SMS_CONSENT_TEXT } from '@/lib/sms-consent'

const VIBE_PLACEHOLDERS = [
  'first date friday, she’s in the Glebe',
  'cozy, she loves sushi',
  'anniversary next saturday',
  'what do you want the night to feel like?',
]

const FIRST_MESSAGE_KEY = 'betterdate:firstMessage'

export function MessageComposer({
  className,
  compact = false,
  autoFocus = false,
  id,
}: {
  className?: string
  compact?: boolean
  autoFocus?: boolean
  id?: string
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
          body: JSON.stringify({ phone, consent: true }),
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
    <form onSubmit={onSubmit} id={id} className={clsx('w-full', className)}>
      <div className="flex items-center gap-2 rounded-full border border-mauve-300 bg-white py-1.5 pr-1.5 pl-5 shadow-[0_18px_50px_oklch(20%_0.02_30_/_0.08)] focus-within:border-mauve-500 dark:border-white/15 dark:bg-white/10">
        {step === 'phone' && (
          <span className="border-r border-mauve-200 pr-3 text-sm font-semibold text-mauve-700 dark:border-white/10 dark:text-mauve-300">
            +1
          </span>
        )}
        {step === 'vibe' ? (
          <input
            type="text"
            autoComplete="off"
            autoFocus={autoFocus}
            aria-label={compact ? 'What do you want the night to feel like?' : 'Tell me the vibe'}
            placeholder={VIBE_PLACEHOLDERS[placeholderIndex]}
            value={vibe}
            onChange={(event) => setVibe(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-base text-mauve-950 placeholder:text-mauve-400 focus:outline-hidden dark:text-white"
          />
        ) : (
          <input
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
          {pending ? 'Sending…' : 'Text me'}
          <span aria-hidden className="grid size-5 place-items-center rounded-full bg-white/20 text-xs">
            ↑
          </span>
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-center text-sm/6 text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      {step === 'phone' && (
        <div className={clsx('mt-3 text-center text-xs/5 text-mauve-500', compact && 'px-2')}>
          {compact ? (
            <p>
              By tapping Text me you agree to get texts about your plans.{' '}
              <a href="/sms-terms" className="underline underline-offset-2">
                SMS terms
              </a>
              {' · '}
              <a href="/privacy-policy" className="underline underline-offset-2">
                Privacy
              </a>
            </p>
          ) : (
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
          )}
          <button
            type="button"
            onClick={() => {
              setStep('vibe')
              setError(null)
            }}
            className="mt-1 font-medium text-mauve-700 underline-offset-2 hover:underline dark:text-mauve-300"
          >
            Edit vibe
          </button>
        </div>
      )}
    </form>
  )
}
