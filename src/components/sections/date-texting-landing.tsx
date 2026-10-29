import Link from 'next/link'

import { Container } from '@/components/elements/container'
import { formatDatesPlanned } from '@/components/elements/dates-planned'
import { MessageComposer } from '@/components/elements/message-composer'
import { StickyTextCta } from '@/components/elements/sticky-text-cta'
import { Text } from '@/components/elements/text'
import { TextThread } from '@/components/elements/text-thread'
import { DatePricingCards } from '@/components/sections/date-pricing'

const cities = ['Ottawa', 'Montreal', 'Toronto', 'Vancouver', 'Halifax']

const howSteps = [
  {
    num: '01',
    headline: 'Tell me the vibe',
    body: 'Who it’s with, where you’re coming from, budget, what to avoid. Type it here or reply once I text you.',
  },
  {
    num: '02',
    headline: 'Open a plan you can actually use',
    body: 'Real places from Google Maps, a route, timing, and a backup idea — as a link on your phone.',
  },
  {
    num: '03',
    headline: 'I’ll keep you on track',
    body: 'A reminder to book, a heads-up the day of, and a check-in after.',
  },
]

const meetingModes = [
  ['Halfway', 'Same travel time for both'],
  ['Near me', 'You’re hosting'],
  ['Near them', 'Make it easy for them'],
  ['A neighborhood', 'Somewhere you both like'],
]

export function DateTextingLanding({ datesPlanned }: { datesPlanned?: number | null }) {
  const count = datesPlanned ?? 0
  const nextNumber = Math.max(count, 0) + 1

  return (
    <>
      <section id="text-us" className="scroll-mt-24 px-6 pt-16 pb-10 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-[2.625rem]/none tracking-tight text-balance text-mauve-950 sm:text-[4.25rem] dark:text-white">
            I’ll plan your date.
            <br />
            Text me.
          </h1>
          <Text size="lg" className="mx-auto mt-6 max-w-xl text-pretty">
            Tell me the vibe. I’ll text back a plan with real places near you both, then remind you to book.
          </Text>
          <MessageComposer className="mx-auto mt-10 max-w-[560px]" />
          <p className="mt-5 text-sm/6 text-mauve-600 dark:text-mauve-400">I’ll text you — SMS or WhatsApp. Canada for now.</p>
          <p className="mt-4 text-sm/7 text-mauve-700 dark:text-mauve-400">
            Want to plan in the browser instead?{' '}
            <Link href="/quiz" className="font-semibold text-rose-700 underline-offset-4 hover:underline dark:text-rose-300">
              Take the 2-minute quiz
            </Link>
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 border-y border-mauve-950/10 px-6 py-6 sm:flex-row sm:items-center sm:gap-10 lg:px-10 dark:border-white/10">
        <p className="max-w-[13rem] text-sm/6 text-mauve-700 dark:text-mauve-400">I plan dates in</p>
        <div className="flex flex-wrap gap-x-7 gap-y-2 text-xs font-bold tracking-widest text-mauve-400 uppercase">
          {cities.map((city) => (
            <span key={city}>{city}</span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <p className="font-display text-[5rem]/none tracking-tight text-mauve-950 tabular-nums sm:text-[7.5rem] dark:text-white">
          {formatDatesPlanned(count)}
        </p>
        <h2 className="mt-3 font-display text-4xl/10 tracking-tight text-mauve-950 sm:text-5xl/12 dark:text-white">
          dates planned.
        </h2>
        <div className="mt-8 max-w-2xl border-t border-mauve-950/10 pt-8 dark:border-white/10">
          <p className="text-lg/8 text-mauve-950 dark:text-white">
            This only goes up when I generate a real plan. No padding. Yours will be number{' '}
            <span className="font-semibold tabular-nums">{formatDatesPlanned(nextNumber)}</span>.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 mx-auto grid max-w-7xl items-center gap-14 px-6 py-10 pb-20 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div>
          <h2 className="font-display text-4xl/10 tracking-tight text-mauve-950 sm:text-5xl/12 dark:text-white">
            How it works.
          </h2>
          <ol className="mt-10">
            {howSteps.map((step, index) => (
              <li
                key={step.num}
                className={
                  index === 0
                    ? 'grid grid-cols-[2.25rem_1fr] gap-3.5 border-t-2 border-mauve-950 py-4 dark:border-white'
                    : 'grid grid-cols-[2.25rem_1fr] gap-3.5 border-t border-mauve-950/10 py-4 dark:border-white/10'
                }
              >
                <span className="pt-0.5 text-sm font-bold text-rose-700 dark:text-rose-300">{step.num}</span>
                <div>
                  <h3 className="font-semibold text-mauve-950 dark:text-white">{step.headline}</h3>
                  <p className="mt-1 text-sm/6 text-mauve-700 dark:text-mauve-400">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <TextThread
            contactName="Better Date"
            messages={[
              { from: 'me', text: 'first date Friday, she’s in the Glebe' },
              { from: 'ai', text: 'Love it. You’re in Orleans?' },
              { from: 'me', text: 'yeah. cozy, she loves sushi' },
              { from: 'ai', text: 'Halfway it is. Here’s Friday:' },
              {
                from: 'ai',
                link: { label: 'Better Date', title: 'Sushi & a slow walk, 7 PM', subtitle: '3 stops near Elgin St' },
              },
            ]}
          />
          <p className="mt-4 text-center text-sm/6 text-mauve-600 dark:text-mauve-400">
            A sample thread.{' '}
            <Link href="/p/demo" className="font-semibold text-rose-700 underline-offset-4 hover:underline dark:text-rose-300">
              See the full plan
            </Link>
          </p>
        </div>
      </section>

      <section id="meet-in-the-middle" className="pb-8 sm:pb-12">
        <Container>
          <div className="grid gap-10 rounded-3xl border border-rose-600/20 bg-rose-50/60 px-6 py-10 sm:px-12 sm:py-12 lg:grid-cols-2 lg:gap-14 dark:border-rose-400/20 dark:bg-rose-950/25">
            <div>
              <p className="text-sm/7 font-semibold text-rose-700 dark:text-rose-300">Meet in the middle</p>
              <h2 className="mt-2 font-display text-3xl/10 tracking-tight text-pretty text-mauve-950 sm:text-4xl/11 dark:text-white">
                Fair for both of you, without the “where should we go?” back-and-forth.
              </h2>
              <p className="mt-4 text-sm/7 text-mauve-700 dark:text-mauve-400">
                Tell me where you’re each coming from. I’ll pick spots roughly halfway, near one of you, or in a
                neighborhood you choose.
              </p>
            </div>
            <ul className="self-center">
              {meetingModes.map(([mode, note]) => (
                <li
                  key={mode}
                  className="flex justify-between gap-4 border-b border-rose-600/15 py-3 text-sm/6 last:border-b-0 dark:border-rose-400/15"
                >
                  <span className="font-medium text-mauve-950 dark:text-white">{mode}</span>
                  <span className="text-mauve-600 dark:text-mauve-400">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section id="pricing" className="scroll-mt-24 py-16 pb-32 sm:py-20 sm:pb-36">
        <Container>
          <p className="text-sm/7 font-semibold text-rose-700 dark:text-rose-300">Pricing</p>
          <h2 className="mt-2 font-display text-3xl/10 tracking-tight text-pretty text-mauve-950 sm:text-4xl/11 dark:text-white">
            Start free. Upgrade later if you want.
          </h2>
          <p className="mt-3 max-w-xl text-sm/7 text-mauve-700 dark:text-mauve-400">
            Free is enough to try a real plan. Pro will remember what you’ve already done — it isn’t for sale yet.
          </p>
          <DatePricingCards ctaHref="#text-us" />
        </Container>
      </section>

      <StickyTextCta />
    </>
  )
}
