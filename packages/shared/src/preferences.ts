import { z } from 'zod'

import { isFriendsQuizAnswers, type PlanQuizAnswers } from './quiz'

const locationField = z.string().trim().max(120).optional().default('')
const constraintsField = z.string().trim().max(400).optional().default('')

const dateVibes = z
  .array(z.enum(['cozy', 'outdoorsy', 'foodie', 'culture', 'playful']))
  .max(2)

const friendsVibes = z
  .array(z.enum(['cozy', 'outdoorsy', 'foodie', 'culture', 'playful', 'games', 'nightlife']))
  .max(2)

const preferenceBase = {
  myLocation: locationField,
  budget: z.enum(['$', '$$', '$$$']),
  energy: z.enum(['low_key', 'mixed', 'adventurous']),
  constraints: constraintsField,
}

export const datePreferenceProfileSchema = z.object({
  product: z.literal('date'),
  ...preferenceBase,
  vibes: dateVibes,
})

export const friendsPreferenceProfileSchema = z.object({
  product: z.literal('friends'),
  ...preferenceBase,
  vibes: friendsVibes,
  defaultHangLength: z.enum(['few_hours', 'half_night', 'whole_night']).optional(),
})

export const preferenceProfileSchema = z.discriminatedUnion('product', [
  datePreferenceProfileSchema,
  friendsPreferenceProfileSchema,
])

export type DatePreferenceProfile = z.infer<typeof datePreferenceProfileSchema>
export type FriendsPreferenceProfile = z.infer<typeof friendsPreferenceProfileSchema>
export type PreferenceProfile = z.infer<typeof preferenceProfileSchema>

export function parsePreferenceProfile(
  product: 'date' | 'friends',
  body: unknown,
): { success: true; data: PreferenceProfile } | { success: false; error: z.ZodError } {
  const parsed =
    product === 'friends'
      ? friendsPreferenceProfileSchema.safeParse({ ...(typeof body === 'object' && body ? body : {}), product: 'friends' })
      : datePreferenceProfileSchema.safeParse({ ...(typeof body === 'object' && body ? body : {}), product: 'date' })

  if (!parsed.success) {
    return { success: false, error: parsed.error }
  }
  return { success: true, data: parsed.data }
}

/** Person-level fields from a quiz — hang-specific answers are dropped. */
export function preferenceProfileFromQuiz(answers: PlanQuizAnswers): PreferenceProfile {
  if (isFriendsQuizAnswers(answers)) {
    return {
      product: 'friends',
      myLocation: answers.myLocation,
      budget: answers.budget,
      energy: answers.energy,
      vibes: answers.vibes,
      constraints: answers.constraints,
      defaultHangLength: answers.hangLength,
    }
  }

  return {
    product: 'date',
    myLocation: answers.myLocation,
    budget: answers.budget,
    energy: answers.energy,
    vibes: answers.vibes,
    constraints: answers.constraints,
  }
}

/** Prefill person-level quiz fields from a saved profile. Hang-specific answers stay as-is. */
export function applyPreferenceProfile(answers: PlanQuizAnswers, profile: PreferenceProfile): PlanQuizAnswers {
  if (isFriendsQuizAnswers(answers) && profile.product === 'friends') {
    return {
      ...answers,
      myLocation: profile.myLocation || answers.myLocation,
      budget: profile.budget,
      energy: profile.energy,
      vibes: profile.vibes.length > 0 ? profile.vibes : answers.vibes,
      constraints: profile.constraints,
      hangLength: profile.defaultHangLength ?? answers.hangLength,
    }
  }

  if (!isFriendsQuizAnswers(answers) && profile.product === 'date') {
    return {
      ...answers,
      myLocation: profile.myLocation || answers.myLocation,
      budget: profile.budget,
      energy: profile.energy,
      vibes: profile.vibes.length > 0 ? profile.vibes : answers.vibes,
      constraints: profile.constraints,
    }
  }

  return answers
}

export function preferenceProfilesEqual(a: PreferenceProfile, b: PreferenceProfile): boolean {
  if (a.product !== b.product) return false
  if (
    a.myLocation !== b.myLocation ||
    a.budget !== b.budget ||
    a.energy !== b.energy ||
    a.constraints !== b.constraints
  ) {
    return false
  }
  const aVibes = [...a.vibes].sort()
  const bVibes = [...b.vibes].sort()
  if (aVibes.length !== bVibes.length || aVibes.some((vibe, index) => vibe !== bVibes[index])) {
    return false
  }
  if (a.product === 'friends' && b.product === 'friends') {
    return a.defaultHangLength === b.defaultHangLength
  }
  return true
}
