import { redirect } from 'next/navigation'

import { isAuthConfigured } from '@/lib/supabase/config'
import { getAuthUser } from '@/lib/supabase/server'

import { PreferencesForm } from './preferences-form'

export default async function AccountPage() {
  if (!isAuthConfigured()) {
    redirect('/')
  }

  const user = await getAuthUser()
  if (!user) {
    redirect('/login?next=/account')
  }

  return <PreferencesForm email={user.email ?? ''} />
}
