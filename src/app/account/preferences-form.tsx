'use client'

import { useEffect, useState } from 'react'

import { Button, SoftButton } from '@/components/elements/button'
import { Container } from '@/components/elements/container'
import { Heading } from '@/components/elements/heading'
import { LocationAutocomplete } from '@/components/elements/location-autocomplete'
import { Text } from '@/components/elements/text'
import { CheckmarkIcon } from '@/components/icons/checkmark-icon'
import {
  getFriendsHangLengthOptions,
  getProduct,
  parsePreferenceProfile,
  preferenceProfileFromQuiz,
  type PreferenceProfile,
} from '@betterdate/shared'
import { clsx } from 'clsx/lite'

const product = getProduct()

const inputClassName =
  'w-full rounded-2xl border border-mauve-950/10 bg-white/70 px-4 py-3 text-mauve-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-rose-400'

function OptionButton({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean
  onClick: () => void
  title: string
  description?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={clsx(
        'w-full rounded-2xl border-2 px-4 py-3 text-left transition',
        selected
          ? 'border-rose-600 bg-rose-50 text-mauve-950 dark:border-rose-400 dark:bg-rose-950/50 dark:text-white'
          : 'border-mauve-950/10 bg-white/60 text-mauve-950 hover:border-mauve-950/25 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/25',
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0 flex-1">
          <span className="block text-sm/7 font-semibold">{title}</span>
          {description && (
            <span className="mt-0.5 block text-sm/6 text-mauve-600 dark:text-mauve-400">{description}</span>
          )}
        </span>
        {selected && <CheckmarkIcon className="mt-1 size-4 shrink-0 text-rose-700 dark:text-rose-300" aria-hidden />}
      </span>
    </button>
  )
}

function emptyProfile(): PreferenceProfile {
  const extracted = preferenceProfileFromQuiz(product.emptyQuizAnswers)
  return { ...extracted, vibes: [] }
}

export function PreferencesForm({ email }: { email: string }) {
  const [profile, setProfile] = useState<PreferenceProfile>(emptyProfile)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hangLengthOptions = getFriendsHangLengthOptions('evening')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch('/api/me/preferences')
        const body: unknown = await response.json()
        if (cancelled) return
        if (!response.ok) {
          setError('Could not load your defaults.')
          setLoaded(true)
          return
        }
        const profileBody = body as { profile: PreferenceProfile | null }
        if (profileBody.profile) {
          const parsed = parsePreferenceProfile(product.id, profileBody.profile)
          if (parsed.success) setProfile(parsed.data)
        }
      } catch {
        if (!cancelled) setError('Could not load your defaults.')
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  function toggleVibe(vibe: string) {
    setProfile((prev) => {
      const vibes = prev.vibes as string[]
      if (vibes.includes(vibe)) {
        return { ...prev, vibes: vibes.filter((item) => item !== vibe) } as PreferenceProfile
      }
      if (vibes.length >= 2) return prev
      return { ...prev, vibes: [...vibes, vibe] } as PreferenceProfile
    })
    setMessage(null)
    setError(null)
  }

  async function save() {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/me/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const body: unknown = await response.json()
      if (!response.ok) {
        const errorBody = body as { error?: string }
        setError(errorBody.error ?? 'Could not save preferences.')
        return
      }
      setMessage('Defaults saved.')
    } catch {
      setError('Could not save preferences.')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) {
    return (
      <section className="py-20">
        <Container className="max-w-xl lg:max-w-xl">
          <Text>Loading your defaults…</Text>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-xl lg:max-w-xl">
        <p className="text-sm/7 font-medium text-rose-700 dark:text-rose-300">Account</p>
        <Heading className="mt-2 text-4xl/11 sm:text-5xl/12">Your defaults</Heading>
        <Text className="mt-4">
          These are yours — location, budget, energy, vibes. Hang-specific details (who’s coming, when, where they are)
          still get asked each time you plan.
        </Text>
        <p className="mt-3 text-sm/7 text-mauve-600 dark:text-mauve-400">{email}</p>

        <div className="mt-10 flex flex-col gap-8">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">
              {product.locationYourLabel}
            </span>
            <LocationAutocomplete
              value={profile.myLocation}
              onChange={(value) => {
                setProfile((prev) => ({ ...prev, myLocation: value }))
                setMessage(null)
              }}
              placeholder="e.g. Astoria, Queens"
              className={inputClassName}
              aria-label={product.locationYourLabel}
            />
          </label>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">Budget</legend>
            {product.budgetOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={profile.budget === option.value}
                onClick={() => setProfile((prev) => ({ ...prev, budget: option.value as PreferenceProfile['budget'] }))}
                title={option.label}
                description={option.description}
              />
            ))}
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">Energy</legend>
            {product.energyOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={profile.energy === option.value}
                onClick={() => setProfile((prev) => ({ ...prev, energy: option.value as PreferenceProfile['energy'] }))}
                title={option.label}
                description={option.description}
              />
            ))}
          </fieldset>

          {profile.product === 'friends' && (
            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">Default hang length</legend>
              {hangLengthOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  selected={profile.defaultHangLength === option.value}
                  onClick={() =>
                    setProfile((prev) =>
                      prev.product === 'friends' ? { ...prev, defaultHangLength: option.value } : prev,
                    )
                  }
                  title={option.label}
                  description={option.description}
                />
              ))}
            </fieldset>
          )}

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">
              Vibes (up to two)
            </legend>
            {product.vibeOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={(profile.vibes as string[]).includes(option.value)}
                onClick={() => toggleVibe(option.value)}
                title={option.label}
              />
            ))}
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">Constraints</span>
            <textarea
              value={profile.constraints}
              onChange={(event) => setProfile((prev) => ({ ...prev, constraints: event.target.value }))}
              placeholder={product.constraintsPlaceholder}
              rows={4}
              className="w-full resize-y rounded-2xl border border-mauve-950/10 bg-white/70 px-4 py-3 text-mauve-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-rose-400"
            />
          </label>
        </div>

        {error && <p className="mt-6 text-sm/7 text-rose-700 dark:text-rose-300">{error}</p>}
        {message && <p className="mt-6 text-sm/7 text-mauve-700 dark:text-mauve-300">{message}</p>}

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button type="button" size="lg" disabled={saving} onClick={() => void save()}>
            {saving ? 'Saving…' : 'Save defaults'}
          </Button>
          <form action="/auth/sign-out" method="post">
            <SoftButton type="submit">Sign out</SoftButton>
          </form>
        </div>

        <p className="mt-8 text-sm/7 text-mauve-600 dark:text-mauve-400">
          Next quiz will start from these defaults. Hang details still get asked each time.
        </p>
      </Container>
    </section>
  )
}
