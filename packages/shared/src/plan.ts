import { z } from 'zod'

import type { PlanCandidate } from './candidates'
import { getProduct, getProductForAnswers } from './product'
import type { PlanQuizAnswers } from './quiz'

export type { PlanCandidate } from './candidates'

export const datePlanStopSchema = z.object({
  order: z.number().int().positive(),
  name: z.string(),
  neighborhood: z.string(),
  category: z.enum(['food', 'drink', 'activity', 'walk', 'dessert']),
  timeHint: z.string(),
  whyItFits: z.string(),
  tip: z.string(),
  placeId: z.string().optional(),
  address: z.string().optional(),
  mapsUrl: z.string().optional(),
  rating: z.number().optional(),
})

export const datePlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  estimatedCost: z.string(),
  duration: z.string(),
  stops: z.array(datePlanStopSchema).min(1).max(5),
  conversationStarters: z.array(z.string()).max(5).default([]),
  backupIdea: z.string(),
  disclaimer: z.string(),
})

export type DatePlan = z.infer<typeof datePlanSchema>
export type DatePlanStop = z.infer<typeof datePlanStopSchema>

/** LLM output when grounding with Google Places — picks venues by placeId only. */
export const groundedPlanDraftSchema = z.object({
  title: z.string(),
  summary: z.string(),
  estimatedCost: z.string(),
  duration: z.string(),
  stops: z
    .array(
      z.object({
        order: z.number().int().positive(),
        placeId: z.string(),
        category: z.enum(['food', 'drink', 'activity', 'walk', 'dessert']),
        timeHint: z.string(),
        whyItFits: z.string(),
        tip: z.string(),
      }),
    )
    .min(1)
    .max(5),
  conversationStarters: z.array(z.string()).max(5).default([]),
  backupIdea: z.string(),
  disclaimer: z.string(),
})

export type GroundedPlanDraft = z.infer<typeof groundedPlanDraftSchema>

export function buildPlanPrompt(answers: PlanQuizAnswers, candidates?: PlanCandidate[]): string {
  return getProductForAnswers(answers).buildPlanPrompt(answers, candidates)
}

export function getPlanSystemPrompt() {
  return getProduct().planSystemPrompt
}

export function getGroundedPlanSystemPrompt() {
  return getProduct().groundedPlanSystemPrompt
}

/** @deprecated Use getPlanSystemPrompt() — kept for Date default. */
export const PLAN_SYSTEM_PROMPT =
  'You plan thoughtful local dates. Return only structured data that matches the schema. When candidates are provided, only use those placeIds. Never claim you have booked anything.'

/** @deprecated Use getGroundedPlanSystemPrompt() — kept for Date default. */
export const GROUNDED_PLAN_SYSTEM_PROMPT =
  'You plan thoughtful local dates using only the provided Google Places candidates. Every stop must use a real placeId from the list. Never invent venues. Never put placeIds in user-facing copy — use venue names only.'

