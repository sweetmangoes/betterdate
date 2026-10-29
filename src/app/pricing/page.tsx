import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { Container } from '@/components/elements/container'
import { Heading } from '@/components/elements/heading'
import { Text } from '@/components/elements/text'
import { getProduct } from '@/lib/product'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Start free with one date plan a week. Pro (coming soon) unlocks unlimited plans and saved date history.',
  alternates: { canonical: '/pricing' },
}

export default function Page() {
  if (getProduct().id !== 'date') notFound()

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <p className="text-sm/7 font-semibold text-rose-700 dark:text-rose-300">Pricing</p>
        <Heading className="mt-2">Start free. Upgrade when you’re dating a lot.</Heading>
        <Text size="lg" className="mt-5 max-w-2xl">
          Text me or take the quiz. Free is enough to try a real plan. Pro is for people who want the AI to remember
          what you’ve already done.
        </Text>

        <div className="mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-mauve-950/15 bg-mauve-50 p-7 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-bold text-mauve-950 dark:text-white">Free</p>
            <p className="mt-2 font-display text-4xl text-mauve-950 dark:text-white">$0</p>
            <ul className="mt-5 space-y-2 text-sm/6 text-mauve-700 dark:text-mauve-400">
              <li>1 date plan a week</li>
              <li>Booking and day-of reminders</li>
              <li>Nothing saved after the date</li>
            </ul>
            <ButtonLink href="/#text-us" size="lg" className="mt-6">
              Text me
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

        <p className="mt-8">
          <PlainButtonLink href="/quiz">Or take the 2-minute quiz</PlainButtonLink>
        </p>
      </Container>
    </section>
  )
}
