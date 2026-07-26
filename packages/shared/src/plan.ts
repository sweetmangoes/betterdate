import { z } from 'zod'

import type { QuizAnswers } from './quiz'

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
  stops: z.array(datePlanStopSchema).min(2).max(5),
  conversationStarters: z.array(z.string()).min(2).max(5),
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
    .min(2)
    .max(5),
  conversationStarters: z.array(z.string()).min(2).max(5),
  backupIdea: z.string(),
  disclaimer: z.string(),
})

export type GroundedPlanDraft = z.infer<typeof groundedPlanDraftSchema>

export type PlanCandidate = {
  id: string
  name: string
  address: string
  neighborhood: string
  rating?: number
  priceLevel?: string
  mapsUrl: string
  primaryType?: string
}

export function buildPlanPrompt(answers: QuizAnswers, candidates?: PlanCandidate[]): string {
  const audienceLabel = answers.audience === 'first_date' ? 'a first date' : 'an established couple'
  const vibeList = answers.vibes.join(', ')
  const constraints = answers.constraints?.trim() || 'None noted'

  if (candidates && candidates.length > 0) {
    const list = candidates
      .map((place, index) => {
        const rating = place.rating != null ? `rating ${place.rating}` : 'no rating'
        const price = place.priceLevel ? `, ${place.priceLevel}` : ''
        const type = place.primaryType ?? 'place'
        return `${index + 1}. id=${place.id} | ${place.name} | ${place.address} | ${type} | ${rating}${price}`
      })
      .join('\n')

    return `You are Better Date, an expert local date planner.

Plan ${audienceLabel} in or near: ${answers.location}.

Preferences:
- Occasion: ${answers.occasion}
- Budget: ${answers.budget}
- Time of day: ${answers.time}
- Energy: ${answers.energy}
- Vibes: ${vibeList}
- Constraints: ${constraints}

You MUST build the itinerary using ONLY venues from this candidate list. Copy each stop's placeId exactly.
Do not invent venues, names, or placeIds.

CANDIDATES:
${list}

Rules:
- Choose 3–4 stops with distinct placeIds from the list above.
- Prefer a walkable sequence in a sensible order for the chosen time of day.
- Match budget and energy. For first dates, keep it low-pressure. For couples, make it intentional.
- Do not invent confirmation of reservations, hours, or live availability.
- Include conversation starters (especially strong ones for first dates).
- Include one backup idea (can reference another candidate id in the text, or a weather-friendly pivot).
- Set disclaimer to remind the user to verify hours/reservations; venues come from Google Places and should be double-checked.
- Keep copy warm, specific, and concise.`
  }

  return `You are Better Date, an expert local date planner.

Plan ${audienceLabel} in or near: ${answers.location}.

Preferences:
- Occasion: ${answers.occasion}
- Budget: ${answers.budget}
- Time of day: ${answers.time}
- Energy: ${answers.energy}
- Vibes: ${vibeList}
- Constraints: ${constraints}

Rules:
- Suggest 3–4 real-feeling named places (restaurants, cafes, parks, museums, bars, walks) that fit the location.
- Prefer a walkable sequence in a sensible order for the chosen time of day.
- Match budget and energy. For first dates, keep it low-pressure with easy conversation. For couples, make it intentional and thoughtful.
- Do not invent confirmation of reservations, hours, or live availability.
- Include conversation starters (especially strong ones for first dates).
- Include one backup idea if weather or crowds get in the way.
- Set disclaimer to remind the user to verify hours, reservations, and that venue suggestions are AI-generated.
- Keep copy warm, specific, and concise — no generic filler.`
}

export const PLAN_SYSTEM_PROMPT =
  'You plan thoughtful local dates. Return only structured data that matches the schema. When candidates are provided, only use those placeIds. Never claim you have booked anything.'

export const GROUNDED_PLAN_SYSTEM_PROMPT =
  'You plan thoughtful local dates using only the provided Google Places candidates. Every stop must use a real placeId from the list. Never invent venues.'
