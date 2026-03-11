'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Profile, Post } from '@/lib/types'
import PostCard from './PostCard'

interface Props {
  profile: Profile
  postCount: number
  commentCount: number
  myPosts: Post[]
}

export default function MyPageClient({ profile, postCount, commentCount, myPosts }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [editMode, setEditMode] = useState(false)
  const [nickname, setNickname] = useState(profile.nickname)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!nickname.trim() || nickname.length < 2) return
    setSaving(true)
    await supabase.from('profiles').update({ nickname: nickname.trim() }).eq('id', profile.id)
    setSaving(false)
    setEditMode(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const gradeLabel = profile.grade ? `${profile.grade}학년` : '학년 미설정'

  return (
    <div className="page-enter">
      {/* Profile card */}
      <div className="px-5 pt-5 pb-4">
        <div className="bg-white rounded-2xl shadow-card border border-line p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div className="flex-1">
              {editMode ? (
                <input
                  className="input-base text-[16px] font-bold py-2 px-3"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  maxLength={10}
                  autoFocus
                />
              ) : (
                <h2 className="text-[18px] font-black text-ink">{profile.nickname}</h2>
              )}
              <p className="text-ink3 text-[13px] mt-0.5">{gradeLabel} · 잌명고등학교</p>
            </div>
            {editMode ? (
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-4 text-[13px]">
                {saving ? '저장 중...' : '저장'}
              </button>
            ) : (
              <button onClick={() => setEditMode(true)} className="btn-secondary py-2 px-4 text-[13px]">
                수정
              </button>
            )}
          </div>

          <p className="text-ink3 text-[13px] mb-4">{profile.email}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl p-3 text-center">
              <p className="text-[22px] font-black text-accent">{postCount}</p>
              <p className="text-ink3 text-[12px] font-medium mt-0.5">작성한 글</p>
            </div>
            <div className="bg-surface rounded-xl p-3 text-center">
              <p className="text-[22px] font-black text-accent">{commentCount}</p>
              <p className="text-ink3 text-[12px] font-medium mt-0.5">작성한 댓글</p>
            </div>
          </div>
        </div>
      </div>

      {/* My posts */}
      {myPosts.length > 0 && (
        <div className="px-5 mb-4">
          <h3 className="text-[14px] font-bold text-ink mb-2">최근 작성한 글</h3>
          <div className="bg-white rounded-2xl shadow-card border border-line overflow-hidden">
            {myPosts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="px-5">
        <div className="bg-white rounded-2xl shadow-card border border-line overflow-hidden">
          <Link href="/files">
            <div className="px-4 py-4 flex items-center gap-3 border-b border-line hover:bg-surface/50 transition-colors">
              <span className="text-xl">📁</span>
              <span className="text-[15px] font-medium text-ink flex-1">자료실</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </Link>
          <div
            onClick={handleLogout}
            className="px-4 py-4 flex items-center gap-3 cursor-pointer hover:bg-surface/50 transition-colors"
          >
            <span className="text-xl">👋</span>
            <span className="text-[15px] font-medium text-red-500 flex-1">로그아웃</span>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6">
        <p className="text-ink3 text-[12px] text-center leading-relaxed">
          잌명고등학교 학생 전용 서비스입니다<br/>
          문의: ikmeong@school.kr
        </p>
      </div>

      <div className="h-6"/>
    </div>
  )
}
