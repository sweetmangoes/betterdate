'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { ButtonLink, SoftButtonLink } from '@/components/elements/button'
import { Container } from '@/components/elements/container'
import { Heading } from '@/components/elements/heading'
import { Text } from '@/components/elements/text'
import { datePlanSchema, type DatePlan } from '@/lib/plan'
import { PLAN_STORAGE_KEY } from '@/lib/quiz'

const categoryLabels: Record<DatePlan['stops'][number]['category'], string> = {
  food: 'Food',
  drink: 'Drink',
  activity: 'Activity',
  walk: 'Walk',
  dessert: 'Dessert',
}

export default function PlanPage() {
  const [plan, setPlan] = useState<DatePlan | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PLAN_STORAGE_KEY)
      if (!raw) {
        setLoaded(true)
        return
      }
      const parsed = datePlanSchema.safeParse(JSON.parse(raw))
      if (parsed.success) {
        setPlan(parsed.data)
      }
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true)
  }, [])

  if (!loaded) {
    return (
      <section className="py-20">
        <Container className="max-w-2xl lg:max-w-2xl">
          <Text>Loading your plan…</Text>
        </Container>
      </section>
    )
  }

  if (!plan) {
    return (
      <section className="py-20">
        <Container className="flex max-w-xl flex-col gap-6 lg:max-w-xl">
          <Heading className="text-4xl/11 sm:text-5xl/12">No plan yet</Heading>
          <Text>Take the preference quiz and we’ll build a local date plan for you.</Text>
          <div>
            <ButtonLink href="/quiz" size="lg">
              Start the quiz
            </ButtonLink>
          </div>
        </Container>
      </section>
    )
  }

  const stops = [...plan.stops].sort((a, b) => a.order - b.order)

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-2xl lg:max-w-2xl">
        <p className="text-sm/7 font-medium text-rose-700 dark:text-rose-300">Your date plan</p>
        <Heading className="mt-2 text-4xl/11 sm:text-5xl/12">{plan.title}</Heading>
        <Text className="mt-4">{plan.summary}</Text>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm/7 text-mauve-700 dark:text-mauve-400">
          <span>
            <span className="font-medium text-mauve-950 dark:text-white">Duration</span> {plan.duration}
          </span>
          <span>
            <span className="font-medium text-mauve-950 dark:text-white">Est. cost</span> {plan.estimatedCost}
          </span>
        </div>

        <ol className="mt-12 space-y-0">
          {stops.map((stop, index) => (
            <li key={`${stop.order}-${stop.name}`} className="relative flex gap-5 pb-10 last:pb-0">
              {index < stops.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-8 bottom-0 left-[15px] w-px bg-rose-600/25 dark:bg-rose-400/30"
                />
              )}
              <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-semibold text-white dark:bg-rose-500">
                {stop.order}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-display text-2xl tracking-tight text-mauve-950 dark:text-white">{stop.name}</h2>
                  <span className="text-sm/7 text-mauve-600 dark:text-mauve-400">
                    {categoryLabels[stop.category]} · {stop.neighborhood}
                    {stop.rating != null ? ` · ★ ${stop.rating.toFixed(1)}` : ''}
                  </span>
                </div>
                {stop.address ? (
                  <p className="mt-1 text-sm/7 text-mauve-600 dark:text-mauve-500">{stop.address}</p>
                ) : null}
                <p className="mt-1 text-sm/7 font-medium text-rose-700 dark:text-rose-300">{stop.timeHint}</p>
                <p className="mt-3 text-sm/7 text-mauve-700 dark:text-mauve-400">{stop.whyItFits}</p>
                <p className="mt-2 text-sm/7 text-mauve-600 italic dark:text-mauve-500">Tip: {stop.tip}</p>
                {stop.mapsUrl ? (
                  <p className="mt-3">
                    <a
                      href={stop.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm/7 font-medium text-rose-700 underline-offset-4 hover:underline dark:text-rose-300"
                    >
                      Open in Google Maps
                    </a>
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 space-y-8 border-t border-mauve-950/10 pt-10 dark:border-white/10">
          <div>
            <h3 className="font-display text-xl tracking-tight text-mauve-950 dark:text-white">
              Conversation starters
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm/7 text-mauve-700 dark:text-mauve-400">
              {plan.conversationStarters.map((starter) => (
                <li key={starter}>{starter}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl tracking-tight text-mauve-950 dark:text-white">Backup idea</h3>
            <p className="mt-3 text-sm/7 text-mauve-700 dark:text-mauve-400">{plan.backupIdea}</p>
          </div>

          <p className="text-sm/7 text-mauve-600 dark:text-mauve-500">{plan.disclaimer}</p>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <ButtonLink href="/quiz" size="lg">
            Plan another
          </ButtonLink>
          <SoftButtonLink href="/">Back home</SoftButtonLink>
          <Link
            href="/quiz"
            className="text-sm/7 text-mauve-600 underline-offset-4 hover:underline dark:text-mauve-400"
            onClick={() => sessionStorage.removeItem(PLAN_STORAGE_KEY)}
          >
            Retake quiz
          </Link>
        </div>
      </Container>
    </section>
  )
}
