import { NextResponse } from 'next/server'

import { getProduct, getProductId, parsePreferenceProfile, preferenceProfileSchema } from '@betterdate/shared'

import { preferenceProfileToRow, rowToPreferenceProfile } from '@/lib/preferences-db'
import { isAuthConfigured } from '@/lib/supabase/config'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: 'Accounts are not configured.' }, { status: 501 })
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in to save preferences.' }, { status: 401 })
  }

  const product = getProductId()
  const { data, error } = await supabase
    .from('preference_profiles')
    .select('product, my_location, budget, energy, vibes, constraints, default_hang_length')
    .eq('user_id', user.id)
    .eq('product', product)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Could not load preferences.' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ profile: null })
  }

  const parsed = preferenceProfileSchema.safeParse(rowToPreferenceProfile(data))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Saved preferences are invalid.' }, { status: 500 })
  }

  return NextResponse.json({ profile: parsed.data })
}

export async function PUT(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: 'Accounts are not configured.' }, { status: 501 })
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in to save preferences.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const product = getProduct()
  const parsed = parsePreferenceProfile(product.id, body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid preferences.', details: parsed.error.flatten() }, { status: 400 })
  }

  const { error } = await supabase.from('preference_profiles').upsert(preferenceProfileToRow(user.id, parsed.data), {
    onConflict: 'user_id,product',
  })

  if (error) {
    return NextResponse.json({ error: 'Could not save preferences.' }, { status: 500 })
  }

  return NextResponse.json({ profile: parsed.data })
}
