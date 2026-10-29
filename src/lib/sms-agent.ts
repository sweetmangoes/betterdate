import { getProduct, type DateQuizAnswers } from '@betterdate/shared'

import { generatePlan } from '@/lib/generate-plan'
import { savePlan } from '@/lib/plans-db'
import { getSiteUrl } from '@/lib/site'
import { answersFromSmsText } from '@/lib/sms-from-text'
import { sendSms } from '@/lib/twilio'

export const HELP_REPLY =
  'Better Date plans last-minute dates by text. Up to 10 msgs/week. Msg & data rates may apply. Reply STOP to cancel.'

export const STOP_REPLY = 'You’re unsubscribed from Better Date. Reply START if you want texts again.'

export const START_REPLY = 'You’re back on. Tell me the vibe and a neighborhood — I’ll text a plan you can book.'

export const NEED_AREA_REPLY = 'Which neighborhood or city should I plan in? Yours, theirs, or where to meet is enough.'

export function isStopCommand(body: string) {
  return /^(stop|stopall|unsubscribe|cancel|end|quit)$/i.test(body.trim())
}

export function isStartCommand(body: string) {
  return /^(start|yes|unstop)$/i.test(body.trim())
}

export function isHelpCommand(body: string) {
  return /^(help|info)$/i.test(body.trim())
}

export function welcomeSms(firstMessage?: string | null) {
  if (firstMessage?.trim()) {
    return `Hey, it’s Better Date. Got it: “${firstMessage.trim()}”.\n\nIf I have a neighborhood I’ll send a plan in a minute. If not, reply with one.\n\nUp to 10 msgs/week. Reply STOP to cancel, HELP for help.`
  }
  return `Hey, it’s Better Date. Last-minute date? Reply with the vibe and a neighborhood — I’ll text a plan you can book.\n\nUp to 10 msgs/week. Reply STOP to cancel, HELP for help.`
}

export function formatPlanSms(title: string, planId: string) {
  const url = `${getSiteUrl()}/p/${planId}`
  return `Here’s the plan: ${title}\n\n${url}\n\nReserve the first stop if you can. Reply if you want it cheaper, later, or somewhere else.`
}

export async function sendPlanFromText(phone: string, text: string, area?: string | null): Promise<'sent' | 'need_area' | 'failed'> {
  const answers: DateQuizAnswers | null = answersFromSmsText(text, area)
  if (!answers) return 'need_area'

  try {
    const { plan } = await generatePlan(answers)
    const saved = await savePlan({ product: getProduct().id, plan, answers })
    if (!saved?.id) {
      await sendSms(phone, `Here’s a sketch: ${plan.title}. I couldn’t save a link — try the quiz at ${getSiteUrl()}/quiz`)
      return 'sent'
    }
    await sendSms(phone, formatPlanSms(plan.title, saved.id))
    return 'sent'
  } catch (error) {
    console.error('Failed to generate SMS plan', error)
    return 'failed'
  }
}
