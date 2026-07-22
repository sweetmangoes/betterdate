import { z } from 'zod'

import type { QuizAnswers } from './quiz'

export const datePlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  estimatedCost: z.string(),
  duration: z.string(),
  stops: z
    .array(
      z.object({
        order: z.number().int().positive(),
        name: z.string(),
        neighborhood: z.string(),
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

export type DatePlan = z.infer<typeof datePlanSchema>

export function buildPlanPrompt(answers: QuizAnswers): string {
  const audienceLabel = answers.audience === 'first_date' ? 'a first date' : 'an established couple'
  const vibeList = answers.vibes.join(', ')
  const constraints = answers.constraints?.trim() || 'None noted'

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
  'You plan thoughtful local dates. Return only structured data that matches the schema. Prefer well-known or plausible neighborhood venues for the given city. Never claim you have booked anything.'
