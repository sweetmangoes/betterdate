import { getProduct } from '@betterdate/shared'
import { NextResponse } from 'next/server'

import { generatePlan, PlanGenerationError } from '@/lib/generate-plan'
import { savePlan } from '@/lib/plans-db'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  const product = getProduct()

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
    const { plan, grounded } = await generatePlan(parsed.data)
    const saved = await savePlan({ product: product.id, plan, answers: parsed.data })

    return NextResponse.json({
      plan,
      answers: parsed.data,
      grounded,
      ...(saved?.id ? { planId: saved.id } : {}),
      ...(saved?.dateNumber ? { dateNumber: saved.dateNumber } : {}),
    })
  } catch (error) {
    if (error instanceof PlanGenerationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Failed to generate plan', error)
    return NextResponse.json({ error: product.errorCouldNotGenerate }, { status: 502 })
  }
}
