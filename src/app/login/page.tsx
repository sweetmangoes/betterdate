'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, type FormEvent } from 'react'

import { Button } from '@/components/elements/button'
import { Container } from '@/components/elements/container'
import { Heading } from '@/components/elements/heading'
import { Text } from '@/components/elements/text'
import { safeNextPath } from '@/lib/auth-path'
import { isAuthConfigured } from '@/lib/supabase/config'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { getProduct } from '@betterdate/shared'

const product = getProduct()

const inputClassName =
  'w-full rounded-2xl border border-mauve-950/10 bg-white/70 px-4 py-3 text-mauve-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-rose-400'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = safeNextPath(searchParams.get('next'))
  const authError = searchParams.get('error') === 'auth'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(authError ? 'That sign-in link expired. Request a new one.' : null)

  if (!isAuthConfigured()) {
    return (
      <section className="py-12 sm:py-16">
        <Container className="max-w-xl lg:max-w-xl">
          <Heading className="text-4xl/11 sm:text-5xl/12">Accounts aren’t on yet</Heading>
          <Text className="mt-4">
            You can still take the quiz as a guest. Add Supabase keys to enable saved defaults.
          </Text>
        </Container>
      </section>
    )
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!isAuthConfigured()) {
      setError('Accounts are not configured on this deploy.')
      return
    }

    setStatus('sending')
    setError(null)

    try {
      const supabase = createBrowserSupabaseClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      })
      if (signInError) {
        setError(signInError.message)
        setStatus('idle')
        return
      }
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the sign-in link.')
      setStatus('idle')
    }
  }

  if (status === 'sent') {
    return (
      <section className="py-12 sm:py-16">
        <Container className="max-w-xl lg:max-w-xl">
          <Heading className="text-4xl/11 sm:text-5xl/12">Check your email</Heading>
          <Text className="mt-4">
            We sent a sign-in link to {email}. Open it on this device to save your {product.name} defaults.
          </Text>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-xl lg:max-w-xl">
        <p className="text-sm/7 font-medium text-rose-700 dark:text-rose-300">Account</p>
        <Heading className="mt-2 text-4xl/11 sm:text-5xl/12">Save your defaults</Heading>
        <Text className="mt-4">
          Sign in to remember your location, budget, energy, and vibes. You can still plan as a guest — accounts are
          optional.
        </Text>

        <form className="mt-10 flex flex-col gap-4" onSubmit={(event) => void submit(event)}>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClassName}
            />
          </label>
          {error && <p className="text-sm/7 text-rose-700 dark:text-rose-300">{error}</p>}
          <div>
            <Button type="submit" size="lg" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Email me a link'}
            </Button>
          </div>
        </form>
      </Container>
    </section>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
