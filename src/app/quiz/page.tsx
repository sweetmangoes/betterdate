'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Button, SoftButton } from '@/components/elements/button'
import { Container } from '@/components/elements/container'
import { Heading } from '@/components/elements/heading'
import { Text } from '@/components/elements/text'
import {
  audienceOptions,
  budgetOptions,
  emptyQuizAnswers,
  energyOptions,
  meetingPreferenceOptions,
  occasionOptions,
  PLAN_STORAGE_KEY,
  QUIZ_STORAGE_KEY,
  quizAnswersSchema,
  quizSteps,
  timeOptions,
  vibeOptions,
  type QuizAnswers,
  type QuizStepId,
} from '@/lib/quiz'
import { parsePlanApiResponse } from '@betterdate/shared'
import { clsx } from 'clsx/lite'

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
      onClick={onClick}
      className={clsx(
        'w-full rounded-2xl border px-4 py-3 text-left transition',
        selected
          ? 'border-rose-600 bg-rose-50/80 text-mauve-950 dark:border-rose-400 dark:bg-rose-950/40 dark:text-white'
          : 'border-mauve-950/10 bg-white/60 text-mauve-950 hover:border-mauve-950/25 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/25',
      )}
    >
      <span className="block text-sm/7 font-semibold">{title}</span>
      {description && <span className="mt-0.5 block text-sm/6 text-mauve-600 dark:text-mauve-400">{description}</span>}
    </button>
  )
}

function isStepComplete(step: QuizStepId, answers: QuizAnswers): boolean {
  switch (step) {
    case 'audience':
      return Boolean(answers.audience)
    case 'meeting':
      return Boolean(answers.meetingPreference)
    case 'location':
      switch (answers.meetingPreference) {
        case 'midpoint':
          return answers.myLocation.trim().length >= 2 && answers.theirLocation.trim().length >= 2
        case 'near_me':
          return answers.myLocation.trim().length >= 2
        case 'near_them':
          return answers.theirLocation.trim().length >= 2
        case 'neighborhood':
          return answers.location.trim().length >= 2
      }
    case 'occasion':
      return Boolean(answers.occasion)
    case 'budget':
      return Boolean(answers.budget)
    case 'time':
      return Boolean(answers.time)
    case 'energy':
      return Boolean(answers.energy)
    case 'vibes':
      return answers.vibes.length >= 1 && answers.vibes.length <= 2
    case 'constraints':
      return true
  }
}

const inputClassName =
  'w-full rounded-2xl border border-mauve-950/10 bg-white/70 px-4 py-3 text-mauve-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-rose-400'

export default function QuizPage() {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>(emptyQuizAnswers)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const step = quizSteps[stepIndex]
  const isLast = stepIndex === quizSteps.length - 1
  const progress = ((stepIndex + 1) / quizSteps.length) * 100

  function update<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  function toggleVibe(vibe: QuizAnswers['vibes'][number]) {
    setAnswers((prev) => {
      if (prev.vibes.includes(vibe)) {
        return { ...prev, vibes: prev.vibes.filter((v) => v !== vibe) }
      }
      if (prev.vibes.length >= 2) return prev
      return { ...prev, vibes: [...prev.vibes, vibe] }
    })
    setError(null)
  }

  function goNext() {
    if (!isStepComplete(step.id, answers)) {
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
    const parsed = quizAnswersSchema.safeParse(answers)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your answers.')
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

        sessionStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan))
        sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(parsed.data))
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
            Step {stepIndex + 1} of {quizSteps.length}
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
            audienceOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.audience === option.value}
                onClick={() => update('audience', option.value)}
                title={option.label}
                description={option.description}
              />
            ))}

          {step.id === 'meeting' &&
            meetingPreferenceOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.meetingPreference === option.value}
                onClick={() => update('meetingPreference', option.value)}
                title={option.label}
                description={option.description}
              />
            ))}

          {step.id === 'location' && (
            <>
              {(answers.meetingPreference === 'midpoint' ||
                answers.meetingPreference === 'near_me') && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">
                    Your location
                  </span>
                  <input
                    type="text"
                    value={answers.myLocation}
                    onChange={(e) => update('myLocation', e.target.value)}
                    placeholder="e.g. Astoria, Queens"
                    className={inputClassName}
                    autoFocus
                  />
                </label>
              )}
              {(answers.meetingPreference === 'midpoint' ||
                answers.meetingPreference === 'near_them') && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">
                    Their location
                  </span>
                  <input
                    type="text"
                    value={answers.theirLocation}
                    onChange={(e) => update('theirLocation', e.target.value)}
                    placeholder="e.g. Park Slope, Brooklyn"
                    className={inputClassName}
                    autoFocus={answers.meetingPreference === 'near_them'}
                  />
                </label>
              )}
              {answers.meetingPreference === 'neighborhood' && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm/6 font-medium text-mauve-700 dark:text-mauve-300">
                    Neighborhood or city
                  </span>
                  <input
                    type="text"
                    value={answers.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="e.g. Williamsburg, Brooklyn"
                    className={inputClassName}
                    autoFocus
                  />
                </label>
              )}
            </>
          )}

          {step.id === 'occasion' &&
            occasionOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.occasion === option.value}
                onClick={() => update('occasion', option.value)}
                title={option.label}
              />
            ))}

          {step.id === 'budget' &&
            budgetOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.budget === option.value}
                onClick={() => update('budget', option.value)}
                title={option.label}
                description={option.description}
              />
            ))}

          {step.id === 'time' &&
            timeOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.time === option.value}
                onClick={() => update('time', option.value)}
                title={option.label}
              />
            ))}

          {step.id === 'energy' &&
            energyOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.energy === option.value}
                onClick={() => update('energy', option.value)}
                title={option.label}
                description={option.description}
              />
            ))}

          {step.id === 'vibes' &&
            vibeOptions.map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.vibes.includes(option.value)}
                onClick={() => toggleVibe(option.value)}
                title={option.label}
              />
            ))}

          {step.id === 'constraints' && (
            <textarea
              value={answers.constraints}
              onChange={(e) => update('constraints', e.target.value)}
              placeholder="Vegetarian, avoid loud bars, prefer indoor if raining…"
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
