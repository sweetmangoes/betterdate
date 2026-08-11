import { z } from 'zod'

import { datePlanSchema } from './plan'
import { quizAnswersSchema } from './quiz'

/** Successful `/api/plan` JSON body — shared by web + mobile clients. */
export const planApiSuccessSchema = z.object({
  plan: datePlanSchema,
  answers: quizAnswersSchema.optional(),
  grounded: z.boolean().optional(),
})

export const planApiErrorSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
})

export type PlanApiSuccess = z.infer<typeof planApiSuccessSchema>
export type PlanApiError = z.infer<typeof planApiErrorSchema>

/**
 * Parse a `/api/plan` response body.
 * Throws with the API error message when the request failed or the body is invalid.
 */
export function parsePlanApiResponse(statusOk: boolean, body: unknown) {
  if (!statusOk) {
    const error = planApiErrorSchema.safeParse(body)
    throw new Error(error.success ? error.data.error : 'Could not generate a date plan.')
  }

  const success = planApiSuccessSchema.safeParse(body)
  if (!success.success) {
    throw new Error('Received an invalid date plan from the server.')
  }

  return success.data
}
