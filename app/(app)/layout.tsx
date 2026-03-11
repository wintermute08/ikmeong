import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import TopBar from '@/components/TopBar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-[480px] mx-auto relative">
      <TopBar profile={profile} />
      <main className="flex-1 pb-24 pt-14 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
