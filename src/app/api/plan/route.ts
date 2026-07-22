import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { NextResponse } from 'next/server'

import { buildPlanPrompt, datePlanSchema, PLAN_SYSTEM_PROMPT } from '@/lib/plan'
import { quizAnswersSchema } from '@/lib/quiz'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Missing OPENAI_API_KEY. Add it to .env.local to generate date plans.' },
      { status: 500 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = quizAnswersSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid quiz answers.', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: datePlanSchema,
      schemaName: 'DatePlan',
      schemaDescription: 'A multi-stop local date itinerary',
      system: PLAN_SYSTEM_PROMPT,
      prompt: buildPlanPrompt(parsed.data),
      temperature: 0.8,
    })

    return NextResponse.json({ plan: object, answers: parsed.data })
  } catch (error) {
    console.error('Failed to generate date plan', error)

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

    return NextResponse.json(
      { error: 'Could not generate a date plan. Please try again in a moment.' },
      { status: 502 },
    )
  }
}
