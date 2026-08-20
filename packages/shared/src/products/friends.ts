import { formatCandidateList, type PlanCandidate } from '../candidates'
import type { ProductConfig } from '../product'
import {
  budgetOptions,
  emptyFriendsQuizAnswers,
  energyOptions,
  friendsGroupMeetingOptions,
  FRIENDS_PLAN_STORAGE_KEY,
  friendsOccasionOptions,
  friendsPairMeetingOptions,
  FRIENDS_QUIZ_STORAGE_KEY,
  friendsQuizAnswersSchema,
  friendsVibeOptions,
  getFriendsHangLengthOptions,
  getFriendsQuizSteps,
  getHangLengthPlanRule,
  getMeetingAreaLabel,
  getMeetingNote,
  groupSizeOptions,
  hangoutTypeOptions,
  isFriendsQuizAnswers,
  timeOptions,
  type FriendsQuizAnswers,
  type PlanQuizAnswers,
} from '../quiz'

function occasionLabel(occasion: FriendsQuizAnswers['occasion']): string {
  switch (occasion) {
    case 'catch_up':
      return 'a catch-up'
    case 'birthday':
      return 'a birthday'
    case 'weeknight':
      return 'a weeknight hangout'
    case 'weekend':
      return 'a weekend hangout'
    case 'just_because':
      return 'a just-because hangout'
  }
}

function buildFriendsSearchQueries(answers: FriendsQuizAnswers, areaLabel: string): string[] {
  const queries: string[] = []
  const inArea = areaLabel
  const isGroup = answers.hangoutType === 'group'

  for (const vibe of answers.vibes) {
    switch (vibe) {
      case 'foodie':
        queries.push(isGroup ? `group-friendly restaurants ${inArea}` : `best restaurants ${inArea}`)
        break
      case 'cozy':
        queries.push(`cozy cafe or wine bar ${inArea}`)
        break
      case 'outdoorsy':
        queries.push(`parks or scenic walking spots ${inArea}`)
        break
      case 'culture':
        queries.push(`museums galleries or cultural attractions ${inArea}`)
        break
      case 'playful':
        queries.push(`fun activities or entertainment ${inArea}`)
        break
      case 'games':
        queries.push(`arcade board game cafe or bowling ${inArea}`)
        break
      case 'nightlife':
        queries.push(`bars live music or nightlife ${inArea}`)
        break
    }
  }

  if (answers.time === 'evening' || answers.time === 'flexible') {
    if (answers.hangLength !== 'few_hours') {
      queries.push(isGroup ? `group-friendly bars or dessert spots ${inArea}` : `cocktail bars or dessert spots ${inArea}`)
    }
  }
  if (answers.time === 'morning' || answers.time === 'afternoon') {
    queries.push(`brunch cafes or daytime hangout spots ${inArea}`)
  }
  if (answers.energy === 'adventurous') {
    queries.push(`unique experiences or activities ${inArea}`)
  }
  if (answers.energy === 'low_key') {
    queries.push(`casual cafes or quiet restaurants ${inArea}`)
  }
  if (isGroup && !queries.some((q) => q.includes('group'))) {
    queries.push(`restaurants good for groups ${inArea}`)
  }

  if (!queries.some((q) => q.includes('restaurant') || q.includes('cafe'))) {
    queries.push(`restaurants ${inArea}`)
  }

  return [...new Set(queries)].slice(0, 4)
}

function buildFriendsPlanPrompt(answers: FriendsQuizAnswers, candidates?: PlanCandidate[]): string {
  const vibeList = answers.vibes.join(', ')
  const constraints = answers.constraints?.trim() || 'None noted'
  const areaLabel = getMeetingAreaLabel(answers)
  const meetingNote = getMeetingNote(answers)
  const hang = getHangLengthPlanRule(answers.hangLength, answers.time)
  const who =
    answers.hangoutType === 'group'
      ? `a group of ${answers.groupSize ?? 4} friends`
      : 'two friends'
  const occasion = occasionLabel(answers.occasion)
  const groupRule =
    answers.hangoutType === 'group'
      ? `- Prefer venues that work for ${answers.groupSize ?? 4} people (not tiny two-tops). Mention a reservation tip when a food stop would be tight for a group.`
      : '- Keep it easy for two friends — not a romantic date, not a huge party.'
  const lengthRule = `- Choose ${hang.stopCount} stops${candidates && candidates.length > 0 ? ' with distinct placeIds from the list above' : ''}. Set duration to about ${hang.durationHint}. They want ${hang.label}. ${hang.pacing}`

  if (candidates && candidates.length > 0) {
    return `You are Better Hang, an expert local hangout planner.

Plan ${occasion} for ${who} ${areaLabel}.

Meeting preference: ${answers.meetingPreference}
${meetingNote}

Preferences:
- Occasion: ${answers.occasion}
- Budget: ${answers.budget}
- Time of day: ${answers.time}
- How long: ${hang.label} (${hang.durationHint})
- Energy: ${answers.energy}
- Vibes: ${vibeList}
- Constraints: ${constraints}

You MUST build the itinerary using ONLY venues from this candidate list. Copy each stop's placeId exactly.
Do not invent venues, names, or placeIds.

CANDIDATES:
${formatCandidateList(candidates)}

Rules:
${lengthRule}
- Prefer a walkable sequence in a sensible order for the chosen time of day.
- Match budget and energy. This is a friends hangout — catch-up energy, not first-date chemistry.
${groupRule}
- Do not invent confirmation of reservations, hours, or live availability.
- Include talking points / icebreakers suited to friends (shared memories, what they’ve been up to — not dating-app small talk).
- Include one backup idea that names a weather-friendly pivot using a venue name from the list (never placeIds — those are internal only).
- Set disclaimer to remind the user to verify hours/reservations; venues come from Google Places and should be double-checked.
- Keep copy warm, specific, and concise. User-facing fields (title, summary, tips, backupIdea, conversation starters, disclaimer) must never include placeIds.`
  }

  return `You are Better Hang, an expert local hangout planner.

Plan ${occasion} for ${who} ${areaLabel}.

Meeting preference: ${answers.meetingPreference}
${meetingNote}

Preferences:
- Occasion: ${answers.occasion}
- Budget: ${answers.budget}
- Time of day: ${answers.time}
- How long: ${hang.label} (${hang.durationHint})
- Energy: ${answers.energy}
- Vibes: ${vibeList}
- Constraints: ${constraints}

Rules:
${lengthRule}
- Suggest real-feeling named places (restaurants, cafes, parks, museums, bars, walks) that fit the meeting area.
- Prefer a walkable sequence in a sensible order for the chosen time of day.
- Match budget and energy. This is a friends hangout — catch-up energy, not first-date chemistry.
${groupRule}
- Do not invent confirmation of reservations, hours, or live availability.
- Include talking points / icebreakers suited to friends.
- Include one backup idea if weather or crowds get in the way.
- Set disclaimer to remind the user to verify hours, reservations, and that venue suggestions are AI-generated.
- Keep copy warm, specific, and concise — no generic filler.`
}

export const friendsProduct: ProductConfig = {
  id: 'friends',
  name: 'Better Hang',
  description:
    'Stop defaulting to “idk, bar?” Plan a hangout that actually fits your friends — two people or a group.',
  titleDefault: 'Better Hang — AI hangout plans for friends and groups',
  planStorageKey: FRIENDS_PLAN_STORAGE_KEY,
  quizStorageKey: FRIENDS_QUIZ_STORAGE_KEY,
  ctaLabel: 'Plan a hangout',
  conversationStartersLabel: 'Talking points',
  planEyebrow: 'Your hangout plan',
  emptyPlanMessage: 'Take the preference quiz and we’ll build a local hangout plan for you.',
  footerFineprint: '© 2026 Better Hang. Venue suggestions are AI-generated — always verify hours and reservations.',
  quizPageTitle: 'Plan a hangout',
  quizPageDescription:
    'Answer a short preference quiz and get a thoughtful local hangout plan for two friends or a group.',
  planPageTitle: 'Your hangout plan',
  planPageDescription: 'Your personalized Better Hang itinerary.',
  aboutPageDescription:
    'Better Hang’s mission is to help friends plan thoughtful hangouts from their preferences — two people or a group.',
  privacyPageDescription: 'How Better Hang collects, uses, and protects information when you use the service.',
  constraintsPlaceholder: 'Vegetarian, someone hates loud bars, prefer indoor if raining…',
  locationYourLabel: 'Your location',
  locationTheirLabel: 'Their location',
  locationNeighborhoodLabel: 'Neighborhood or city',
  getLocationCopy: (answers) => {
    if (isFriendsQuizAnswers(answers) && answers.hangoutType === 'group' && answers.meetingPreference === 'midpoint') {
      return {
        yourLabel: 'One starting point',
        theirLabel: 'The other starting point',
        neighborhoodLabel: 'Shared neighborhood',
        hint: 'You don’t need every address — two ends of the group is enough. We’ll meet in the middle.',
      }
    }
    if (isFriendsQuizAnswers(answers) && answers.meetingPreference === 'midpoint') {
      return {
        yourLabel: 'Your location',
        theirLabel: 'Their location',
        neighborhoodLabel: 'Neighborhood or city',
        hint: 'We’ll pick spots roughly equal distance from both of you.',
      }
    }
    if (isFriendsQuizAnswers(answers) && answers.hangoutType === 'group') {
      return {
        yourLabel: 'Host location',
        theirLabel: 'Their location',
        neighborhoodLabel: 'Shared neighborhood',
      }
    }
    return {
      yourLabel: 'Your location',
      theirLabel: 'Their location',
      neighborhoodLabel: 'Neighborhood or city',
    }
  },
  errorMissingApiKey: 'Missing OPENAI_API_KEY. Add it to .env.local to generate hangout plans.',
  errorCouldNotGenerate: 'Could not generate a hangout plan. Please try again in a moment.',
  errorInvalidPlan: 'Received an invalid hangout plan from the server.',
  schemaName: 'HangoutPlan',
  schemaDescription: 'A multi-stop local hangout itinerary',
  groundedSchemaName: 'GroundedHangoutPlan',
  groundedSchemaDescription: 'A hangout itinerary using only provided Google Places IDs',
  planSystemPrompt:
    'You plan thoughtful local hangouts for friends. Return only structured data that matches the schema. When candidates are provided, only use those placeIds. Never claim you have booked anything.',
  groundedPlanSystemPrompt:
    'You plan thoughtful local hangouts for friends using only the provided Google Places candidates. Every stop must use a real placeId from the list. Never invent venues. Never put placeIds in user-facing copy — use venue names only.',
  emptyQuizAnswers: emptyFriendsQuizAnswers,
  parseQuizAnswers: (body: unknown) => {
    const parsed = friendsQuizAnswersSchema.safeParse(body)
    if (!parsed.success) {
      return { success: false, error: parsed.error }
    }
    return { success: true, data: parsed.data }
  },
  getQuizSteps: (answers: PlanQuizAnswers) => {
    if (!isFriendsQuizAnswers(answers)) {
      return getFriendsQuizSteps(emptyFriendsQuizAnswers)
    }
    return getFriendsQuizSteps(answers)
  },
  hangoutOptions: hangoutTypeOptions,
  groupSizeOptions,
  getMeetingPreferenceOptions: (answers: PlanQuizAnswers) => {
    if (isFriendsQuizAnswers(answers) && answers.hangoutType === 'group') {
      return friendsGroupMeetingOptions
    }
    return friendsPairMeetingOptions
  },
  occasionOptions: friendsOccasionOptions,
  vibeOptions: friendsVibeOptions,
  budgetOptions,
  timeOptions,
  getDurationOptions: (answers) => {
    if (!isFriendsQuizAnswers(answers)) {
      return getFriendsHangLengthOptions('evening')
    }
    return getFriendsHangLengthOptions(answers.time)
  },
  energyOptions,
  buildPlanPrompt: (answers: PlanQuizAnswers, candidates?: PlanCandidate[]) => {
    if (!isFriendsQuizAnswers(answers)) {
      throw new Error('Friends product received date quiz answers.')
    }
    return buildFriendsPlanPrompt(answers, candidates)
  },
  buildSearchQueries: (answers: PlanQuizAnswers, areaLabel: string) => {
    if (!isFriendsQuizAnswers(answers)) {
      throw new Error('Friends product received date quiz answers.')
    }
    return buildFriendsSearchQueries(answers, areaLabel)
  },
  landing: {
    eyebrow: 'Better Hang',
    headline: 'Intentional hangouts, planned for where you are.',
    subheadline:
      'Stop defaulting to “idk, bar?” Meet in the middle, pick a vibe, get a local plan — for two friends or a whole group.',
    namedFeature: {
      eyebrow: 'Meet in the middle',
      headline: 'Equal-distance plans, without the commute debate.',
      subheadline:
        'Drop two locations. We pick spots roughly halfway — for two friends, or two sides of a group.',
      points: [
        {
          headline: 'Two friends',
          body: 'Your place and theirs. Meet in the middle is the default — the Better Hang move.',
        },
        {
          headline: 'The group',
          body: 'Fair for everyone: two representative starting points, then a meetup that isn’t only convenient for whoever picked the bar.',
        },
      ],
    },
    howEyebrow: 'How it works',
    howHeadline: 'Three steps to a better hang',
    howSubheadline: 'No accounts. No group chat chaos. Just preferences in, a local plan out.',
    steps: [
      {
        headline: '1. Tell us who’s coming',
        subheadline: 'Two friends or a group, plus where you’re starting from, budget, energy, and anything to avoid.',
      },
      {
        headline: '2. AI plans the hangout',
        subheadline: 'We turn your answers into a multi-stop itinerary with named places nearby.',
      },
      {
        headline: '3. Show up ready',
        subheadline: 'Get timing tips, talking points, and a backup idea — then verify hours and go.',
      },
    ],
    whoEyebrow: 'Who it’s for',
    whoHeadline: 'Two friends or the whole crew',
    whoSubheadline: 'Same planner, different crowd — dialed to how many people are coming.',
    whoItems: [
      {
        headline: 'Two friends',
        body: 'Meet in the middle is the default: spots equal distance from both of you. A catch-up or a night out that isn’t a date — and isn’t scrolling maps in the group chat.',
      },
      {
        headline: 'Groups',
        body: 'Birthdays, reunions, or just hanging. Fair for everyone uses two starting points so the plan isn’t only convenient for the host — and we pick venues that work for three to eight people.',
      },
    ],
    ctaHeadline: 'Ready when you are',
    ctaSubheadline: 'A short quiz. One local plan. About five minutes.',
    ctaButton: 'Plan a hangout',
  },
  about: {
    eyebrow: 'About Better Hang',
    headline: 'Better nights with the people you already like.',
    subheadline:
      'That’s the idea. We’re building Better Hang so friends spend less time coordinating — and more time actually hanging out.',
    missionEyebrow: 'Mission',
    missionHeadline: 'Plan hangouts that fit your people',
    missionSubheadline:
      'We help friends plan thoughtful hangouts from their preferences — who’s coming, where you are, what you want the time to feel like, and what to avoid. Preferences in. A clear local plan out.',
    missionBody:
      'Most hangouts die in the group chat. Not because nobody wants to go out — because nobody wants to own the plan. Better Hang exists to take that friction away.',
    visionEyebrow: 'Vision',
    visionHeadline: 'Fewer “we should hang”s that never happen',
    visionSubheadline:
      'Not a promise that every night will be legendary — a commitment to make intentional planning the default, so fewer evenings default to nowhere.',
    visionBody:
      'Whether it’s two friends or a birthday group, the bar is the same: a plan that fits you, in your city, that you can actually follow through on.',
    ctaHeadline: 'Ready to plan better?',
    ctaSubheadline: 'Take the quiz and get a thoughtful local hangout plan in minutes.',
    ctaButton: 'Start the quiz',
  },
}
