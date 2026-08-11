import type { Metadata } from 'next'

import { ButtonLink } from '@/components/elements/button'
import { Section } from '@/components/elements/section'
import { CallToActionSimpleCentered } from '@/components/sections/call-to-action-simple-centered'
import { HeroSimpleCentered } from '@/components/sections/hero-simple-centered'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Better Date’s mission is to eliminate bad dates by helping plan thoughtful, intentional dates from your preferences. Our vision is a world without bad dates.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About — Better Date',
    description:
      'Better Date’s mission is to eliminate bad dates by helping plan thoughtful, intentional dates from your preferences.',
    url: '/about',
  },
}

export default function Page() {
  return (
    <>
      <HeroSimpleCentered
        id="hero"
        eyebrow={
          <p className="text-sm/7 font-medium text-rose-700 dark:text-rose-300">About Better Date</p>
        }
        headline="A world without bad dates."
        subheadline={
          <p>
            That’s our vision. We’re building Better Date so first dates and couples spend less time guessing — and more
            time actually connecting.
          </p>
        }
        className="pt-12 pb-8 sm:pt-16"
      />

      <Section
        id="mission"
        eyebrow="Mission"
        headline="Eliminate bad dates"
        subheadline={
          <p>
            We help people plan thoughtful and intentional dates based on their preferences — who they’re with, where
            they are, what they want the night to feel like, and what to avoid. Preferences in. A clear local plan out.
          </p>
        }
      >
        <div className="max-w-2xl space-y-4 text-sm/7 text-mauve-700 dark:text-mauve-400">
          <p>
            Bad dates aren’t usually about the people. They’re about mismatched energy, nowhere good to go, or defaulting
            to whatever’s easiest. Better Date exists to take that friction away.
          </p>
        </div>
      </Section>

      <Section
        id="vision"
        eyebrow="Vision"
        headline="A world without bad dates"
        subheadline={
          <p>
            Not a promise that every night will be perfect — a commitment to make intentional planning the default, so
            fewer evenings go to waste.
          </p>
        }
      >
        <div className="max-w-2xl space-y-4 text-sm/7 text-mauve-700 dark:text-mauve-400">
          <p>
            Whether it’s date one or date one hundred, the bar is the same: a plan that fits you, in your city, that you
            can actually follow through on.
          </p>
        </div>
      </Section>

      <CallToActionSimpleCentered
        id="cta"
        headline="Ready to plan better?"
        subheadline={<p>Take the quiz and get a thoughtful local date plan in minutes.</p>}
        cta={
          <ButtonLink href="/quiz" size="lg">
            Start the quiz
          </ButtonLink>
        }
      />
    </>
  )
}
