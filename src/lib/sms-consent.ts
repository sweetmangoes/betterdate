/**
 * Shown under the phone form and stored with each signup. Carriers review this wording during
 * SMS registration, so change it here only (the form and the database both read this constant).
 */
export const SMS_CONSENT_TEXT =
  'By tapping “Text me” you agree to get recurring messages from Better Date about your date plans. Up to 10 msgs/week. Msg & data rates may apply. Reply STOP to cancel, HELP for help. Consent is not a condition of purchase.'

/** Normalizes North American input like "(613) 555-0142" or "+1 613 555 0142" to E.164. */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim()
  const digits = trimmed.replace(/\D/g, '')

  if (trimmed.startsWith('+')) {
    return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null
  }
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

/** "+16135550142" → "(613) 555-0142"; other numbers are returned as-is. */
export function formatPhone(e164: string): string {
  const match = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164)
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : e164
}
