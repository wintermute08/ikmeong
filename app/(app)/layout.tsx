import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import TopBar from '@/components/TopBar'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const debugAuth = process.env.DEBUG_AUTH === '1'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (debugAuth) {
    console.log('[auth-debug][app-layout]', { hasUser: Boolean(user) })
  }

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="app-shell">
      <TopBar profile={profile} />
      <main className="app-main">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
