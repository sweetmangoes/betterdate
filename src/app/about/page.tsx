import type { Metadata } from 'next'

import { ButtonLink } from '@/components/elements/button'
import { Section } from '@/components/elements/section'
import { CallToActionSimpleCentered } from '@/components/sections/call-to-action-simple-centered'
import { HeroSimpleCentered } from '@/components/sections/hero-simple-centered'
import { getProduct } from '@/lib/product'

const product = getProduct()
const about = product.about

export const metadata: Metadata = {
  title: 'About',
  description: product.aboutPageDescription,
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: `About — ${product.name}`,
    description: product.aboutPageDescription,
    url: '/about',
  },
}

export default function Page() {
  return (
    <>
      <HeroSimpleCentered
        id="hero"
        eyebrow={<p className="text-sm/7 font-medium text-rose-700 dark:text-rose-300">{about.eyebrow}</p>}
        headline={about.headline}
        subheadline={<p>{about.subheadline}</p>}
        className="pt-12 pb-8 sm:pt-16"
      />

      <Section
        id="mission"
        eyebrow={about.missionEyebrow}
        headline={about.missionHeadline}
        subheadline={<p>{about.missionSubheadline}</p>}
      >
        <div className="max-w-2xl space-y-4 text-sm/7 text-mauve-700 dark:text-mauve-400">
          <p>{about.missionBody}</p>
        </div>
      </Section>

      <Section
        id="vision"
        eyebrow={about.visionEyebrow}
        headline={about.visionHeadline}
        subheadline={<p>{about.visionSubheadline}</p>}
      >
        <div className="max-w-2xl space-y-4 text-sm/7 text-mauve-700 dark:text-mauve-400">
          <p>{about.visionBody}</p>
        </div>
      </Section>

      <CallToActionSimpleCentered
        id="cta"
        headline={about.ctaHeadline}
        subheadline={<p>{about.ctaSubheadline}</p>}
        cta={
          <ButtonLink href="/quiz" size="lg">
            {about.ctaButton}
          </ButtonLink>
        }
      />
    </>
  )
}
