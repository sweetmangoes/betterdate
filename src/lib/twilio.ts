export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() && process.env.TWILIO_AUTH_TOKEN?.trim() && process.env.TWILIO_PHONE_NUMBER?.trim(),
  )
}

export function getTwilioPhoneNumber(): string | null {
  return process.env.TWILIO_PHONE_NUMBER?.trim() || null
}

export class TwilioSendError extends Error {
  constructor(
    message: string,
    readonly code?: number,
  ) {
    super(message)
  }
}

/** Sends one SMS through the Twilio REST API. */
export async function sendSms(to: string, body: string): Promise<{ sid: string }> {
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

  const data = (await response.json().catch(() => ({}))) as { sid?: string; code?: number; message?: string }
  if (!response.ok || !data.sid) {
    throw new TwilioSendError(data.message ?? `Twilio request failed (${response.status}).`, data.code)
  }
  return { sid: data.sid }
}
