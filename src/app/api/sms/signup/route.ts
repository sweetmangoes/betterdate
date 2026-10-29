import { getProduct } from '@betterdate/shared'
import { after } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { NEED_AREA_REPLY, sendPlanFromText, welcomeSms } from '@/lib/sms-agent'
import { extractLocation } from '@/lib/sms-from-text'
import { normalizePhone, SMS_CONSENT_TEXT } from '@/lib/sms-consent'
import { getAdminSupabaseClient } from '@/lib/supabase/admin'
import { isTwilioConfigured, sendSms, twilioUserMessage } from '@/lib/twilio'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Don't re-send the welcome text to the same number more than once a day. */
const WELCOME_COOLDOWN_MS = 24 * 60 * 60 * 1000

const bodySchema = z.object({
  phone: z.string().min(7).max(25),
  consent: z.literal(true),
  firstMessage: z.string().trim().max(280).optional(),
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

  const firstMessage = parsed.data.firstMessage?.trim() || null
  const area = firstMessage ? extractLocation(firstMessage) : null

  const supabase = getAdminSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Texting isn’t set up yet. Add SUPABASE_SERVICE_ROLE_KEY, then try again.' }, { status: 503 })
  }

  const { data: existing } = await supabase
    .from('sms_contacts')
    .select('welcome_sent_at')
    .eq('phone', phone)
    .eq('product', product.id)
    .maybeSingle()

  const row = {
    phone,
    product: product.id,
    channel: 'sms' as const,
    consent_text: SMS_CONSENT_TEXT,
    consented_at: new Date().toISOString(),
    opted_out_at: null as string | null,
    first_message: firstMessage,
    area,
  }

  let { error: upsertError } = await supabase.from('sms_contacts').upsert(row)
  if (upsertError) {
    const retry = await supabase.from('sms_contacts').upsert({
      phone: row.phone,
      product: row.product,
      channel: row.channel,
      consent_text: row.consent_text,
      consented_at: row.consented_at,
      opted_out_at: row.opted_out_at,
    })
    upsertError = retry.error
  }
  if (upsertError) {
    console.error('Failed to save SMS contact', upsertError)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  if (!isTwilioConfigured()) {
    return NextResponse.json({ ok: true, texted: false })
  }

  const lastWelcome = existing?.welcome_sent_at ? new Date(existing.welcome_sent_at).getTime() : 0
  const skipWelcome = Date.now() - lastWelcome < WELCOME_COOLDOWN_MS

  let usedTrialTemplate = false
  try {
    if (!skipWelcome) {
      const sent = await sendSms(phone, welcomeSms(firstMessage))
      usedTrialTemplate = sent.usedTrialTemplate
      await supabase.from('sms_contacts').update({ welcome_sent_at: new Date().toISOString() }).eq('phone', phone).eq('product', product.id)
    }
  } catch (error) {
    console.error('Failed to send welcome SMS', error)
    return NextResponse.json({ error: twilioUserMessage(error) }, { status: 502 })
  }

  // Trial templates can't carry a plan link. Skip generation until the Twilio account is upgraded.
  if (!usedTrialTemplate) {
    after(async () => {
      const result = await sendPlanFromText(phone, firstMessage ?? '', area)
      if (result === 'need_area' && !skipWelcome) {
        return
      }
      if (result === 'need_area') await sendSms(phone, NEED_AREA_REPLY)
      if (result === 'failed') {
        await sendSms(phone, 'I couldn’t build that plan yet. Reply with a neighborhood, or take the quiz on the site.')
      }
    })
  }

  return NextResponse.json({ ok: true, texted: true, trialTemplate: usedTrialTemplate })
}
