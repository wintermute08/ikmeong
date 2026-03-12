import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostDetail from '@/components/PostDetail'

interface Props {
  params: { id: string }
}

export default async function PostPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Increment views
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .eq('is_deleted', false)
    .single()

  if (!post) notFound()

  // Increment views (fire and forget)
  supabase
    .from('posts')
    .update({ views: (post.views || 0) + 1 })
    .eq('id', post.id)
    .then(() => { })

  // Get comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', post.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  // Check if user liked
  const { data: userLike } = user ? await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', post.id)
    .eq('user_id', user.id)
    .single() : { data: null }

  // Get author profile (for non-anon posts)
  let authorProfile = null
  if (!post.is_anon) {
    const { data } = await supabase
      .from('profiles')
      .select('nickname, grade')
      .eq('id', post.author_id)
      .single()
    authorProfile = data
  }

  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single() : { data: null }

  return (
    <PostDetail
      post={post}
      comments={comments || []}
      userId={user?.id || null}
      userLiked={!!userLike}
      authorProfile={authorProfile}
      isAdmin={profile?.role === 'admin'}
    />
  )
}
