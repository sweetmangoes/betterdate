'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Button, SoftButton } from '@/components/elements/button'
import { Container } from '@/components/elements/container'
import { Heading } from '@/components/elements/heading'
import { LocationAutocomplete } from '@/components/elements/location-autocomplete'
import { Text } from '@/components/elements/text'
import { CheckmarkIcon } from '@/components/icons/checkmark-icon'
import { useBrowserLocation } from '@/hooks/use-browser-location'
import {
  getProduct,
  isQuizStepComplete,
  parsePlanApiResponse,
  type PlanQuizAnswers,
} from '@betterdate/shared'
import { clsx } from 'clsx/lite'

const product = getProduct()

function OptionButton({
  selected,
  featured,
  badge,
  onClick,
  title,
  description,
}: {
  selected: boolean
  featured?: boolean
  badge?: string
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
        'w-full rounded-2xl border-2 text-left transition',
        featured ? 'px-5 py-4' : 'px-4 py-3',
        selected
          ? 'border-rose-600 bg-rose-50 text-mauve-950 dark:border-rose-400 dark:bg-rose-950/50 dark:text-white'
          : 'border-mauve-950/10 bg-white/60 text-mauve-950 hover:border-mauve-950/25 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/25',
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0 flex-1">
          {badge && (
            <span className="mb-1.5 inline-flex rounded-full bg-rose-600/10 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-400/15 dark:text-rose-300">
              {badge}
            </span>
          )}
          <span className="block text-sm/7 font-semibold">{title}</span>
          {description && (
            <span className="mt-0.5 block text-sm/6 text-mauve-600 dark:text-mauve-400">{description}</span>
          )}
        </span>
        {selected && (
          <CheckmarkIcon className="mt-1 size-4 shrink-0 text-rose-700 dark:text-rose-300" aria-hidden />
        )}
      </span>
    </button>
  )
}

function patchAnswers(prev: PlanQuizAnswers, patch: Record<string, unknown>): PlanQuizAnswers {
  return { ...prev, ...patch } as PlanQuizAnswers
}

const inputClassName =
  'w-full rounded-2xl border border-mauve-950/10 bg-white/70 px-4 py-3 text-mauve-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-rose-400'

export default function QuizPage() {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<PlanQuizAnswers>(product.emptyQuizAnswers)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const steps = product.getQuizSteps(answers)
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const isLast = stepIndex >= steps.length - 1
  const progress = ((Math.min(stepIndex, steps.length - 1) + 1) / steps.length) * 100
  const { coords, status: locationStatus, requestPermission } = useBrowserLocation(step.id === 'location')
  const meetingOptions = product.getMeetingPreferenceOptions(answers)
  const locationCopy = product.getLocationCopy?.(answers) ?? {
    yourLabel: product.locationYourLabel,
    theirLabel: product.locationTheirLabel,
    neighborhoodLabel: product.locationNeighborhoodLabel,
  }

  function update(patch: Record<string, unknown>) {
    setAnswers((prev) => patchAnswers(prev, patch))
    setError(null)
  }

  function toggleVibe(vibe: string) {
    setAnswers((prev) => {
      const vibes = prev.vibes as string[]
      if (vibes.includes(vibe)) {
        return patchAnswers(prev, { vibes: vibes.filter((item) => item !== vibe) })
      }
      if (vibes.length >= 2) return prev
      return patchAnswers(prev, { vibes: [...vibes, vibe] })
    })
    setError(null)
  }

  function goNext() {
    if (!isQuizStepComplete(step.id, answers)) {
      setError(step.id === 'vibes' ? 'Pick one or two vibes.' : 'Please complete this step.')
      return
    }
    if (!isLast) {
      setStepIndex((i) => i + 1)
      setError(null)
      return
    }
    submit()
  }

  function submit() {
    const parsed = product.parseQuizAnswers(answers)
    if (!parsed.success) {
      setError('Please check your answers.')
      return
    }

    startTransition(async () => {
      setError(null)
      try {
        const response = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        })
        const body: unknown = await response.json()
        const { plan } = parsePlanApiResponse(response.ok, body)

        sessionStorage.setItem(product.planStorageKey, JSON.stringify(plan))
        sessionStorage.setItem(product.quizStorageKey, JSON.stringify(parsed.data))
        router.push('/plan')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error. Check your connection and try again.')
      }
    })
  }

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-xl lg:max-w-xl">
        <div className="mb-10">
          <p className="text-sm/7 font-medium text-rose-700 dark:text-rose-300">
            Step {Math.min(stepIndex, steps.length - 1) + 1} of {steps.length}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mauve-950/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-rose-600 transition-all duration-300 dark:bg-rose-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Heading className="text-4xl/11 sm:text-5xl/12">{step.title}</Heading>
        <Text className="mt-4">{step.subtitle}</Text>

        <div className="mt-10 flex flex-col gap-3">
          {step.id === 'audience' &&
            product.audienceOptions?.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.product === 'date' && answers.audience === option.value}
                onClick={() => update({ audience: option.value })}
                title={option.label}
                description={option.description}
              />
            ))}

          {step.id === 'hangout' &&
            product.hangoutOptions?.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.product === 'friends' && answers.hangoutType === option.value}
                onClick={() => {
                  if (option.value === 'pair') {
                    update({ hangoutType: 'pair', groupSize: undefined })
                    return
                  }
                  const meetingPreference =
                    answers.meetingPreference === 'near_them' ? 'neighborhood' : answers.meetingPreference
                  update({ hangoutType: 'group', meetingPreference })
                }}
                title={option.label}
                description={option.description}
              />
            ))}

          {step.id === 'groupSize' &&
            product.groupSizeOptions?.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.product === 'friends' && answers.groupSize === option.value}
                onClick={() => update({ groupSize: option.value })}
                title={option.label}
              />
            ))}

          {step.id === 'meeting' &&
            meetingOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.meetingPreference === option.value}
                featured={option.featured}
                badge={option.badge}
                onClick={() => update({ meetingPreference: option.value })}
                title={option.label}
                description={option.description}
              />
            ))}

          {step.id === 'location' && (
            <>
              {(answers.meetingPreference === 'midpoint' || answers.meetingPreference === 'near_me') && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">
                    {locationCopy.yourLabel}
                  </span>
                  <LocationAutocomplete
                    value={answers.myLocation}
                    onChange={(value) => update({ myLocation: value })}
                    placeholder="e.g. Astoria, Queens"
                    className={inputClassName}
                    autoFocus
                    aria-label={locationCopy.yourLabel}
                    bias={coords}
                  />
                </label>
              )}
              {(answers.meetingPreference === 'midpoint' || answers.meetingPreference === 'near_them') && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">
                    {locationCopy.theirLabel}
                  </span>
                  <LocationAutocomplete
                    value={answers.theirLocation}
                    onChange={(value) => update({ theirLocation: value })}
                    placeholder="e.g. Park Slope, Brooklyn"
                    className={inputClassName}
                    autoFocus={answers.meetingPreference === 'near_them'}
                    aria-label={locationCopy.theirLabel}
                    bias={coords}
                  />
                </label>
              )}
              {answers.meetingPreference === 'neighborhood' && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">
                    {locationCopy.neighborhoodLabel}
                  </span>
                  <LocationAutocomplete
                    value={answers.location}
                    onChange={(value) => update({ location: value })}
                    placeholder="e.g. Williamsburg, Brooklyn"
                    className={inputClassName}
                    autoFocus
                    aria-label={locationCopy.neighborhoodLabel}
                    bias={coords}
                  />
                </label>
              )}
              {locationCopy.hint && (
                <p className="text-sm/6 text-mauve-600 dark:text-mauve-400">{locationCopy.hint}</p>
              )}
              {locationStatus === 'denied' && (
                <p className="text-sm/6 text-mauve-600 dark:text-mauve-400">
                  Allow location access for better nearby suggestions.{' '}
                  <button
                    type="button"
                    onClick={() => void requestPermission()}
                    className="font-medium text-rose-700 underline underline-offset-2 dark:text-rose-300"
                  >
                    Try again
                  </button>
                </p>
              )}
              {locationStatus === 'pending' && (
                <p className="text-sm/6 text-mauve-600 dark:text-mauve-400">
                  Finding your location for better suggestions…
                </p>
              )}
            </>
          )}

          {step.id === 'occasion' &&
            product.occasionOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.occasion === option.value}
                onClick={() => update({ occasion: option.value })}
                title={option.label}
              />
            ))}

          {step.id === 'budget' &&
            product.budgetOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.budget === option.value}
                onClick={() => update({ budget: option.value })}
                title={option.label}
                description={option.description}
              />
            ))}

          {step.id === 'time' &&
            product.timeOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.time === option.value}
                onClick={() => update({ time: option.value })}
                title={option.label}
              />
            ))}

          {step.id === 'hangLength' &&
            (product.getDurationOptions?.(answers) ?? []).map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.product === 'friends' && answers.hangLength === option.value}
                onClick={() => update({ hangLength: option.value })}
                title={option.label}
                description={option.description}
              />
            ))}

          {step.id === 'energy' &&
            product.energyOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.energy === option.value}
                onClick={() => update({ energy: option.value })}
                title={option.label}
                description={option.description}
              />
            ))}

          {step.id === 'vibes' &&
            product.vibeOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={(answers.vibes as string[]).includes(option.value)}
                onClick={() => toggleVibe(option.value)}
                title={option.label}
              />
            ))}

          {step.id === 'constraints' && (
            <textarea
              value={answers.constraints}
              onChange={(e) => update({ constraints: e.target.value })}
              placeholder={product.constraintsPlaceholder}
              rows={4}
              className="w-full resize-y rounded-2xl border border-mauve-950/10 bg-white/70 px-4 py-3 text-mauve-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-rose-400"
            />
          )}
        </div>

        {error && <p className="mt-6 text-sm/7 text-rose-700 dark:text-rose-300">{error}</p>}

        <div className="mt-10 flex items-center justify-between gap-4">
          <SoftButton
            type="button"
            disabled={stepIndex === 0 || isPending}
            onClick={() => {
              setStepIndex((i) => Math.max(0, i - 1))
              setError(null)
            }}
          >
            Back
          </SoftButton>
          <Button type="button" size="lg" disabled={isPending} onClick={goNext}>
            {isPending ? 'Planning…' : isLast ? 'Generate plan' : 'Continue'}
          </Button>
        </div>
      </Container>
    </section>
  )
}
