import { getProduct } from '@betterdate/shared'
import { after } from 'next/server'

import { getSiteUrl } from '@/lib/site'

import {
  HELP_REPLY,
  isHelpCommand,
  isStartCommand,
  isStopCommand,
  NEED_AREA_REPLY,
  sendPlanFromText,
  START_REPLY,
  STOP_REPLY,
} from '@/lib/sms-agent'
import { extractLocation } from '@/lib/sms-from-text'
import { getAdminSupabaseClient } from '@/lib/supabase/admin'
import { isValidTwilioSignature, sendSms, twilioWebhookUrl, twimlEmpty, twimlMessage } from '@/lib/twilio'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  const product = getProduct()
  if (product.id !== 'date') return twimlEmpty()

  const form = await request.formData()
  const params: Record<string, string> = {}
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') params[key] = value
  }

  if (!isValidTwilioSignature(twilioWebhookUrl(request), params, request.headers.get('x-twilio-signature'))) {
    return new Response('Forbidden', { status: 403 })
  }

  const from = params.From?.trim()
  const body = params.Body?.trim() ?? ''
  if (!from) return twimlEmpty()

  const supabase = getAdminSupabaseClient()
  if (!supabase) return twimlMessage('Texting isn’t fully set up yet. Try betterdate.app/quiz')

  if (isStopCommand(body)) {
    await supabase.from('sms_contacts').update({ opted_out_at: new Date().toISOString() }).eq('phone', from).eq('product', product.id)
    return twimlMessage(STOP_REPLY)
  }

  if (isHelpCommand(body)) return twimlMessage(HELP_REPLY)

  const { data: contact } = await supabase
    .from('sms_contacts')
    .select('phone, opted_out_at, first_message, area')
    .eq('phone', from)
    .eq('product', product.id)
    .maybeSingle()

  if (isStartCommand(body)) {
    await supabase.from('sms_contacts').upsert({
      phone: from,
      product: product.id,
      channel: 'sms',
      consent_text: 'Replied START',
      consented_at: new Date().toISOString(),
      opted_out_at: null,
    })
    return twimlMessage(START_REPLY)
  }

  if (!contact || contact.opted_out_at) {
    return twimlMessage(`Hey, it’s Better Date. Sign up at ${getSiteUrl()} first so I can text you a plan.`)
  }

  const area = extractLocation(body) ?? contact.area ?? null
  const combined = [contact.first_message, body].filter(Boolean).join('\n')

  await supabase
    .from('sms_contacts')
    .update({ area, last_inbound_at: new Date().toISOString() })
    .eq('phone', from)
    .eq('product', product.id)

  after(async () => {
    const result = await sendPlanFromText(from, combined, area)
    if (result === 'need_area') await sendSms(from, NEED_AREA_REPLY)
    if (result === 'failed') {
      await sendSms(from, 'I couldn’t build that plan. Reply with a neighborhood, or try the 2-minute quiz on the site.')
    }
  })

  return twimlMessage('On it — I’ll text a plan in a minute.')
}
