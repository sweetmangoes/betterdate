import {
  buildPlanPrompt,
  datePlanSchema,
  getGroundedPlanSystemPrompt,
  getPlanSystemPrompt,
  getProduct,
  groundedPlanDraftSchema,
} from '@betterdate/shared'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { NextResponse } from 'next/server'

import { enrichPlanFromCandidates } from '@/lib/enrich-plan'
import { findPlaceCandidates } from '@/lib/places'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  const product = getProduct()

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: product.errorMissingApiKey }, { status: 500 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = product.parseQuizAnswers(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid quiz answers.', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  try {
    const hasPlacesKey = Boolean(process.env.GOOGLE_MAPS_API_KEY)

    if (hasPlacesKey) {
      const candidates = await findPlaceCandidates(parsed.data)

      if (candidates.length < 2) {
        return NextResponse.json(
          {
            error:
              'Could not find enough local places for that area. Try a more specific city or neighborhood.',
          },
          { status: 422 },
        )
      }

      const { object: draft } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: groundedPlanDraftSchema,
        schemaName: product.groundedSchemaName,
        schemaDescription: product.groundedSchemaDescription,
        system: getGroundedPlanSystemPrompt(),
        prompt: buildPlanPrompt(parsed.data, candidates),
        temperature: 0.7,
      })

      let plan
      try {
        plan = enrichPlanFromCandidates(draft, candidates)
      } catch (enrichError) {
        console.error('Failed to enrich plan from Places candidates', enrichError)
        return NextResponse.json(
          { error: 'The planner picked an invalid place. Please try generating again.' },
          { status: 502 },
        )
      }

      const validated = datePlanSchema.parse(plan)
      return NextResponse.json({ plan: validated, answers: parsed.data, grounded: true })
    }

    // Fallback without Places key (dev / until key is configured)
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: datePlanSchema,
      schemaName: product.schemaName,
      schemaDescription: product.schemaDescription,
      system: getPlanSystemPrompt(),
      prompt: buildPlanPrompt(parsed.data),
      temperature: 0.8,
    })

    return NextResponse.json({ plan: object, answers: parsed.data, grounded: false })
  } catch (error) {
    console.error('Failed to generate plan', error)

    const message = error instanceof Error ? error.message : ''
    if (message.includes('Incorrect API key') || message.includes('invalid_api_key')) {
      return NextResponse.json(
        {
          error:
            'OpenAI rejected the API key. Check .env.local — paste the key exactly as shown (usually sk-proj-...), with no extra sk- prefix, then restart npm run dev.',
        },
        { status: 401 },
      )
    }

    if (message.includes('GOOGLE_MAPS_API_KEY') || message.includes('Google Places') || message.includes('look up places nearby')) {
      return NextResponse.json(
        {
          error:
            message.includes('look up places nearby')
              ? message
              : 'We could not look up places nearby right now. Please try generating again.',
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: product.errorCouldNotGenerate }, { status: 502 })
  }
}
