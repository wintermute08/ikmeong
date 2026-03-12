'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/app/auth/actions'

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('아이디를 입력해 주세요.')
      return
    }

    setLoading(true)
    console.log('Login attempt started:', username)

    try {
      const res = await login(username, password)
      
      // 만약 redirect 되지 않고 res가 돌아왔다면 이는 failure case입니다.
      if (res && 'error' in res) {
        setError(res.error)
        setLoading(false)
      }
    } catch (err: any) {
      // Next.js redirect는 내부적으로 에러를 던지지만, 브라우저는 이를 감지해 이동합니다.
      // 만약 catch에 걸렸는데 에러 메시지가 없다면 정상적인 리다이렉트일 가능성이 높습니다.
      console.log('Login action finished (or redirected).')
    }
  }

  return (
    <div className="page-enter">
      <div className="mb-8 mt-6">
        <h1 className="text-[24px] font-black text-ink">로그인</h1>
        <p className="text-ink3 text-[14px] mt-1">아이디와 비밀번호를 입력해 주세요</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <div>
          <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">아이디</label>
          <input
            type="text"
            placeholder="아이디를 입력"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-base"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-base"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[13px] font-medium px-4 py-3 rounded-xl">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-2"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="mt-4">
        <Link href="/auth/signup">
          <button className="btn-secondary w-full">
            회원가입
          </button>
        </Link>
      </div>

      <p className="text-center text-ink3 text-[12px] mt-6 leading-relaxed">
        로그인 문제가 있다면 <span className="text-ink2 font-medium">관리자</span>에게 문의해 주세요
      </p>
    </div>
  )
}
