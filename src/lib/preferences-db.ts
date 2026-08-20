import type { PreferenceProfile } from '@betterdate/shared'

type PreferenceRow = {
  product: string
  my_location: string
  budget: string
  energy: string
  vibes: string[] | null
  constraints: string
  default_hang_length: string | null
}

export function rowToPreferenceProfile(row: PreferenceRow): unknown {
  const base = {
    product: row.product,
    myLocation: row.my_location,
    budget: row.budget,
    energy: row.energy,
    vibes: row.vibes ?? [],
    constraints: row.constraints,
  }

  if (row.product === 'friends') {
    return {
      ...base,
      defaultHangLength: row.default_hang_length ?? undefined,
    }
  }

  return base
}

export function preferenceProfileToRow(userId: string, profile: PreferenceProfile) {
  return {
    user_id: userId,
    product: profile.product,
    my_location: profile.myLocation,
    budget: profile.budget,
    energy: profile.energy,
    vibes: profile.vibes,
    constraints: profile.constraints,
    default_hang_length: profile.product === 'friends' ? (profile.defaultHangLength ?? null) : null,
    updated_at: new Date().toISOString(),
  }
}
