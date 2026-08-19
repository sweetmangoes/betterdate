import type { Metadata } from 'next'

import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { ArrowNarrowRightIcon } from '@/components/icons/arrow-narrow-right-icon'
import { HeartPulseIcon } from '@/components/icons/heart-pulse-icon'
import { MapPinIcon } from '@/components/icons/map-pin-icon'
import { SparklesIcon } from '@/components/icons/sparkles-icon'
import { CallToActionSimpleCentered } from '@/components/sections/call-to-action-simple-centered'
import { Feature, FeaturesThreeColumn } from '@/components/sections/features-three-column'
import { HeroSimpleCentered } from '@/components/sections/hero-simple-centered'
import { Section } from '@/components/elements/section'
import { getProduct } from '@/lib/product'
import { defaultDescription } from '@/lib/site'

const product = getProduct()
const landing = product.landing
const stepIcons = [<HeartPulseIcon key="vibe" />, <SparklesIcon key="plan" />, <MapPinIcon key="go" />]

export const metadata: Metadata = {
  title: {
    absolute: product.titleDefault,
  },
  description: defaultDescription,
  alternates: {
    canonical: '/',
  },
}

export default function Page() {
  return (
    <>
      <section className="relative overflow-hidden pt-10 pb-8 sm:pt-16">
        <HeroSimpleCentered
          id="hero"
          eyebrow={
            <p className="font-display text-2xl tracking-tight text-rose-700 sm:text-3xl dark:text-rose-300">
              {landing.eyebrow}
            </p>
          }
          headline={landing.headline}
          subheadline={<p>{landing.subheadline}</p>}
          cta={
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="/quiz" size="lg">
                Start the quiz
              </ButtonLink>
              <PlainButtonLink href="#how-it-works" size="lg">
                See how it works <ArrowNarrowRightIcon />
              </PlainButtonLink>
            </div>
          }
          className="pt-8 pb-20 sm:pb-28"
        />
      </section>

      <FeaturesThreeColumn
        id="how-it-works"
        eyebrow={landing.howEyebrow}
        headline={landing.howHeadline}
        subheadline={landing.howSubheadline}
        features={
          <>
            {landing.steps.map((step, index) => (
              <Feature
                key={step.headline}
                icon={stepIcons[index]}
                headline={step.headline}
                subheadline={<p>{step.subheadline}</p>}
              />
            ))}
          </>
        }
      />

      <Section
        id="who"
        eyebrow={landing.whoEyebrow}
        headline={landing.whoHeadline}
        subheadline={landing.whoSubheadline}
      >
        <div className="grid gap-12 sm:grid-cols-2">
          {landing.whoItems.map((item) => (
            <div key={item.headline} className="flex flex-col gap-3">
              <h3 className="font-display text-2xl tracking-tight text-mauve-950 dark:text-white">{item.headline}</h3>
              <p className="text-sm/7 text-mauve-700 dark:text-mauve-400">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CallToActionSimpleCentered
        id="cta"
        headline={landing.ctaHeadline}
        subheadline={<p>{landing.ctaSubheadline}</p>}
        cta={
          <ButtonLink href="/quiz" size="lg">
            {landing.ctaButton}
          </ButtonLink>
        }
      />
    </>
  )
}
