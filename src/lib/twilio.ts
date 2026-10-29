import { createHmac, timingSafeEqual } from 'node:crypto'

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() && process.env.TWILIO_AUTH_TOKEN?.trim() && process.env.TWILIO_PHONE_NUMBER?.trim(),
  )
}

export function getTwilioPhoneNumber(): string | null {
  return process.env.TWILIO_PHONE_NUMBER?.trim() || null
}

/** Public URL Twilio actually requested (works behind ngrok / Vercel). */
export function twilioWebhookUrl(request: Request): string {
  const url = new URL(request.url)
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? url.host
  const proto = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '')
  return `${proto}://${host}${url.pathname}`
}

/** https://www.twilio.com/docs/usage/security#validating-requests */
export function isValidTwilioSignature(url: string, params: Record<string, string>, signature: string | null): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN?.trim()
  if (!token || !signature) return false

  const data = url + Object.keys(params).sort().map((key) => key + params[key]).join('')
  const expected = createHmac('sha1', token).update(data, 'utf8').digest('base64')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function twimlEmpty(): Response {
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
}

export function twimlMessage(body: string): Response {
  const escaped = body
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`, {
    headers: { 'Content-Type': 'text/xml' },
  })
}

/** Closest trial template to a date plan. Custom bodies need an upgraded Twilio account. */
export const TWILIO_TRIAL_TEMPLATE = 'sms_appointment_reminders'

export function twilioUserMessage(error: unknown): string {
  const code = error instanceof TwilioSendError ? error.code : undefined
  if (code === 21608 || code === 14111) {
    return 'We’re in testing, so we can only text numbers you’ve verified in Twilio. Add yours under Verified Caller IDs, then try again.'
  }
  if (code === 21610) {
    return 'That number is unsubscribed. Reply START to the last text, then try again.'
  }
  if (code === 572006) {
    return 'Twilio’s trial can only send their sample texts, not our date-plan wording. Upgrade the Twilio account to send the real message.'
  }
  return 'We couldn’t text that number. Check it and try again.'
}

export class TwilioSendError extends Error {
  constructor(
    message: string,
    readonly code?: number,
  ) {
    super(message)
  }
}

export type SendSmsResult = { sid: string; usedTrialTemplate: boolean }

async function createMessage(to: string, body: string): Promise<{ sid: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim()
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim()
  const from = getTwilioPhoneNumber()
  if (!accountSid || !authToken || !from) {
    throw new TwilioSendError('Twilio is not configured.')
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  })

  const data = (await response.json().catch(() => ({}))) as { sid?: string; code?: number | string; message?: string }
  if (!response.ok || !data.sid) {
    const code = typeof data.code === 'string' ? Number(data.code) : data.code
    throw new TwilioSendError(data.message ?? `Twilio request failed (${response.status}).`, Number.isFinite(code) ? code : undefined)
  }
  return { sid: data.sid }
}

/** Sends one SMS. On a Twilio trial, custom copy is blocked so we retry with their appointment-reminder template. */
export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  try {
    const { sid } = await createMessage(to, body)
    return { sid, usedTrialTemplate: false }
  } catch (error) {
    if (error instanceof TwilioSendError && error.code === 572006) {
      const { sid } = await createMessage(to, TWILIO_TRIAL_TEMPLATE)
      console.warn(`Twilio trial blocked custom SMS. Sent ${TWILIO_TRIAL_TEMPLATE} instead.`)
      return { sid, usedTrialTemplate: true }
    }
    throw error
  }
}
