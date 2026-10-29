import { getProduct } from '@betterdate/shared'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { normalizePhone, SMS_CONSENT_TEXT } from '@/lib/sms-consent'
import { getAdminSupabaseClient } from '@/lib/supabase/admin'
import { isTwilioConfigured, sendSms, TwilioSendError } from '@/lib/twilio'

export const runtime = 'nodejs'

const WELCOME_MESSAGE =
  'Hey, it’s Better Date 👋 Thanks for signing up. I’ll help you plan dates with real places near you.\n\nWho’s the date with, someone new or someone you’ve been seeing? And when?\n\nUp to 10 msgs/week. Reply STOP to cancel, HELP for help.'

/** Don't re-send the welcome text to the same number more than once a day. */
const WELCOME_COOLDOWN_MS = 24 * 60 * 60 * 1000

const bodySchema = z.object({
  phone: z.string().min(7).max(25),
  consent: z.literal(true),
})

export async function POST(request: Request) {
  const product = getProduct()
  if (product.id !== 'date') {
    return NextResponse.json({ error: 'Texting isn’t available for this product yet.' }, { status: 404 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter your phone number and agree to get texts.' }, { status: 400 })
  }

  const phone = normalizePhone(parsed.data.phone)
  if (!phone) {
    return NextResponse.json({ error: 'That doesn’t look like a valid phone number.' }, { status: 400 })
  }

  const supabase = getAdminSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Texting isn’t set up yet. Try the quiz for now.' }, { status: 503 })
  }

  const { data: existing } = await supabase
    .from('sms_contacts')
    .select('welcome_sent_at')
    .eq('phone', phone)
    .eq('product', product.id)
    .maybeSingle()

  const { error: upsertError } = await supabase.from('sms_contacts').upsert({
    phone,
    product: product.id,
    channel: 'sms',
    consent_text: SMS_CONSENT_TEXT,
    consented_at: new Date().toISOString(),
    opted_out_at: null,
  })
  if (upsertError) {
    console.error('Failed to save SMS contact', upsertError)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  if (!isTwilioConfigured()) {
    return NextResponse.json({ ok: true, texted: false })
  }

  const lastWelcome = existing?.welcome_sent_at ? new Date(existing.welcome_sent_at).getTime() : 0
  if (Date.now() - lastWelcome < WELCOME_COOLDOWN_MS) {
    return NextResponse.json({ ok: true, texted: true })
  }

  try {
    await sendSms(phone, WELCOME_MESSAGE)
  } catch (error) {
    console.error('Failed to send welcome SMS', error)
    // 21608: Twilio trial accounts can only text verified numbers.
    const message =
      error instanceof TwilioSendError && error.code === 21608
        ? 'We’re in testing, so we can only text approved numbers right now.'
        : 'We couldn’t text that number. Check it and try again.'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  await supabase
    .from('sms_contacts')
    .update({ welcome_sent_at: new Date().toISOString() })
    .eq('phone', phone)
    .eq('product', product.id)

  return NextResponse.json({ ok: true, texted: true })
}
