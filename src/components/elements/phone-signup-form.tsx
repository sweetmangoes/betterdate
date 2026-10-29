'use client'

import { clsx } from 'clsx/lite'
import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'

import { normalizePhone, SMS_CONSENT_TEXT } from '@/lib/sms-consent'

export function PhoneSignupForm({ className, showConsent = true }: { className?: string; showConsent?: boolean }) {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

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
    <form onSubmit={onSubmit} className={clsx('max-w-md', className)}>
      <div className="flex items-center gap-2 rounded-full border border-mauve-300 bg-mauve-50 py-1.5 pr-1.5 pl-5 focus-within:border-mauve-500 dark:border-white/15 dark:bg-white/5">
        <span className="border-r border-mauve-200 pr-3 text-sm font-semibold text-mauve-700 dark:border-white/10 dark:text-mauve-300">
          +1
        </span>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          aria-label="Your phone number"
          placeholder="Your phone number"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-base text-mauve-950 placeholder:text-mauve-400 focus:outline-hidden dark:text-white"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Text me'}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm/6 text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      {showConsent && (
        <p className="mt-3 text-xs/5 text-mauve-500 dark:text-mauve-500">
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
    </form>
  )
}
