import { formatCandidateList, type PlanCandidate } from '../candidates'
import type { ProductConfig } from '../product'
import {
  audienceOptions,
  budgetOptions,
  dateQuizAnswersSchema,
  emptyQuizAnswers,
  energyOptions,
  getMeetingAreaLabel,
  getMeetingNote,
  isDateQuizAnswers,
  meetingPreferenceOptions,
  occasionOptions,
  PLAN_STORAGE_KEY,
  quizSteps,
  QUIZ_STORAGE_KEY,
  timeOptions,
  vibeOptions,
  type DateQuizAnswers,
  type PlanQuizAnswers,
} from '../quiz'

function buildDateSearchQueries(answers: DateQuizAnswers, areaLabel: string): string[] {
  const queries: string[] = []
  const inArea = areaLabel

  for (const vibe of answers.vibes) {
    switch (vibe) {
      case 'foodie':
        queries.push(`best restaurants ${inArea}`)
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
        queries.push(`fun date activities or entertainment ${inArea}`)
        break
    }
  }

  if (answers.time === 'evening' || answers.time === 'flexible') {
    queries.push(`cocktail bars or dessert spots ${inArea}`)
  }
  if (answers.time === 'morning' || answers.time === 'afternoon') {
    queries.push(`brunch cafes or daytime date spots ${inArea}`)
  }
  if (answers.energy === 'adventurous') {
    queries.push(`unique experiences or activities ${inArea}`)
  }
  if (answers.energy === 'low_key') {
    queries.push(`quiet intimate restaurants ${inArea}`)
  }

  if (!queries.some((q) => q.includes('restaurant') || q.includes('cafe'))) {
    queries.push(`restaurants ${inArea}`)
  }

  return [...new Set(queries)].slice(0, 4)
}

function buildDatePlanPrompt(answers: DateQuizAnswers, candidates?: PlanCandidate[]): string {
  const audienceLabel = answers.audience === 'first_date' ? 'a first date' : 'an established couple'
  const vibeList = answers.vibes.join(', ')
  const constraints = answers.constraints?.trim() || 'None noted'
  const areaLabel = getMeetingAreaLabel(answers)
  const meetingNote = getMeetingNote(answers)

  if (candidates && candidates.length > 0) {
    return `You are Better Date, an expert local date planner.

Plan ${audienceLabel} ${areaLabel}.

Meeting preference: ${answers.meetingPreference}
${meetingNote}

Preferences:
- Occasion: ${answers.occasion}
- Budget: ${answers.budget}
- Time of day: ${answers.time}
- Energy: ${answers.energy}
- Vibes: ${vibeList}
- Constraints: ${constraints}

You MUST build the itinerary using ONLY venues from this candidate list. Copy each stop's placeId exactly.
Do not invent venues, names, or placeIds.

CANDIDATES:
${formatCandidateList(candidates)}

Rules:
- Choose 3–4 stops with distinct placeIds from the list above.
- Prefer a walkable sequence in a sensible order for the chosen time of day.
- Match budget and energy. For first dates, keep it low-pressure. For couples, make it intentional.
- Do not invent confirmation of reservations, hours, or live availability.
- Include conversation starters (especially strong ones for first dates).
- Include one backup idea that names a weather-friendly pivot using a venue name from the list (never placeIds — those are internal only).
- Set disclaimer to remind the user to verify hours/reservations; venues come from Google Places and should be double-checked.
- Keep copy warm, specific, and concise. User-facing fields (title, summary, tips, backupIdea, conversation starters, disclaimer) must never include placeIds.`
  }

  return `You are Better Date, an expert local date planner.

Plan ${audienceLabel} ${areaLabel}.

Meeting preference: ${answers.meetingPreference}
${meetingNote}

Preferences:
- Occasion: ${answers.occasion}
- Budget: ${answers.budget}
- Time of day: ${answers.time}
- Energy: ${answers.energy}
- Vibes: ${vibeList}
- Constraints: ${constraints}

Rules:
- Suggest 3–4 real-feeling named places (restaurants, cafes, parks, museums, bars, walks) that fit the meeting area.
- Prefer a walkable sequence in a sensible order for the chosen time of day.
- Match budget and energy. For first dates, keep it low-pressure with easy conversation. For couples, make it intentional and thoughtful.
- Do not invent confirmation of reservations, hours, or live availability.
- Include conversation starters (especially strong ones for first dates).
- Include one backup idea if weather or crowds get in the way.
- Set disclaimer to remind the user to verify hours, reservations, and that venue suggestions are AI-generated.
- Keep copy warm, specific, and concise — no generic filler.`
}

export const dateProduct: ProductConfig = {
  id: 'date',
  name: 'Better Date',
  description:
    'Eliminate bad dates. Plan thoughtful, intentional nights from your preferences — toward a world without bad dates.',
  titleDefault: 'Better Date — AI date plans for first dates and couples',
  planStorageKey: PLAN_STORAGE_KEY,
  quizStorageKey: QUIZ_STORAGE_KEY,
  ctaLabel: 'Plan a date',
  conversationStartersLabel: 'Conversation starters',
  planEyebrow: 'Your date plan',
  emptyPlanMessage: 'Take the preference quiz and we’ll build a local date plan for you.',
  footerFineprint: '© 2026 Better Date. Venue suggestions are AI-generated — always verify hours and reservations.',
  quizPageTitle: 'Plan a date',
  quizPageDescription:
    'Answer a short preference quiz and get a thoughtful local date plan for a first date or couples night.',
  planPageTitle: 'Your date plan',
  planPageDescription: 'Your personalized Better Date itinerary.',
  aboutPageDescription:
    'Better Date’s mission is to eliminate bad dates by helping plan thoughtful, intentional dates from your preferences. Our vision is a world without bad dates.',
  privacyPageDescription: 'How Better Date collects, uses, and protects information when you use the service.',
  constraintsPlaceholder: 'Vegetarian, avoid loud bars, prefer indoor if raining…',
  locationYourLabel: 'Your location',
  locationTheirLabel: 'Their location',
  locationNeighborhoodLabel: 'Neighborhood or city',
  errorMissingApiKey: 'Missing OPENAI_API_KEY. Add it to .env.local to generate date plans.',
  errorCouldNotGenerate: 'Could not generate a date plan. Please try again in a moment.',
  errorInvalidPlan: 'Received an invalid date plan from the server.',
  schemaName: 'DatePlan',
  schemaDescription: 'A multi-stop local date itinerary',
  groundedSchemaName: 'GroundedDatePlan',
  groundedSchemaDescription: 'A date itinerary using only provided Google Places IDs',
  planSystemPrompt:
    'You plan thoughtful local dates. Return only structured data that matches the schema. When candidates are provided, only use those placeIds. Never claim you have booked anything.',
  groundedPlanSystemPrompt:
    'You plan thoughtful local dates using only the provided Google Places candidates. Every stop must use a real placeId from the list. Never invent venues. Never put placeIds in user-facing copy — use venue names only.',
  emptyQuizAnswers,
  parseQuizAnswers: (body: unknown) => {
    const parsed = dateQuizAnswersSchema.safeParse(body)
    if (!parsed.success) {
      return { success: false, error: parsed.error }
    }
    return { success: true, data: parsed.data }
  },
  getQuizSteps: () => quizSteps,
  audienceOptions,
  getMeetingPreferenceOptions: () => meetingPreferenceOptions,
  occasionOptions,
  vibeOptions,
  budgetOptions,
  timeOptions,
  energyOptions,
  buildPlanPrompt: (answers: PlanQuizAnswers, candidates?: PlanCandidate[]) => {
    if (!isDateQuizAnswers(answers)) {
      throw new Error('Date product received friends quiz answers.')
    }
    return buildDatePlanPrompt(answers, candidates)
  },
  buildSearchQueries: (answers: PlanQuizAnswers, areaLabel: string) => {
    if (!isDateQuizAnswers(answers)) {
      throw new Error('Date product received friends quiz answers.')
    }
    return buildDateSearchQueries(answers, areaLabel)
  },
  landing: {
    eyebrow: 'Better Date',
    headline: 'Intentional dates, planned for where you are.',
    subheadline:
      'Our mission is to eliminate bad dates by helping you plan thoughtful, intentional nights from your preferences — toward a world without bad dates.',
    howEyebrow: 'How it works',
    howHeadline: 'Three steps to a better date',
    howSubheadline: 'No accounts. No endless scrolling. Just preferences in, a local plan out.',
    steps: [
      {
        headline: '1. Tell us the vibe',
        subheadline:
          'A quick quiz covers audience, city, budget, energy, and constraints so the plan actually fits you.',
      },
      {
        headline: '2. AI plans the night',
        subheadline: 'We turn your answers into a multi-stop itinerary with named places in your neighborhood.',
      },
      {
        headline: '3. Show up ready',
        subheadline: 'Get timing tips, conversation starters, and a backup idea — then verify hours and go.',
      },
    ],
    whoEyebrow: 'Who it’s for',
    whoHeadline: 'Whether it’s date one or date one hundred',
    whoSubheadline: 'Same tool, different tone — dialed to the moment you’re in.',
    whoItems: [
      {
        headline: 'First dates',
        body: 'Low-pressure plans with easy conversation, clear pacing, and venues that make a good first impression — without overthinking the logistics.',
      },
      {
        headline: 'Couples',
        body: 'Bring intentional date nights back. Match energy and budget to something that feels special — not like another default dinner reservation.',
      },
    ],
    ctaHeadline: 'Ready when you are',
    ctaSubheadline: 'Eight questions. One local plan. About five minutes.',
    ctaButton: 'Plan a date',
  },
  about: {
    eyebrow: 'About Better Date',
    headline: 'A world without bad dates.',
    subheadline:
      'That’s our vision. We’re building Better Date so first dates and couples spend less time guessing — and more time actually connecting.',
    missionEyebrow: 'Mission',
    missionHeadline: 'Eliminate bad dates',
    missionSubheadline:
      'We help people plan thoughtful and intentional dates based on their preferences — who they’re with, where they are, what they want the night to feel like, and what to avoid. Preferences in. A clear local plan out.',
    missionBody:
      'Bad dates aren’t usually about the people. They’re about mismatched energy, nowhere good to go, or defaulting to whatever’s easiest. Better Date exists to take that friction away.',
    visionEyebrow: 'Vision',
    visionHeadline: 'A world without bad dates',
    visionSubheadline:
      'Not a promise that every night will be perfect — a commitment to make intentional planning the default, so fewer evenings go to waste.',
    visionBody:
      'Whether it’s date one or date one hundred, the bar is the same: a plan that fits you, in your city, that you can actually follow through on.',
    ctaHeadline: 'Ready to plan better?',
    ctaSubheadline: 'Take the quiz and get a thoughtful local date plan in minutes.',
    ctaButton: 'Start the quiz',
  },
}
