import { NextResponse } from 'next/server'

import { isAuthConfigured } from '@/lib/supabase/config'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const url = new URL(request.url)

  if (isAuthConfigured()) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
  }

  return NextResponse.redirect(new URL('/', url.origin), { status: 303 })
}
