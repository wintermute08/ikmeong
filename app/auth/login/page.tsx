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
      setError('아이디를 입력하세요.')
      return
    }

    setLoading(true)

    try {
      const res = await login(username, password)

      if (res?.error) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.')
        setLoading(false)
        return
      }

      router.push('/')
    } catch {
      setError('서버 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6 text-center">잌명 로그인</h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-3 rounded"
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded"
        />

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-3 rounded"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <Link href="/auth/signup">
        <button className="mt-4 w-full border p-3 rounded">
          회원가입
        </button>
      </Link>
    </div>
  )
}
