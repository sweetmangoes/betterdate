import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ButtonLink } from '@/components/elements/button'
import { Container } from '@/components/elements/container'
import { Heading } from '@/components/elements/heading'
import { Text } from '@/components/elements/text'
import { TextThread } from '@/components/elements/text-thread'
import { getProduct } from '@/lib/product'
import { formatPhone } from '@/lib/sms-consent'
import { getTwilioPhoneNumber } from '@/lib/twilio'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ waitlist?: string }>
}): Promise<Metadata> {
  const { waitlist } = await searchParams
  return {
    title: waitlist ? 'You’re on the list' : 'Check your phone',
    robots: { index: false, follow: false },
  }
}

const nextSteps = [
  ['Reply to the text', 'Who it’s with, when, and where you’re both coming from.'],
  ['Open your plan', 'A link with real places, a route, and a backup idea.'],
  ['Book and go', 'I’ll remind you. Reply STOP anytime to stop texts.'],
]

export default async function StartPage({ searchParams }: { searchParams: Promise<{ waitlist?: string }> }) {
  if (getProduct().id !== 'date') notFound()

  const { waitlist } = await searchParams
  const fromNumber = getTwilioPhoneNumber()

  if (waitlist || !fromNumber) {
    return (
      <section className="py-20 sm:py-28">
        <Container className="max-w-xl lg:max-w-xl">
          <p className="text-sm/7 font-semibold text-rose-700 dark:text-rose-300">You’re on the list</p>
          <Heading className="mt-2 text-4xl/11 sm:text-5xl/12">I’ll text you when it’s your turn.</Heading>
          <Text size="lg" className="mt-5">
            Your number is saved. Texting is opening in small batches — you don’t need to sign up again. You can still
            get a plan right now in the browser.
          </Text>
          <p className="mt-8">
            <ButtonLink href="/quiz" size="lg">
              Get a plan now — 2-minute quiz
            </ButtonLink>
          </p>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-14 sm:py-20">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="text-sm/7 font-semibold text-rose-700 dark:text-rose-300">You’re in</p>
          <Heading className="mt-2 text-5xl/12">Check your phone.</Heading>
          <Text size="lg" className="mt-5 max-w-lg">
            I just texted you from{' '}
            <a href={`sms:${fromNumber}`} className="font-semibold text-mauve-950 dark:text-white">
              {formatPhone(fromNumber)}
            </a>
            . Reply to start planning. Save the number so you’ll recognize us.
          </Text>
          <ol className="mt-8 max-w-lg">
            {nextSteps.map(([title, body], index) => (
              <li
                key={title}
                className="flex gap-3 border-b border-mauve-950/10 py-3.5 last:border-b-0 dark:border-white/10"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-rose-100 text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                  {index + 1}
                </span>
                <p className="text-sm/6 text-mauve-950 dark:text-white">
                  {title}
                  <span className="block text-mauve-600 dark:text-mauve-400">{body}</span>
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm/7 text-mauve-700 dark:text-mauve-400">
            Didn’t get it?{' '}
            <Link href="/#text-us" className="font-semibold text-rose-700 underline-offset-4 hover:underline dark:text-rose-300">
              Check your number
            </Link>{' '}
            or{' '}
            <Link href="/quiz" className="font-semibold text-rose-700 underline-offset-4 hover:underline dark:text-rose-300">
              take the quiz instead
            </Link>
            .
          </p>
        </div>
        <TextThread
          contactName="Better Date"
          className="max-lg:hidden"
          messages={[
            {
              from: 'ai',
              text: 'Hey, it’s Better Date 👋 Thanks for signing up. I’ll help you plan dates with real places near you.',
            },
            { from: 'ai', text: 'Who’s the date with, someone new or someone you’ve been seeing? And when?' },
            { from: 'ai', muted: true, text: 'Up to 10 msgs/week. Reply STOP to cancel, HELP for help.' },
          ]}
        />
      </Container>
    </section>
  )
}
