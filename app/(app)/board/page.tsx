import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PostCard from '@/components/PostCard'

interface Props {
  searchParams: { page?: string; q?: string }
}

export default async function BoardPage({ searchParams }: Props) {
  const supabase = createClient()
  const page = parseInt(searchParams.page || '1')
  const q = searchParams.q || ''
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('board', 'anon')
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (q) {
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`)
  }

  const { data: posts, count } = await query
  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-[22px] font-black text-ink">익명게시판</h1>
        <p className="text-ink3 text-[13px] mt-0.5">솔직하게 이야기해요</p>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <form method="GET">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              name="q"
              defaultValue={q}
              className="input-base pl-11 pr-4"
              placeholder="검색어를 입력하세요"
            />
          </div>
        </form>
      </div>

      {/* Posts */}
      <div className="px-5">
        <div className="bg-white rounded-2xl shadow-card border border-line overflow-hidden">
          {posts && posts.length > 0 ? (
            posts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="py-16 text-center">
              <p className="text-ink3 text-[14px]">{q ? `"${q}" 검색 결과가 없어요` : '아직 게시글이 없어요'}</p>
              {!q && <p className="text-ink3 text-[13px] mt-1">첫 번째 글을 남겨보세요!</p>}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Link
                key={p}
                href={`/board?page=${p}${q ? `&q=${q}` : ''}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-[14px] font-semibold transition-colors ${
                  p === page ? 'bg-accent text-white' : 'bg-white text-ink2 border border-line hover:bg-surface'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="h-6"/>

      {/* FAB */}
      <Link href="/board/write">
        <button className="fixed bottom-24 right-5 w-14 h-14 bg-accent text-white rounded-2xl shadow-modal flex items-center justify-center hover:opacity-90 active:scale-95 transition-all z-10">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </Link>
    </div>
  )
}
