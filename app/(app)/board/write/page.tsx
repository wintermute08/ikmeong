'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function WritePage() {
  const router = useRouter()
  const params = useSearchParams()
  const boardParam = params.get('board') as 'notice' | 'anon' | 'qna' || 'anon'

  const [board, setBoard] = useState<'anon' | 'qna'>(boardParam === 'qna' ? 'qna' : 'anon')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('제목을 입력해 주세요.'); return }
    if (!content.trim()) { setError('내용을 입력해 주세요.'); return }
    if (content.length < 5) { setError('내용을 조금 더 작성해 주세요.'); return }

    setLoading(true)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { router.push('/auth/login'); return }

    const { data, error: insertError } = await supabase
      .from('posts')
      .insert({
        board,
        title: title.trim(),
        content: content.trim(),
        author_id: user.id,
        is_anon: board === 'anon',
      })
      .select()
      .single()

    if (insertError) {
      setError('글 등록에 실패했어요. 다시 시도해 주세요.')
      setLoading(false)
      return
    }

    router.push(`/post/${data.id}`)
  }

  return (
    <div className="page-enter">
      <div className="page-pad pt-5 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center hover:bg-surface2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="h2 flex-1">글 쓰기</h1>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary py-2 px-5 text-[14px]"
        >
          {loading ? '등록 중...' : '등록'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="page-pad flex flex-col gap-4">
        {/* Board selector */}
        <div className="flex gap-2">
          {(['anon', 'qna'] as const).map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setBoard(b)}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold border transition-all ${board === b
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-ink2 border-line hover:bg-surface'
                }`}
            >
              {b === 'anon' ? '💬 익명게시판' : '🙋 질문게시판'}
            </button>
          ))}
        </div>

        {board === 'anon' && (
          <div className="bg-purple-50 rounded-xl px-4 py-3 text-[13px] text-purple-700 font-medium flex items-center gap-2">
            <span>🎭</span>
            익명으로 작성돼요. 닉네임이 공개되지 않아요.
          </div>
        )}

        {/* Title */}
        <div>
          <input
            type="text"
            className="input-base text-[16px] font-semibold"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
          />
          <p className="help mt-1.5 text-right">{title.length}/100</p>
        </div>

        {/* Content */}
        <div>
          <textarea
            className="input-base resize-none min-h-[200px] text-[15px] leading-relaxed"
            placeholder="내용을 입력하세요"
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={5000}
          />
          <p className="help mt-1.5 text-right">{content.length}/5000</p>
        </div>

        {error && (
          <div className="alert-error">{error}</div>
        )}

        <div className="bg-surface rounded-xl px-4 py-3 text-[13px] text-ink3 leading-relaxed">
          💡 욕설, 비방, 개인정보 포함 글은 삭제될 수 있어요.
        </div>
      </form>
    </div>
  )
}
