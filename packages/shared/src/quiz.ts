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
    label: 'Meet in the middle',
    description: 'Find spots roughly equal distance from both of you.',
    featured: true,
    badge: 'Better Hang move',
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
    value: 'midpoint',
    label: 'Fair for everyone',
    description: 'Two starting points — we meet in the middle so nobody’s stuck with the long trip.',
    featured: true,
    badge: 'Better Hang move',
  },
  {
    value: 'neighborhood',
    label: 'Shared neighborhood',
    description: 'Already have a fair area in mind? Plan there.',
  },
  {
    value: 'near_me',
    label: 'Near the host',
    description: 'Gather around the host’s area.',
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

export const friendsHangLengthOptions = [
  {
    value: 'few_hours',
    label: 'A few hours',
    description: '3 hours max — coffee, a walk, or one meal. Then people bounce.',
  },
  {
    value: 'half_night',
    label: 'Half night',
    description: 'Dinner plus one more thing. Still home at a decent hour.',
  },
  {
    value: 'whole_night',
    label: 'Whole night',
    description: 'Commit the evening — dinner, something to do, then drinks.',
  },
] as const

export function getFriendsHangLengthOptions(time: 'morning' | 'afternoon' | 'evening' | 'flexible'): readonly {
  value: 'few_hours' | 'half_night' | 'whole_night'
  label: string
  description: string
}[] {
  if (time === 'morning' || time === 'afternoon') {
    const stretch = time === 'morning' ? 'morning' : 'afternoon'
    return [
      {
        value: 'few_hours',
        label: 'A few hours',
        description: '3 hours max — one or two stops, then done.',
      },
      {
        value: 'half_night',
        label: 'A longer hang',
        description: `A solid chunk of the ${stretch}, not the whole thing.`,
      },
      {
        value: 'whole_night',
        label: `The whole ${stretch}`,
        description: `Make a ${stretch} of it — a full plan, not a quick stop.`,
      },
    ]
  }
  return friendsHangLengthOptions
}

export function getHangLengthPlanRule(
  hangLength: 'few_hours' | 'half_night' | 'whole_night',
  time: 'morning' | 'afternoon' | 'evening' | 'flexible' = 'evening',
): {
  label: string
  stopCount: string
  durationHint: string
  pacing: string
} {
  const isDaytime = time === 'morning' || time === 'afternoon'

  switch (hangLength) {
    case 'few_hours':
      return {
        label: 'a few hours (3 hours max)',
        stopCount: '1–2',
        durationHint: '2–3 hours',
        pacing:
          'Keep it tight. One main stop and an optional short second. People need to leave after. Do not plan a crawl or a late last stop.',
      }
    case 'half_night':
      return {
        label: isDaytime ? `a longer ${time} hang — not the whole ${time}` : 'half a night',
        stopCount: '2–3',
        durationHint: '4–5 hours',
        pacing: isDaytime
          ? `A solid stretch of the ${time}, then wrap up. Not an all-day itinerary.`
          : 'Dinner plus one more thing. Home at a decent hour — not a full night out.',
      }
    case 'whole_night':
      return {
        label: isDaytime ? `the whole ${time}` : 'the whole night',
        stopCount: '3–4',
        durationHint: isDaytime ? '4–6 hours' : '5–7 hours',
        pacing: isDaytime
          ? `Make a ${time} of it: a full sequence, not a quick stop.`
          : 'Commit the evening: dinner, something to do, then drinks or dessert. A later last stop is fine.',
      }
  }
}

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
    hangLength: z.enum(['few_hours', 'half_night', 'whole_night']),
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
      if (data.meetingPreference === 'near_them') {
        ctx.addIssue({
          code: 'custom',
          path: ['meetingPreference'],
          message: 'Groups meet in the middle, near the host, or in a shared neighborhood',
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
  | 'hangLength'
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
    subtitle: 'Meet in the middle is the Better Hang move — spots equal distance from both of you.',
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
    subtitle: 'Morning, afternoon, or evening — next we’ll ask how long.',
  },
  {
    id: 'hangLength',
    title: 'How long should you hang?',
    subtitle: 'A few hours, half the night, or the whole night — we’ll size the plan to match.',
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
  const steps =
    answers.hangoutType !== 'group'
      ? friendsQuizSteps.filter((step) => step.id !== 'groupSize')
      : friendsQuizSteps

  return steps.map((step) => {
    if (step.id === 'meeting') {
      return {
        ...step,
        subtitle:
          answers.hangoutType === 'group'
            ? 'Fair for everyone finds a middle ground from two starting points — or pick a shared neighborhood or the host’s area.'
            : 'Meet in the middle is the Better Hang move — spots equal distance from both of you.',
      }
    }
    if (step.id === 'hangLength') {
      const isDaytime = answers.time === 'morning' || answers.time === 'afternoon'
      return {
        ...step,
        subtitle: isDaytime
          ? `A few hours or the whole ${answers.time} — we’ll size the plan to match.`
          : 'A few hours, half the night, or the whole night — we’ll size the plan to match.',
      }
    }
    if (step.id === 'location' && answers.meetingPreference === 'midpoint') {
      return {
        ...step,
        subtitle:
          answers.hangoutType === 'group'
            ? 'Two representative starting points is enough — city, neighborhood, or landmark.'
            : 'Your place and theirs. Be as specific as you can — city, neighborhood, or landmark.',
      }
    }
    return step
  })
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
  meetingPreference: 'midpoint',
  myLocation: '',
  theirLocation: '',
  location: '',
  occasion: 'weekend',
  budget: '$$',
  time: 'evening',
  hangLength: 'half_night',
  energy: 'mixed',
  vibes: [],
  constraints: '',
}

export type MeetingLocationAnswers = {
  meetingPreference: 'midpoint' | 'near_me' | 'near_them' | 'neighborhood'
  myLocation: string
  theirLocation: string
  location: string
  hangoutType?: 'pair' | 'group'
}

/** Human-readable area label for prompts and UI. */
export function getMeetingAreaLabel(answers: MeetingLocationAnswers): string {
  switch (answers.meetingPreference) {
    case 'midpoint':
      return answers.hangoutType === 'group'
        ? `a fair middle ground between ${answers.myLocation.trim()} and ${answers.theirLocation.trim()}`
        : `halfway between ${answers.myLocation.trim()} and ${answers.theirLocation.trim()}`
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
      return answers.hangoutType === 'group'
        ? 'The two locations are representative starting points for the group. Prefer venues that are a fair middle ground (not biased to only one side).'
        : 'Prefer venues that work as a fair middle ground for both people (not biased to only one side).'
    case 'near_me':
      return 'Prefer venues convenient to the planner’s location.'
    case 'near_them':
      return 'Prefer venues convenient to the other person’s location.'
    case 'neighborhood':
      return answers.hangoutType === 'group'
        ? 'Keep the plan walkable within the shared neighborhood — treat it as the group’s fair meetup area.'
        : 'Keep the plan walkable within the chosen neighborhood or area.'
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
    case 'hangLength':
      return answers.product === 'friends' && Boolean(answers.hangLength)
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
