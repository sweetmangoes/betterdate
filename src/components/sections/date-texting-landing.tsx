import Link from 'next/link'
import type { ReactNode } from 'react'

import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { Container } from '@/components/elements/container'
import { Heading } from '@/components/elements/heading'
import { DatesPlannedTicker } from '@/components/elements/dates-planned'
import { PhoneSignupForm } from '@/components/elements/phone-signup-form'
import { Text } from '@/components/elements/text'
import { TextThread } from '@/components/elements/text-thread'

function StepTag({ kind }: { kind: 'text' | 'screen' }) {
  return kind === 'text' ? (
    <span className="inline-block rounded-full bg-mauve-950 px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-mauve-50 uppercase dark:bg-white dark:text-mauve-950">
      Text
    </span>
  ) : (
    <span className="inline-block rounded-full border border-rose-200 bg-rose-100 px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-rose-700 uppercase dark:border-rose-400/30 dark:bg-rose-950/40 dark:text-rose-300">
      Screen
    </span>
  )
}

function SectionHeader({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm/7 font-semibold text-rose-700 dark:text-rose-300">{kicker}</p>
      <h2 className="mt-2 font-display text-3xl/10 tracking-tight text-pretty text-mauve-950 sm:text-4xl/11 dark:text-white">
        {children}
      </h2>
    </div>
  )
}

const steps = [
  {
    kind: 'text' as const,
    headline: '1. Tell us the vibe',
    body: 'Who it’s with, where you’re both coming from, budget, and what to avoid. Just reply like you’d text a friend.',
    example: { from: 'me' as const, text: 'cozy, not too loud, under $80' },
  },
  {
    kind: 'screen' as const,
    headline: '2. Get a plan you can see',
    body: 'We text you a link to your plan: real places from Google Maps, a route, timing, conversation starters, and a backup idea.',
    example: { from: 'ai' as const, text: 'Here’s your Friday plan → betterdate.app/p/k7x2' },
  },
  {
    kind: 'text' as const,
    headline: '3. We keep you on track',
    body: 'A reminder to book, a heads-up the day of, and a check-in after. When it goes well, we’ll help you plan date two.',
    example: { from: 'ai' as const, text: 'Tonight’s the night. Meet at Sushi Kaze at 7.' },
  },
]

const meetingModes = [
  ['Halfway', 'Same travel time for both'],
  ['Near me', 'You’re hosting'],
  ['Near them', 'Make it easy for them'],
  ['A neighborhood', 'Somewhere you both like'],
]

export function DateTextingLanding({ datesPlanned }: { datesPlanned?: number | null }) {
  return (
    <>
      <section id="text-us" className="scroll-mt-24 pt-10 pb-16 sm:pt-16 sm:pb-24">
        <Container className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="font-display text-2xl tracking-tight text-rose-700 dark:text-rose-300">Better Date</p>
            <Heading className="mt-3">
              Plan your date
              <br />
              by text.
            </Heading>
            <Text size="lg" className="mt-6 max-w-xl text-pretty">
              Text us the vibe. We’ll send back a plan with real places near you both, remind you to book, and check in
              after. No app to download.
            </Text>
            <PhoneSignupForm className="mt-8" />
            {datesPlanned != null && <DatesPlannedTicker count={datesPlanned} />}
            <p className="mt-6 text-sm/7 text-mauve-700 dark:text-mauve-400">
              Prefer tapping?{' '}
              <Link href="/quiz" className="font-semibold text-rose-700 underline-offset-4 hover:underline dark:text-rose-300">
                Take the 2-minute quiz
              </Link>
              {' · '}
              <Link href="/p/demo" className="font-semibold text-rose-700 underline-offset-4 hover:underline dark:text-rose-300">
                See a sample plan
              </Link>
            </p>
          </div>
          <TextThread
            contactName="Better Date"
            className="max-lg:hidden"
            messages={[
              { from: 'ai', text: 'Hey! I’m Better Date. Who’s the date with, someone new or someone you’ve been seeing?' },
              { from: 'me', text: 'first date friday 😅' },
              { from: 'ai', text: 'Love it. Where are you each coming from?' },
              { from: 'me', text: 'Orleans, she’s in the Glebe' },
              { from: 'ai', text: 'Halfway it is. Cozy or something more fun?' },
              { from: 'me', text: 'cozy, she loves sushi' },
              {
                from: 'ai',
                link: { label: 'Better Date', title: 'Sushi & a slow walk, Fri 7 PM', subtitle: '3 stops near Elgin St' },
              },
            ]}
          />
        </Container>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-t border-mauve-950/10 py-16 sm:py-20 dark:border-white/10">
        <Container>
          <SectionHeader kicker="How it works">Talk it through. See the plan. Show up ready.</SectionHeader>
          <div className="mt-12 grid gap-12 sm:grid-cols-3 sm:gap-10">
            {steps.map((step) => (
              <div key={step.headline}>
                <StepTag kind={step.kind} />
                <h3 className="mt-4 font-display text-2xl tracking-tight text-mauve-950 dark:text-white">{step.headline}</h3>
                <p className="mt-2 text-sm/7 text-mauve-700 dark:text-mauve-400">{step.body}</p>
                <p
                  className={
                    step.example.from === 'me'
                      ? 'mt-4 inline-block rounded-2xl bg-blue-500 px-3.5 py-2 text-[13px]/5 text-white'
                      : 'mt-4 inline-block rounded-2xl bg-mauve-200 px-3.5 py-2 text-[13px]/5 text-mauve-950 dark:bg-white/10 dark:text-white'
                  }
                >
                  {step.example.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="meet-in-the-middle" className="py-8 sm:py-12">
        <Container>
          <div className="grid gap-10 rounded-3xl border border-rose-600/20 bg-rose-50/60 px-6 py-10 sm:px-12 sm:py-12 lg:grid-cols-2 lg:gap-14 dark:border-rose-400/20 dark:bg-rose-950/25">
            <div>
              <SectionHeader kicker="Meet in the middle">
                Fair for both of you, without the “where should we go?” back-and-forth.
              </SectionHeader>
              <p className="mt-4 text-sm/7 text-mauve-700 dark:text-mauve-400">
                Tell us where you’re each coming from. We’ll pick spots roughly halfway, near one of you, or in a
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

      <section id="pricing" className="scroll-mt-24 py-16 sm:py-20">
        <Container>
          <SectionHeader kicker="Pricing">Start free. Upgrade when you’re dating a lot.</SectionHeader>
          <div className="mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-mauve-950/15 bg-mauve-50 p-7 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-bold text-mauve-950 dark:text-white">Free</p>
              <p className="mt-2 font-display text-4xl text-mauve-950 dark:text-white">$0</p>
              <ul className="mt-5 space-y-2 text-sm/6 text-mauve-700 dark:text-mauve-400">
                <li>1 date plan a week</li>
                <li>Booking and day-of reminders</li>
                <li>Nothing saved after the date</li>
              </ul>
              <ButtonLink href="#text-us" size="lg" className="mt-6">
                Text us
              </ButtonLink>
            </div>
            <div className="rounded-3xl border border-rose-600 bg-mauve-50 p-7 dark:border-rose-400 dark:bg-white/5">
              <p className="text-sm font-bold text-mauve-950 dark:text-white">Pro</p>
              <p className="mt-2 font-display text-4xl text-mauve-950 dark:text-white">Coming soon</p>
              <ul className="mt-5 space-y-2 text-sm/6 text-mauve-700 dark:text-mauve-400">
                <li>Unlimited plans</li>
                <li>Remembers your past dates</li>
                <li>“Last time was sushi, try something new”</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section id="cta" className="border-t border-mauve-950/10 py-16 text-center sm:py-20 dark:border-white/10">
        <Container className="flex flex-col items-center">
          <h2 className="font-display text-3xl/10 tracking-tight text-mauve-950 sm:text-4xl/11 dark:text-white">
            A world without bad dates.
          </h2>
          <Text size="lg" className="mt-3">
            One text to start. About five minutes to a plan.
          </Text>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="#text-us" size="lg" className="bg-rose-600! hover:bg-rose-700! dark:text-white!">
              Text me
            </ButtonLink>
            <PlainButtonLink href="/quiz" size="lg">
              Take the quiz
            </PlainButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}
