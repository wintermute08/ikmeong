import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PostCard from '@/components/PostCard'

export default async function NoticePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  const isAdmin = profile?.role === 'admin'

  const { data: pinned } = await supabase
    .from('posts')
    .select('*')
    .eq('board', 'notice')
    .eq('is_pinned', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('board', 'notice')
    .eq('is_pinned', false)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="page-enter">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black text-ink">공지사항</h1>
          <p className="text-ink3 text-[13px] mt-0.5">학교 주요 소식</p>
        </div>
        {isAdmin && (
          <Link href="/board/write?board=notice">
            <button className="btn-primary py-2 px-4 text-[13px]">공지 작성</button>
          </Link>
        )}
      </div>

      <div className="px-5 flex flex-col gap-4">
        {pinned && pinned.length > 0 && (
          <div>
            <p className="text-[12px] font-bold text-ink3 mb-2 ml-1">📌 고정 공지</p>
            <div className="bg-white rounded-2xl shadow-card border border-accent/20 overflow-hidden">
              {pinned.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          </div>
        )}

        <div>
          {pinned && pinned.length > 0 && (
            <p className="text-[12px] font-bold text-ink3 mb-2 ml-1">전체 공지</p>
          )}
          <div className="bg-white rounded-2xl shadow-card border border-line overflow-hidden">
            {posts && posts.length > 0 ? (
              posts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="py-16 text-center text-ink3 text-[14px]">공지사항이 없어요</div>
            )}
          </div>
        </div>
      </div>
      <div className="h-6"/>
    </div>
  )
}
