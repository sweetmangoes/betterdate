import { createBrowserClient } from '@supabase/ssr'

import { getSupabasePublicEnv } from '@/lib/supabase/config'

export function createBrowserSupabaseClient() {
  const env = getSupabasePublicEnv()
  if (!env) {
    throw new Error('Supabase is not configured.')
  }

  return createBrowserClient(env.url, env.anonKey)
}
