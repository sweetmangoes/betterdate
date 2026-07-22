import { z } from 'zod'

export const audienceOptions = [
  { value: 'first_date', label: 'First date', description: 'Keep it low-pressure and easy to talk through.' },
  { value: 'couple', label: 'Couple', description: 'Bring intentional time back into your relationship.' },
] as const

export const occasionOptions = [
  { value: 'weeknight', label: 'Weeknight' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'just_because', label: 'Just because' },
] as const

export const budgetOptions = [
  { value: '$', label: '$', description: 'Keep it affordable' },
  { value: '$$', label: '$$', description: 'Comfortable mid-range' },
  { value: '$$$', label: '$$$', description: 'Treat yourselves' },
] as const

export const timeOptions = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'flexible', label: 'Flexible' },
] as const

export const energyOptions = [
  { value: 'low_key', label: 'Low-key', description: 'Relaxed and unhurried' },
  { value: 'mixed', label: 'Mixed', description: 'A little of both' },
  { value: 'adventurous', label: 'Adventurous', description: 'Try something new' },
] as const

export const vibeOptions = [
  { value: 'cozy', label: 'Cozy' },
  { value: 'outdoorsy', label: 'Outdoorsy' },
  { value: 'foodie', label: 'Foodie' },
  { value: 'culture', label: 'Culture' },
  { value: 'playful', label: 'Playful' },
] as const

export const quizAnswersSchema = z.object({
  audience: z.enum(['first_date', 'couple']),
  location: z.string().trim().min(2, 'Enter a city or neighborhood').max(120),
  occasion: z.enum(['weeknight', 'weekend', 'anniversary', 'just_because']),
  budget: z.enum(['$', '$$', '$$$']),
  time: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
  energy: z.enum(['low_key', 'mixed', 'adventurous']),
  vibes: z
    .array(z.enum(['cozy', 'outdoorsy', 'foodie', 'culture', 'playful']))
    .min(1, 'Pick at least one vibe')
    .max(2, 'Pick up to two vibes'),
  constraints: z.string().trim().max(400).optional().default(''),
})

export type QuizAnswers = z.infer<typeof quizAnswersSchema>

export type QuizStepId =
  | 'audience'
  | 'location'
  | 'occasion'
  | 'budget'
  | 'time'
  | 'energy'
  | 'vibes'
  | 'constraints'

export const quizSteps: Array<{
  id: QuizStepId
  title: string
  subtitle: string
}> = [
  {
    id: 'audience',
    title: 'Who is this date for?',
    subtitle: 'We’ll match the tone and risk level to your situation.',
  },
  {
    id: 'location',
    title: 'Where should we plan?',
    subtitle: 'City, neighborhood, or both — the more specific, the better.',
  },
  {
    id: 'occasion',
    title: 'What’s the occasion?',
    subtitle: 'Helps us frame the evening the right way.',
  },
  {
    id: 'budget',
    title: 'What’s the budget?',
    subtitle: 'We’ll keep venues in range.',
  },
  {
    id: 'time',
    title: 'When are you going?',
    subtitle: 'Morning coffee or late dinner — we’ll schedule around it.',
  },
  {
    id: 'energy',
    title: 'What energy feels right?',
    subtitle: 'Quiet connection, or something a little more active.',
  },
  {
    id: 'vibes',
    title: 'Pick up to two vibes',
    subtitle: 'These shape the style of the plan.',
  },
  {
    id: 'constraints',
    title: 'Anything we should know?',
    subtitle: 'Dietary needs, mobility, weather, must-avoids — optional.',
  },
]

export const emptyQuizAnswers: QuizAnswers = {
  audience: 'first_date',
  location: '',
  occasion: 'weekend',
  budget: '$$',
  time: 'evening',
  energy: 'mixed',
  vibes: [],
  constraints: '',
}

export const PLAN_STORAGE_KEY = 'betterdate:plan'
export const QUIZ_STORAGE_KEY = 'betterdate:quiz'
