import { randomBytes } from 'node:crypto'
import { cache } from 'react'

import { datePlanSchema, type DatePlan, type PlanQuizAnswers, type ProductId } from '@betterdate/shared'

/** Sample plan so /p/demo works without a database. Matches the website mockup. */
export const DEMO_PLAN: DatePlan = {
  title: 'Sushi & a slow walk',
  summary:
    'A cozy first date halfway between Orleans and the Glebe. Easy conversation, nothing too loud, and a walk to end on.',
  estimatedCost: '$$ · about $70',
  duration: 'Fri, Oct 30 · 7–10 PM',
  stops: [
    {
      order: 1,
      name: 'Sushi Kaze',
      neighborhood: 'Elgin St',
      category: 'food',
      timeHint: '7:00',
      whyItFits: 'Ask for a booth by the window. Quiet enough to talk, and the omakase is easy to share.',
      tip: 'Reserve ahead on Fridays.',
      address: '342 Elgin St',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sushi+Kaze+Elgin+Street+Ottawa',
      rating: 4.7,
    },
    {
      order: 2,
      name: 'Walk along the Rideau Canal',
      neighborhood: 'Canal',
      category: 'walk',
      timeHint: '8:30',
      whyItFits: 'Walking side by side takes the pressure off if conversation slows down.',
      tip: 'The path is lit. 10 minutes.',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rideau+Canal+Ottawa',
    },
    {
      order: 3,
      name: 'Little Victories Coffee',
      neighborhood: 'Elgin St',
      category: 'drink',
      timeHint: '9:15',
      whyItFits: 'An easy place to end, or to keep going if it’s going well.',
      tip: 'Open till 11.',
      address: 'Little Victories Coffee, Elgin St',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Little+Victories+Coffee+Ottawa',
      rating: 4.6,
    },
  ],
  conversationStarters: [
    "What's a trip you're still thinking about?",
    "What's something you've gotten into recently?",
  ],
  backupIdea:
    'If it rains, skip the walk and head to the National Arts Centre café. It’s covered and two minutes away.',
  disclaimer: 'Places come from Google Maps. Check hours and reservations before you go.',
}

import { createClient } from '@supabase/supabase-js'

import { getAdminSupabaseClient } from '@/lib/supabase/admin'
import { getSupabasePublicEnv } from '@/lib/supabase/config'

function getReadableSupabase() {
  const admin = getAdminSupabaseClient()
  if (admin) return admin

  const env = getSupabasePublicEnv()
  if (!env) return null
  return createClient(env.url, env.anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

const ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'

/** Short, unguessable id for plan links (no look-alike characters like 0/o or 1/l). */
function newPlanId(length = 10): string {
  const bytes = randomBytes(length)
  return Array.from(bytes, (byte) => ID_ALPHABET[byte % ID_ALPHABET.length]).join('')
}

export type SavedPlan = {
  id: string
  product: ProductId
  plan: DatePlan
  createdAt: string
  dateNumber: number | null
}

export type SavedPlanRef = {
  id: string
  dateNumber: number | null
}

async function bumpDatesPlanned(product: ProductId): Promise<number | null> {
  const supabase = getAdminSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase.rpc('bump_dates_planned', { p_product: product })
  if (error) {
    console.error('Failed to bump dates planned', error)
    return null
  }
  return typeof data === 'number' ? data : null
}

/** Public ticker total. 0 when the database isn’t configured or the counter table isn’t there yet. */
export async function getDatesPlanned(product: ProductId): Promise<number> {
  const supabase = getReadableSupabase()
  if (!supabase) return 0

  const { data, error } = await supabase.from('plan_counters').select('dates_planned').eq('product', product).maybeSingle()
  if (!error && data && typeof data.dates_planned === 'number') {
    return data.dates_planned
  }

  const counted = await supabase.from('plans').select('id', { count: 'exact', head: true }).eq('product', product)
  if (counted.error) return 0
  return counted.count ?? 0
}

/** Returns the new plan id, or null when the database isn't configured or the insert fails. */
export async function savePlan(params: {
  product: ProductId
  plan: DatePlan
  answers?: PlanQuizAnswers
  userId?: string | null
}): Promise<SavedPlanRef | null> {
  const supabase = getAdminSupabaseClient()
  if (!supabase) return null

  const id = newPlanId()
  const dateNumber = await bumpDatesPlanned(params.product)
  const row: Record<string, unknown> = {
    id,
    product: params.product,
    plan: params.plan,
    answers: params.answers ?? null,
    user_id: params.userId ?? null,
  }
  if (dateNumber != null) row.date_number = dateNumber

  const { error } = await supabase.from('plans').insert(row)
  if (error) {
    if (dateNumber != null) {
      const retry = await supabase.from('plans').insert({
        id,
        product: params.product,
        plan: params.plan,
        answers: params.answers ?? null,
        user_id: params.userId ?? null,
      })
      if (!retry.error) return { id, dateNumber: null }
    }
    console.error('Failed to save plan', error)
    return null
  }
  return { id, dateNumber }
}

export const getPlan = cache(async function getPlan(id: string): Promise<SavedPlan | null> {
  if (id === 'demo') {
    return { id: 'demo', product: 'date', plan: DEMO_PLAN, createdAt: '2026-10-28T00:00:00.000Z', dateNumber: null }
  }

  const supabase = getAdminSupabaseClient()
  if (!supabase || !/^[a-z0-9]{6,20}$/.test(id)) return null

  const queried = await supabase
    .from('plans')
    .select('id, product, plan, created_at, date_number')
    .eq('id', id)
    .maybeSingle()
  const data =
    queried.data ??
    (
      await supabase.from('plans').select('id, product, plan, created_at').eq('id', id).maybeSingle()
    ).data
  if (queried.error && !data) {
    console.error('Failed to load plan', queried.error)
    return null
  }
  if (!data) return null

  const parsed = datePlanSchema.safeParse(data.plan)
  if (!parsed.success) return null

  const dateNumber = 'date_number' in data && typeof data.date_number === 'number' ? data.date_number : null
  return { id: data.id, product: data.product as ProductId, plan: parsed.data, createdAt: data.created_at, dateNumber }
})
