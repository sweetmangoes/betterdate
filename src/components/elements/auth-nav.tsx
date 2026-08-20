'use client'

import { useEffect, useState } from 'react'

import { PlainButtonLink } from '@/components/elements/button'
import { NavbarLink } from '@/components/sections/navbar-with-links-actions-and-centered-logo'
import { isAuthConfigured } from '@/lib/supabase/config'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

function useAuthNavState() {
  const configured = isAuthConfigured()
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    if (!configured) return

    const supabase = createBrowserSupabaseClient()
    void supabase.auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user))
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user))
    })
    return () => {
      data.subscription.unsubscribe()
    }
  }, [configured])

  if (!configured) return null
  return signedIn
    ? { href: '/account' as const, label: 'Account' }
    : { href: '/login' as const, label: 'Sign in' }
}

export function AuthNav() {
  const item = useAuthNavState()
  if (!item) return null
  return (
    <PlainButtonLink href={item.href} className="max-sm:hidden">
      {item.label}
    </PlainButtonLink>
  )
}

export function AuthNavMobileLink() {
  const item = useAuthNavState()
  if (!item) return null
  return (
    <NavbarLink href={item.href} className="lg:hidden">
      {item.label}
    </NavbarLink>
  )
}
