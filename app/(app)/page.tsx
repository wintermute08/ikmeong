import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PostCard from '@/components/PostCard'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, grade')
    .eq('id', user!.id)
    .single()

  const { data: pinnedNotices } = await supabase
    .from('posts')
    .select('*')
    .eq('board', 'notice')
    .eq('is_pinned', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(2)

  const { data: latestPosts } = await supabase
    .from('posts')
    .select('*')
    .in('board', ['anon', 'qna'])
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: hotPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('is_deleted', false)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('likes', { ascending: false })
    .limit(3)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 6) return '야자 중이에요?'
    if (h < 10) return '좋은 아침이에요'
    if (h < 14) return '오늘 급식 기대되나요?'
    if (h < 18) return '오후도 파이팅!'
    if (h < 22) return '저녁 먹었나요?'
    return '늦게까지 공부 중이에요?'
  }

  return (
    <div className="page-enter">
      {/* Header greeting */}
      <div className="page-pad pt-5 pb-4">
        <p className="caption mb-0.5">{greeting()} 👋</p>
        <h1 className="h1">{profile?.nickname || '학생'}님</h1>
      </div>

      {/* Pinned notices */}
      {pinnedNotices && pinnedNotices.length > 0 && (
        <div className="page-section">
          <div className="bg-accent-light rounded-2xl overflow-hidden">
            {pinnedNotices.map((post, i) => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <div className={`px-4 py-3.5 flex items-center gap-3 ${i > 0 ? 'border-t border-accent/10' : ''} hover:bg-accent/5 transition-colors`}>
                  <span className="text-[11px] font-bold text-accent bg-white px-2 py-0.5 rounded-lg shrink-0">공지</span>
                  <p className="text-[14px] font-semibold text-ink flex-1 truncate">{post.title}</p>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6613F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick menu */}
      <div className="page-section">
        <div className="grid grid-cols-4 gap-3">
          {[
            { href: '/notice', icon: '📢', label: '공지사항' },
            { href: '/board', icon: '💬', label: '익명게시판' },
            { href: '/qna', icon: '🙋', label: '질문게시판' },
            { href: '/files', icon: '📁', label: '자료실' },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div className="bg-white rounded-2xl p-3.5 flex flex-col items-center gap-1.5 shadow-card border border-line hover:shadow-md transition-shadow active:scale-[0.97]">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-semibold text-ink2 text-center leading-tight">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Hot posts */}
      {hotPosts && hotPosts.length > 0 && (
        <section className="page-section">
          <div className="section-head">
            <h2 className="section-title flex items-center gap-1.5">
              <span>🔥</span> 지금 인기글
            </h2>
          </div>
          <div className="list-card">
            {hotPosts.map((post, i) => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <div className={`px-4 py-3.5 flex items-center gap-3 hover:bg-surface/50 transition-colors ${i > 0 ? 'border-t border-line' : ''}`}>
                  <span className={`text-[13px] font-black w-5 text-center ${i === 0 ? 'text-accent' : 'text-ink3'}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-ink truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`tag ${post.board === 'anon' ? 'tag-anon' : 'tag-qna'}`}>
                        {post.board === 'anon' ? '익명' : '질문'}
                      </span>
                      <span className="text-ink3 text-[12px]">❤️ {post.likes}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest posts */}
      <section className="page-section">
        <div className="section-head">
          <h2 className="section-title">최신 글</h2>
          <Link href="/board" className="section-link">더보기</Link>
        </div>
        <div className="list-card">
          {latestPosts && latestPosts.length > 0 ? (
            latestPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="py-12 text-center text-ink3 text-[14px]">
              아직 게시글이 없어요.<br />첫 번째 글을 남겨보세요!
            </div>
          )}
        </div>
      </section>

      <div className="h-6" />
    </div>
  )
}
