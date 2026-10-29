import {
  buildPlanPrompt,
  datePlanSchema,
  getGroundedPlanSystemPrompt,
  getPlanSystemPrompt,
  getProduct,
  groundedPlanDraftSchema,
  type DatePlan,
  type PlanQuizAnswers,
} from '@betterdate/shared'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'

import { enrichPlanFromCandidates } from '@/lib/enrich-plan'
import { findPlaceCandidates } from '@/lib/places'

/** A failure with a message that's safe to show the user. */
export class PlanGenerationError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

/**
 * Places-grounded plan when GOOGLE_MAPS_API_KEY is set, otherwise an AI-only plan.
 * Used by the web quiz (`/api/plan`) and, next, by the texting agent.
 */
export async function generatePlan(answers: PlanQuizAnswers): Promise<{ plan: DatePlan; grounded: boolean }> {
  const product = getProduct()

  if (!process.env.OPENAI_API_KEY) {
    throw new PlanGenerationError(product.errorMissingApiKey, 500)
  }

  try {
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const candidates = await findPlaceCandidates(answers)

      if (candidates.length < 2) {
        throw new PlanGenerationError(
          'Could not find enough local places for that area. Try a more specific city or neighborhood.',
          422,
        )
      }

      const { object: draft } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: groundedPlanDraftSchema,
        schemaName: product.groundedSchemaName,
        schemaDescription: product.groundedSchemaDescription,
        system: getGroundedPlanSystemPrompt(),
        prompt: buildPlanPrompt(answers, candidates),
        temperature: 0.7,
      })

      let plan
      try {
        plan = enrichPlanFromCandidates(draft, candidates)
      } catch (enrichError) {
        console.error('Failed to enrich plan from Places candidates', enrichError)
        throw new PlanGenerationError('The planner picked an invalid place. Please try generating again.', 502)
      }

      return { plan: datePlanSchema.parse(plan), grounded: true }
    }

    // Fallback without Places key (dev / until key is configured)
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: datePlanSchema,
      schemaName: product.schemaName,
      schemaDescription: product.schemaDescription,
      system: getPlanSystemPrompt(),
      prompt: buildPlanPrompt(answers),
      temperature: 0.8,
    })

    return { plan: object, grounded: false }
  } catch (error) {
    if (error instanceof PlanGenerationError) throw error
    console.error('Failed to generate plan', error)

    const message = error instanceof Error ? error.message : ''
    if (message.includes('Incorrect API key') || message.includes('invalid_api_key')) {
      throw new PlanGenerationError(
        'OpenAI rejected the API key. Check .env.local — paste the key exactly as shown (usually sk-proj-...), with no extra sk- prefix, then restart npm run dev.',
        401,
      )
    }

    if (message.includes('GOOGLE_MAPS_API_KEY') || message.includes('Google Places') || message.includes('look up places nearby')) {
      throw new PlanGenerationError(
        message.includes('look up places nearby')
          ? message
          : 'We could not look up places nearby right now. Please try generating again.',
        500,
      )
    }

    if (message.includes('Could not find those locations')) {
      throw new PlanGenerationError(message, 422)
    }

    throw new PlanGenerationError(product.errorCouldNotGenerate, 502)
  }
}
