import { z } from 'zod'

export const audienceOptions = [
  { value: 'first_date', label: 'First date', description: 'Keep it low-pressure and easy to talk through.' },
  { value: 'couple', label: 'Couple', description: 'Bring intentional time back into your relationship.' },
] as const

export const meetingPreferenceOptions = [
  {
    value: 'midpoint',
    label: 'Halfway between us',
    description: 'Find spots roughly equal distance from both of you.',
  },
  {
    value: 'near_me',
    label: 'Near me',
    description: 'Keep the date close to where you are.',
  },
  {
    value: 'near_them',
    label: 'Near them',
    description: 'Plan around where your date is.',
  },
  {
    value: 'neighborhood',
    label: 'Specific neighborhood',
    description: 'Pick a city or neighborhood and plan there.',
  },
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

export const quizAnswersSchema = z
  .object({
    audience: z.enum(['first_date', 'couple']),
    meetingPreference: z.enum(['midpoint', 'near_me', 'near_them', 'neighborhood']),
    myLocation: z.string().trim().max(120).optional().default(''),
    theirLocation: z.string().trim().max(120).optional().default(''),
    location: z.string().trim().max(120).optional().default(''),
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
  .superRefine((data, ctx) => {
    switch (data.meetingPreference) {
      case 'midpoint':
        if (data.myLocation.trim().length < 2) {
          ctx.addIssue({
            code: 'custom',
            path: ['myLocation'],
            message: 'Enter your location',
          })
        }
        if (data.theirLocation.trim().length < 2) {
          ctx.addIssue({
            code: 'custom',
            path: ['theirLocation'],
            message: 'Enter their location',
          })
        }
        break
      case 'near_me':
        if (data.myLocation.trim().length < 2) {
          ctx.addIssue({
            code: 'custom',
            path: ['myLocation'],
            message: 'Enter your location',
          })
        }
        break
      case 'near_them':
        if (data.theirLocation.trim().length < 2) {
          ctx.addIssue({
            code: 'custom',
            path: ['theirLocation'],
            message: 'Enter their location',
          })
        }
        break
      case 'neighborhood':
        if (data.location.trim().length < 2) {
          ctx.addIssue({
            code: 'custom',
            path: ['location'],
            message: 'Enter a city or neighborhood',
          })
        }
        break
    }
  })

export type QuizAnswers = z.infer<typeof quizAnswersSchema>

export type QuizStepId =
  | 'audience'
  | 'meeting'
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
    id: 'meeting',
    title: 'Where should you meet?',
    subtitle: 'Halfway, near one of you, or a neighborhood you both like.',
  },
  {
    id: 'location',
    title: 'Add the locations',
    subtitle: 'Be as specific as you can — city, neighborhood, or landmark.',
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
  meetingPreference: 'neighborhood',
  myLocation: '',
  theirLocation: '',
  location: '',
  occasion: 'weekend',
  budget: '$$',
  time: 'evening',
  energy: 'mixed',
  vibes: [],
  constraints: '',
}

/** Human-readable area label for prompts and UI. */
export function getMeetingAreaLabel(answers: QuizAnswers): string {
  switch (answers.meetingPreference) {
    case 'midpoint':
      return `halfway between ${answers.myLocation.trim()} and ${answers.theirLocation.trim()}`
    case 'near_me':
      return `near ${answers.myLocation.trim()}`
    case 'near_them':
      return `near ${answers.theirLocation.trim()}`
    case 'neighborhood':
      return answers.location.trim()
  }
}

export const PLAN_STORAGE_KEY = 'betterdate:plan'
export const QUIZ_STORAGE_KEY = 'betterdate:quiz'
