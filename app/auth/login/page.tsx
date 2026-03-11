'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/app/auth/actions'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || username.includes('@')) {
      setError('올바른 아이디를 입력해 주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await login(username, password)
      if (res?.error) {
        if (res.error.includes('Invalid login credentials')) {
          setError('아이디 또는 비밀번호가 올바르지 않아요.')
        } else {
          setError('로그인 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.')
        }
        setLoading(false)
      }
      // If success, the Server Action redirects. No need to redirect here.
    } catch {
      setError('서버 연결에 실패했어요. 인터넷 연결을 확인해 주세요.')
      setLoading(false)
    }
  }

  return (
    <div className="page-enter">
      {/* Logo */}
      <div className="text-center mb-10 mt-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent rounded-2xl mb-5 shadow-md">
          <span className="text-white font-black text-2xl">잌</span>
        </div>
        <h1 className="text-[28px] font-black text-ink tracking-tight">잌명</h1>
        <p className="text-ink3 text-[14px] mt-1">잌명고등학교 학생 전용 커뮤니티</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <div>
          <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">아이디</label>
          <input
            type="text"
            className="input-base"
            placeholder="아이디를 입력하세요"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">비밀번호</label>
          <input
            type="password"
            className="input-base"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[13px] font-medium px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full mt-2"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              로그인 중...
            </span>
          ) : '로그인'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-line" />
        <span className="text-ink3 text-[13px]">또는</span>
        <div className="flex-1 h-px bg-line" />
      </div>

      <Link href="/auth/signup">
        <button className="btn-secondary w-full">회원가입</button>
      </Link>
    </div>
  )
}
