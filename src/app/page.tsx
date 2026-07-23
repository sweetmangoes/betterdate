import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { ArrowNarrowRightIcon } from '@/components/icons/arrow-narrow-right-icon'
import { HeartPulseIcon } from '@/components/icons/heart-pulse-icon'
import { MapPinIcon } from '@/components/icons/map-pin-icon'
import { SparklesIcon } from '@/components/icons/sparkles-icon'
import { CallToActionSimpleCentered } from '@/components/sections/call-to-action-simple-centered'
import { Feature, FeaturesThreeColumn } from '@/components/sections/features-three-column'
import { HeroSimpleCentered } from '@/components/sections/hero-simple-centered'
import { Section } from '@/components/elements/section'

export default function Page() {
  return (
    <>
      <section className="relative overflow-hidden pt-10 pb-8 sm:pt-16">
        <HeroSimpleCentered
          id="hero"
          eyebrow={
            <p className="font-display text-2xl tracking-tight text-rose-700 sm:text-3xl dark:text-rose-300">
              Better Date
            </p>
          }
          headline="Intentional dates, planned for where you are."
          subheadline={
            <p>
              Our mission is to eliminate bad dates by helping you plan thoughtful, intentional nights from your
              preferences — toward a world without bad dates.
            </p>
          }
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
        eyebrow="How it works"
        headline="Three steps to a better date"
        subheadline="No accounts. No endless scrolling. Just preferences in, a local plan out."
        features={
          <>
            <Feature
              icon={<HeartPulseIcon />}
              headline="1. Tell us the vibe"
              subheadline={
                <p>
                  A quick quiz covers audience, city, budget, energy, and constraints so the plan actually fits you.
                </p>
              }
            />
            <Feature
              icon={<SparklesIcon />}
              headline="2. AI plans the night"
              subheadline={
                <p>We turn your answers into a multi-stop itinerary with named places in your neighborhood.</p>
              }
            />
            <Feature
              icon={<MapPinIcon />}
              headline="3. Show up ready"
              subheadline={
                <p>Get timing tips, conversation starters, and a backup idea — then verify hours and go.</p>
              }
            />
          </>
        }
      />

      <Section
        id="who"
        eyebrow="Who it’s for"
        headline="Whether it’s date one or date one hundred"
        subheadline="Same tool, different tone — dialed to the moment you’re in."
      >
        <div className="grid gap-12 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-2xl tracking-tight text-mauve-950 dark:text-white">First dates</h3>
            <p className="text-sm/7 text-mauve-700 dark:text-mauve-400">
              Low-pressure plans with easy conversation, clear pacing, and venues that make a good first impression —
              without overthinking the logistics.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-2xl tracking-tight text-mauve-950 dark:text-white">Couples</h3>
            <p className="text-sm/7 text-mauve-700 dark:text-mauve-400">
              Bring intentional date nights back. Match energy and budget to something that feels special — not like
              another default dinner reservation.
            </p>
          </div>
        </div>
      </Section>

      <CallToActionSimpleCentered
        id="cta"
        headline="Ready when you are"
        subheadline={<p>Eight questions. One local plan. About five minutes.</p>}
        cta={
          <ButtonLink href="/quiz" size="lg">
            Plan a date
          </ButtonLink>
        }
      />
    </>
  )
}
