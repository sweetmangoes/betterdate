'use client'

import { useEffect, useState } from 'react'

import { Button, SoftButtonLink } from '@/components/elements/button'
import {
  getProduct,
  parsePreferenceProfile,
  preferenceProfileFromQuiz,
  preferenceProfilesEqual,
  quizAnswersSchema,
  friendsQuizAnswersSchema,
  type PlanQuizAnswers,
  type PreferenceProfile,
} from '@betterdate/shared'

const product = getProduct()

function readQuizAnswers(): PlanQuizAnswers | null {
  try {
    const raw = sessionStorage.getItem(product.quizStorageKey)
    if (!raw) return null
    const parsed =
      product.id === 'friends' ? friendsQuizAnswersSchema.safeParse(JSON.parse(raw)) : quizAnswersSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function SavePreferencesCard() {
  const [state, setState] = useState<'loading' | 'guest' | 'ready' | 'saved' | 'hidden'>('loading')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const answers = readQuizAnswers()
      if (!answers) {
        setState('hidden')
        return
      }

      try {
        const response = await fetch('/api/me/preferences')
        if (cancelled) return

        if (response.status === 501) {
          setState('hidden')
          return
        }
        if (response.status === 401) {
          setState('guest')
          return
        }
        if (!response.ok) {
          setState('hidden')
          return
        }

        const body: unknown = await response.json()
        const profileBody = body as { profile: PreferenceProfile | null }
        const extracted = preferenceProfileFromQuiz(answers)
        if (profileBody.profile) {
          const parsed = parsePreferenceProfile(product.id, profileBody.profile)
          if (parsed.success && preferenceProfilesEqual(parsed.data, extracted)) {
            setState('saved')
            return
          }
        }
        setState('ready')
      } catch {
        if (!cancelled) setState('hidden')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  async function save() {
    const answers = readQuizAnswers()
    if (!answers) return

    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/me/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferenceProfileFromQuiz(answers)),
      })
      if (!response.ok) {
        const body: unknown = await response.json()
        const errorBody = body as { error?: string }
        setError(errorBody.error ?? 'Could not save preferences.')
        return
      }
      setState('saved')
    } catch {
      setError('Could not save preferences.')
    } finally {
      setSaving(false)
    }
  }

  if (state === 'loading' || state === 'hidden') return null

  if (state === 'guest') {
    return (
      <div className="rounded-3xl border border-rose-600/20 bg-rose-50/60 px-6 py-6 dark:border-rose-400/20 dark:bg-rose-950/25">
        <p className="text-sm/7 font-semibold text-rose-700 dark:text-rose-300">Remember this next time</p>
        <p className="mt-2 text-sm/7 text-mauve-700 dark:text-mauve-400">
          Sign in to save your location, budget, energy, and vibes. Hang details still get asked each time you plan.
        </p>
        <div className="mt-4">
          <SoftButtonLink href="/login?next=/plan">Create an account</SoftButtonLink>
        </div>
      </div>
    )
  }

  if (state === 'saved') {
    return (
      <div className="rounded-3xl border border-mauve-950/10 bg-white/60 px-6 py-6 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm/7 font-semibold text-mauve-950 dark:text-white">Defaults saved</p>
        <p className="mt-2 text-sm/7 text-mauve-700 dark:text-mauve-400">
          Your next quiz will start from these preferences.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-rose-600/20 bg-rose-50/60 px-6 py-6 dark:border-rose-400/20 dark:bg-rose-950/25">
      <p className="text-sm/7 font-semibold text-rose-700 dark:text-rose-300">Save as my defaults</p>
      <p className="mt-2 text-sm/7 text-mauve-700 dark:text-mauve-400">
        Keep your location, budget, energy, and vibes for next time. This hang’s occasion and meeting spot stay
        one-off.
      </p>
      {error && <p className="mt-3 text-sm/7 text-rose-700 dark:text-rose-300">{error}</p>}
      <div className="mt-4">
        <Button type="button" disabled={saving} onClick={() => void save()}>
          {saving ? 'Saving…' : 'Save defaults'}
        </Button>
      </div>
    </div>
  )
}
