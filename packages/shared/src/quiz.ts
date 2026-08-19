import { z } from 'zod'

export const audienceOptions = [
  { value: 'first_date', label: 'First date', description: 'Keep it low-pressure and easy to talk through.' },
  { value: 'couple', label: 'Couple', description: 'Bring intentional time back into your relationship.' },
] as const

export const hangoutTypeOptions = [
  { value: 'pair', label: 'Two friends', description: 'A catch-up, a night out, or something in between.' },
  { value: 'group', label: 'A group', description: 'Three or more — we’ll pick spots that work for a crowd.' },
] as const

export const groupSizeOptions = [
  { value: 3, label: '3 people' },
  { value: 4, label: '4 people' },
  { value: 5, label: '5 people' },
  { value: 6, label: '6 people' },
  { value: 7, label: '7 people' },
  { value: 8, label: '8 people' },
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

export const friendsPairMeetingOptions = [
  {
    value: 'midpoint',
    label: 'Halfway between us',
    description: 'Find spots roughly equal distance from both of you.',
  },
  {
    value: 'near_me',
    label: 'Near me',
    description: 'Keep the hangout close to where you are.',
  },
  {
    value: 'near_them',
    label: 'Near them',
    description: 'Plan around where your friend is.',
  },
  {
    value: 'neighborhood',
    label: 'Specific neighborhood',
    description: 'Pick a city or neighborhood and plan there.',
  },
] as const

export const friendsGroupMeetingOptions = [
  {
    value: 'near_me',
    label: 'Near me',
    description: 'Gather around the host’s area.',
  },
  {
    value: 'neighborhood',
    label: 'Specific neighborhood',
    description: 'Pick a spot everyone can get to.',
  },
] as const

export const occasionOptions = [
  { value: 'weeknight', label: 'Weeknight' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'just_because', label: 'Just because' },
] as const

export const friendsOccasionOptions = [
  { value: 'weeknight', label: 'Weeknight' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'catch_up', label: 'Catch-up' },
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

export const friendsVibeOptions = [
  { value: 'cozy', label: 'Cozy' },
  { value: 'outdoorsy', label: 'Outdoorsy' },
  { value: 'foodie', label: 'Foodie' },
  { value: 'culture', label: 'Culture' },
  { value: 'playful', label: 'Playful' },
  { value: 'games', label: 'Games' },
  { value: 'nightlife', label: 'Nightlife' },
] as const

const locationFields = {
  meetingPreference: z.enum(['midpoint', 'near_me', 'near_them', 'neighborhood']),
  myLocation: z.string().trim().max(120).optional().default(''),
  theirLocation: z.string().trim().max(120).optional().default(''),
  location: z.string().trim().max(120).optional().default(''),
}

function refineMeetingLocations(
  data: {
    meetingPreference: 'midpoint' | 'near_me' | 'near_them' | 'neighborhood'
    myLocation: string
    theirLocation: string
    location: string
  },
  ctx: z.RefinementCtx,
) {
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
}

export const dateQuizAnswersSchema = z
  .object({
    product: z.literal('date').default('date'),
    audience: z.enum(['first_date', 'couple']),
    ...locationFields,
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
  .superRefine(refineMeetingLocations)

/** Date quiz schema — kept as `quizAnswersSchema` so mobile stays on Better Date. */
export const quizAnswersSchema = dateQuizAnswersSchema

export const friendsQuizAnswersSchema = z
  .object({
    product: z.literal('friends'),
    hangoutType: z.enum(['pair', 'group']),
    groupSize: z.number().int().min(3).max(8).optional(),
    ...locationFields,
    occasion: z.enum(['weeknight', 'weekend', 'birthday', 'catch_up', 'just_because']),
    budget: z.enum(['$', '$$', '$$$']),
    time: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
    energy: z.enum(['low_key', 'mixed', 'adventurous']),
    vibes: z
      .array(z.enum(['cozy', 'outdoorsy', 'foodie', 'culture', 'playful', 'games', 'nightlife']))
      .min(1, 'Pick at least one vibe')
      .max(2, 'Pick up to two vibes'),
    constraints: z.string().trim().max(400).optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.hangoutType === 'group') {
      if (data.groupSize == null) {
        ctx.addIssue({
          code: 'custom',
          path: ['groupSize'],
          message: 'Choose how many people',
        })
      }
      if (data.meetingPreference === 'midpoint' || data.meetingPreference === 'near_them') {
        ctx.addIssue({
          code: 'custom',
          path: ['meetingPreference'],
          message: 'Groups meet near you or in a shared neighborhood',
        })
      }
    }
    refineMeetingLocations(data, ctx)
  })

export type DateQuizAnswers = z.infer<typeof dateQuizAnswersSchema>
export type FriendsQuizAnswers = z.infer<typeof friendsQuizAnswersSchema>
/** Date quiz answers — mobile and existing Date clients. */
export type QuizAnswers = DateQuizAnswers
export type PlanQuizAnswers = DateQuizAnswers | FriendsQuizAnswers

export function isFriendsQuizAnswers(answers: PlanQuizAnswers): answers is FriendsQuizAnswers {
  return answers.product === 'friends'
}

export function isDateQuizAnswers(answers: PlanQuizAnswers): answers is DateQuizAnswers {
  return answers.product !== 'friends'
}

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

export type FriendsQuizStepId =
  | 'hangout'
  | 'groupSize'
  | 'meeting'
  | 'location'
  | 'occasion'
  | 'budget'
  | 'time'
  | 'energy'
  | 'vibes'
  | 'constraints'

export type ProductQuizStepId = QuizStepId | FriendsQuizStepId

export type QuizStep = {
  id: ProductQuizStepId
  title: string
  subtitle: string
}

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

export const friendsQuizSteps: QuizStep[] = [
  {
    id: 'hangout',
    title: 'Who’s hanging out?',
    subtitle: 'Two friends or a group — we’ll match the plan to the crowd.',
  },
  {
    id: 'groupSize',
    title: 'How many people?',
    subtitle: 'Helps us pick venues that actually work for the whole group.',
  },
  {
    id: 'meeting',
    title: 'Where should you meet?',
    subtitle: 'Near the host, a shared neighborhood, or halfway if it’s just two of you.',
  },
  {
    id: 'location',
    title: 'Add the locations',
    subtitle: 'Be as specific as you can — city, neighborhood, or landmark.',
  },
  {
    id: 'occasion',
    title: 'What’s the occasion?',
    subtitle: 'Helps us frame the hangout the right way.',
  },
  {
    id: 'budget',
    title: 'What’s the budget?',
    subtitle: 'We’ll keep venues in range.',
  },
  {
    id: 'time',
    title: 'When are you going?',
    subtitle: 'Brunch, afternoon, or a full night out — we’ll schedule around it.',
  },
  {
    id: 'energy',
    title: 'What energy feels right?',
    subtitle: 'Low-key catch-up, or something a little more active.',
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

export function getFriendsQuizSteps(answers: FriendsQuizAnswers): QuizStep[] {
  if (answers.hangoutType !== 'group') {
    return friendsQuizSteps.filter((step) => step.id !== 'groupSize')
  }
  return friendsQuizSteps
}

export const emptyQuizAnswers: QuizAnswers = {
  product: 'date',
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

export const emptyFriendsQuizAnswers: FriendsQuizAnswers = {
  product: 'friends',
  hangoutType: 'pair',
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

export type MeetingLocationAnswers = {
  meetingPreference: 'midpoint' | 'near_me' | 'near_them' | 'neighborhood'
  myLocation: string
  theirLocation: string
  location: string
}

/** Human-readable area label for prompts and UI. */
export function getMeetingAreaLabel(answers: MeetingLocationAnswers): string {
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

export function getMeetingNote(answers: MeetingLocationAnswers): string {
  switch (answers.meetingPreference) {
    case 'midpoint':
      return 'Prefer venues that work as a fair middle ground for both people (not biased to only one side).'
    case 'near_me':
      return 'Prefer venues convenient to the planner’s location.'
    case 'near_them':
      return 'Prefer venues convenient to the other person’s location.'
    case 'neighborhood':
      return 'Keep the plan walkable within the chosen neighborhood or area.'
  }
}

export function isQuizStepComplete(stepId: ProductQuizStepId, answers: PlanQuizAnswers): boolean {
  switch (stepId) {
    case 'audience':
      return answers.product === 'date' && Boolean(answers.audience)
    case 'hangout':
      return answers.product === 'friends' && Boolean(answers.hangoutType)
    case 'groupSize':
      return answers.product === 'friends' && answers.hangoutType === 'group' && answers.groupSize != null
    case 'meeting':
      return Boolean(answers.meetingPreference)
    case 'location':
      switch (answers.meetingPreference) {
        case 'midpoint':
          return answers.myLocation.trim().length >= 2 && answers.theirLocation.trim().length >= 2
        case 'near_me':
          return answers.myLocation.trim().length >= 2
        case 'near_them':
          return answers.theirLocation.trim().length >= 2
        case 'neighborhood':
          return answers.location.trim().length >= 2
      }
    case 'occasion':
      return Boolean(answers.occasion)
    case 'budget':
      return Boolean(answers.budget)
    case 'time':
      return Boolean(answers.time)
    case 'energy':
      return Boolean(answers.energy)
    case 'vibes':
      return answers.vibes.length >= 1 && answers.vibes.length <= 2
    case 'constraints':
      return true
  }
}

export const PLAN_STORAGE_KEY = 'betterdate:plan'
export const QUIZ_STORAGE_KEY = 'betterdate:quiz'
export const FRIENDS_PLAN_STORAGE_KEY = 'betterhang:plan'
export const FRIENDS_QUIZ_STORAGE_KEY = 'betterhang:quiz'
