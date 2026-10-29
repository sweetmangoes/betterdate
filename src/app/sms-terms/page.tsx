import type { Metadata } from 'next'
import Link from 'next/link'

import { DocumentCentered } from '@/components/sections/document-centered'
import { SMS_CONSENT_TEXT } from '@/lib/sms-consent'

export const metadata: Metadata = {
  title: 'SMS Terms',
  description: 'How Better Date text messaging works, how often we text, and how to stop.',
  alternates: { canonical: '/sms-terms' },
}

export default function Page() {
  return (
    <DocumentCentered id="document" headline="SMS Terms" subheadline={<p>Last updated on October 28, 2026.</p>}>
      <h2>What you’re signing up for</h2>
      <p>
        Better Date texts you to help plan dates: questions about what you’re looking for, links to your date plans,
        booking and day-of reminders, and a check-in after the date. You only get texts after you enter your number on
        our website and agree to receive them.
      </p>
      <h2>How often</h2>
      <p>Message frequency varies with how much you’re planning, and is up to 10 messages per week.</p>
      <h2>Cost</h2>
      <p>Better Date doesn’t charge for texts. Message and data rates from your carrier may apply.</p>
      <h2>Stopping texts</h2>
      <p>
        Reply <strong>STOP</strong> at any time to stop receiving messages. You’ll get one message confirming you’ve
        been unsubscribed. Reply <strong>START</strong> to sign up again.
      </p>
      <h2>Help</h2>
      <p>
        Reply <strong>HELP</strong> for help, or email{' '}
        <Link href="mailto:hello@betterdate.app">hello@betterdate.app</Link>.
      </p>
      <h2>Your phone number</h2>
      <p>
        We use your number only to send you Better Date messages. We don’t sell it or share it with third parties for
        their marketing. See our <Link href="/privacy-policy">Privacy Policy</Link> for details.
      </p>
      <h2>Consent wording</h2>
      <p>This is the exact wording shown when you sign up:</p>
      <blockquote>{SMS_CONSENT_TEXT}</blockquote>
      <p>Carriers are not liable for delayed or undelivered messages.</p>
    </DocumentCentered>
  )
}
