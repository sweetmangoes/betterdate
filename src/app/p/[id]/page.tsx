import type { DatePlan } from '@betterdate/shared'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ButtonLink } from '@/components/elements/button'
import { Container } from '@/components/elements/container'
import { DateNumberBanner } from '@/components/elements/dates-planned'
import { Heading } from '@/components/elements/heading'
import { SavePreferencesCard } from '@/components/elements/save-preferences-card'
import { Text } from '@/components/elements/text'
import { getPlan } from '@/lib/plans-db'
import { getProduct } from '@/lib/product'
import { getTwilioPhoneNumber } from '@/lib/twilio'

import { PlanMap, SharePlanButton } from './plan-client'

const categoryLabels: Record<DatePlan['stops'][number]['category'], string> = {
  food: 'Food',
  drink: 'Drink',
  activity: 'Activity',
  walk: 'Walk',
  dessert: 'Dessert',
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const saved = await getPlan((await params).id)
  return {
    title: saved?.plan.title ?? getProduct().planPageTitle,
    robots: { index: false, follow: false },
  }
}

function routeUrl(stops: DatePlan['stops']): string | null {
  const points = stops.map((stop) =>
    stop.lat != null && stop.lng != null ? `${stop.lat},${stop.lng}` : stop.address || `${stop.name}, ${stop.neighborhood}`,
  )
  if (points.length < 2) return stops[0]?.mapsUrl ?? null

  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('origin', points[0])
  url.searchParams.set('destination', points[points.length - 1])
  if (points.length > 2) url.searchParams.set('waypoints', points.slice(1, -1).join('|'))
  return url.toString()
}

export default async function SavedPlanPage({ params }: Props) {
  const { id } = await params
  const saved = await getPlan(id)
  if (!saved) notFound()

  const product = getProduct()
  const { plan } = saved
  const stops = [...plan.stops].sort((a, b) => a.order - b.order)
  const hasCoordinates = stops.some((stop) => stop.lat != null)
  const route = routeUrl(stops)
  const textNumber = product.id === 'date' ? getTwilioPhoneNumber() : null

  return (
    <section className="py-10 sm:py-14">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div>
          <p className="text-sm/7 font-semibold text-rose-700 dark:text-rose-300">{product.planEyebrow}</p>
          <Heading className="mt-2 text-4xl/11 sm:text-5xl/12">{plan.title}</Heading>
          <Text size="lg" className="mt-4 text-pretty">
            {plan.summary}
          </Text>
          {saved.dateNumber != null && <DateNumberBanner n={saved.dateNumber} />}
          <div className="mt-5 flex flex-wrap gap-2">
            {[plan.duration, plan.estimatedCost].map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-mauve-950/10 bg-mauve-50 px-3 py-1 text-xs/5 font-semibold text-mauve-700 dark:border-white/10 dark:bg-white/5 dark:text-mauve-300"
              >
                {pill}
              </span>
            ))}
          </div>

          <ol className="mt-8">
            {stops.map((stop) => (
              <li
                key={`${stop.order}-${stop.name}`}
                className="grid grid-cols-[2rem_1fr] gap-4 border-t border-mauve-950/10 py-5 dark:border-white/10"
              >
                <span className="grid size-8 place-items-center rounded-full bg-rose-600 text-sm font-semibold text-white dark:bg-rose-500">
                  {stop.order}
                </span>
                <div className="min-w-0">
                  <p className="text-sm/6 font-semibold text-rose-700 dark:text-rose-300">{stop.timeHint}</p>
                  <h2 className="mt-0.5 font-display text-2xl tracking-tight text-mauve-950 dark:text-white">{stop.name}</h2>
                  <p className="mt-0.5 text-sm/6 text-mauve-600 dark:text-mauve-400">
                    {categoryLabels[stop.category]} · {stop.neighborhood}
                    {stop.rating != null ? ` · ★ ${stop.rating.toFixed(1)}` : ''}
                  </p>
                  <p className="mt-2 text-sm/7 text-mauve-700 dark:text-mauve-400">{stop.whyItFits}</p>
                  <p className="mt-1 text-sm/7 text-mauve-600 italic dark:text-mauve-500">Tip: {stop.tip}</p>
                  {stop.mapsUrl && (
                    <a
                      href={stop.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm/7 font-semibold text-rose-700 underline-offset-4 hover:underline dark:text-rose-300"
                    >
                      Open in Maps
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          {hasCoordinates && <PlanMap src={`/api/plans/${saved.id}/map`} alt={`Map of the stops for ${plan.title}`} />}

          {product.showConversationStarters && plan.conversationStarters.length > 0 && (
            <div className="rounded-3xl border border-mauve-950/10 bg-mauve-50 p-6 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-xs font-bold tracking-wider text-mauve-500 uppercase">{product.conversationStartersLabel}</h3>
              <ul className="mt-3 space-y-2 text-sm/6 text-mauve-700 dark:text-mauve-300">
                {plan.conversationStarters.map((starter) => (
                  <li key={starter}>“{starter}”</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-3xl border border-mauve-950/10 bg-mauve-50 p-6 dark:border-white/10 dark:bg-white/5">
            <h3 className="text-xs font-bold tracking-wider text-mauve-500 uppercase">Backup idea</h3>
            <p className="mt-3 text-sm/6 text-mauve-700 dark:text-mauve-300">{plan.backupIdea}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {route && (
              <a
                href={route}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-mauve-950 px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white hover:bg-mauve-800 dark:bg-mauve-300 dark:text-mauve-950"
              >
                Open route in Maps
              </a>
            )}
            <SharePlanButton title={plan.title} />
          </div>

          {textNumber && (
            <div className="flex items-center justify-between gap-4 rounded-3xl bg-mauve-950 px-6 py-5 text-white dark:bg-white/10">
              <p className="text-sm/6">
                Want to change something?
                <span className="block text-mauve-300">Text “make it cheaper” or “swap the café.”</span>
              </p>
              <a
                href={`sms:${textNumber}`}
                className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-mauve-950 hover:bg-mauve-100"
              >
                Open messages
              </a>
            </div>
          )}

          <p className="text-xs/5 text-mauve-500">{plan.disclaimer}</p>

          <SavePreferencesCard />

          <div>
            <ButtonLink href="/quiz" size="lg">
              Plan another
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
