import { createClient } from '@/lib/supabase/server'
import FilesClient from '@/components/FilesClient'

export default async function FilesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()

  const { data: files } = await supabase
    .from('files')
    .select('*')
    .order('created_at', { ascending: false })

  return <FilesClient files={files || []} isAdmin={profile?.role === 'admin'} userId={user!.id} />
}
