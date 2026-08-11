import {
  datePlanSchema,
  parsePlanApiResponse,
  quizAnswersSchema,
  type DatePlan,
  type QuizAnswers,
} from '@betterdate/shared'

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export async function generatePlan(answers: QuizAnswers): Promise<DatePlan> {
  const parsed = quizAnswersSchema.parse(answers)

  const response = await fetch(`${API_URL}/api/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  })

  const body: unknown = await response.json()
  return parsePlanApiResponse(response.ok, body).plan
}
