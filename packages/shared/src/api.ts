import { z } from 'zod'

import { datePlanSchema } from './plan'
import { getProduct } from './product'
import { dateQuizAnswersSchema, friendsQuizAnswersSchema } from './quiz'

/** Successful `/api/plan` JSON body — shared by web + mobile clients. */
export const planApiSuccessSchema = z.object({
  plan: datePlanSchema,
  answers: z.union([dateQuizAnswersSchema, friendsQuizAnswersSchema]).optional(),
  grounded: z.boolean().optional(),
  /** Set when the plan was saved and can be opened at `/p/[planId]`. */
  planId: z.string().optional(),
  /** Sequential “you’re date #N” after a successful generate. */
  dateNumber: z.number().int().positive().optional(),
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
  const product = getProduct()

  if (!statusOk) {
    const error = planApiErrorSchema.safeParse(body)
    throw new Error(error.success ? error.data.error : product.errorCouldNotGenerate)
  }

  const success = planApiSuccessSchema.safeParse(body)
  if (!success.success) {
    throw new Error(product.errorInvalidPlan)
  }

  return success.data
}
