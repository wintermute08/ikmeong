import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MyPageClient from '@/components/MyPageClient'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)
    .eq('is_deleted', false)

  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)
    .eq('is_deleted', false)

  const { data: myPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <MyPageClient
      profile={profile!}
      postCount={postCount || 0}
      commentCount={commentCount || 0}
      myPosts={myPosts || []}
    />
  )
}
