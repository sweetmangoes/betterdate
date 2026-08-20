import { NextResponse } from 'next/server'

import { safeNextPath } from '@/lib/auth-path'
import { isAuthConfigured } from '@/lib/supabase/config'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = safeNextPath(url.searchParams.get('next'))

  if (!isAuthConfigured()) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  const code = url.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=auth&next=${encodeURIComponent(next)}`, url.origin))
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=auth&next=${encodeURIComponent(next)}`, url.origin))
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
