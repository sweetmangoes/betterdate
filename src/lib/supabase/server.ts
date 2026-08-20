import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getSupabasePublicEnv } from '@/lib/supabase/config'

export async function createServerSupabaseClient() {
  const env = getSupabasePublicEnv()
  if (!env) {
    throw new Error('Supabase is not configured.')
  }

  const cookieStore = await cookies()

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from a Server Component — middleware refreshes the session.
        }
      },
    },
  })
}

export async function getAuthUser() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}
