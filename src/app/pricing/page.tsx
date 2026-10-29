import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PlainButtonLink } from '@/components/elements/button'
import { Container } from '@/components/elements/container'
import { Heading } from '@/components/elements/heading'
import { Text } from '@/components/elements/text'
import { DatePricingCards } from '@/components/sections/date-pricing'
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
        <Heading className="mt-2">Start free. Upgrade later if you want.</Heading>
        <Text size="lg" className="mt-5 max-w-2xl">
          Free is enough to try a real plan. Pro will remember what you’ve already done — it isn’t for sale yet.
        </Text>
        <DatePricingCards />
        <p className="mt-8">
          <PlainButtonLink href="/quiz">Or take the 2-minute quiz</PlainButtonLink>
        </p>
      </Container>
    </section>
  )
}
