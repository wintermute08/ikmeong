'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/': '잌명',
  '/board': '익명게시판',
  '/notice': '공지사항',
  '/qna': '질문게시판',
  '/files': '자료실',
  '/mypage': '마이페이지',
  '/admin': '관리자',
}

interface Props {
  profile: { nickname: string; role: string } | null
}

export default function TopBar({ profile }: Props) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const title = titles[pathname] || ''

  return (
    <div className="fixed top-0 left-0 right-0 z-20 max-w-[480px] mx-auto">
      <div className="bg-white/80 backdrop-blur-md border-b border-line h-14 flex items-center px-5">
        {isHome ? (
          <>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-[13px]">잌</span>
              </div>
              <span className="h2 text-[18px]">잌명</span>
            </div>
            {profile?.role === 'admin' && (
              <Link href="/admin">
                <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center hover:bg-accent/10 active:scale-[0.98] transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6613F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                  </svg>
                </div>
              </Link>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => window.history.back()}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface active:bg-surface2 active:scale-[0.98] mr-2 -ml-1 transition-all"
              aria-label="뒤로가기"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span className="h2 text-[17px] font-bold">{title}</span>
          </>
        )}
      </div>
    </div>
  )
}
