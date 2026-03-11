'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [grade, setGrade] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Basic username validation: alphanumeric, 4 to 15 chars
    const usernameRegex = /^[a-zA-Z0-9]{4,15}$/
    if (!usernameRegex.test(username)) {
      setError('아이디는 영문, 숫자 4~15자로 입력해 주세요.')
      return
    }
    
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 해요.')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }
    setStep(2)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!nickname.trim()) {
      setError('닉네임을 입력해 주세요.')
      return
    }
    if (nickname.length < 2 || nickname.length > 10) {
      setError('닉네임은 2~10자로 입력해 주세요.')
      return
    }

    setLoading(true)

    const dummyEmail = `${username.toLowerCase()}@ikmeong.local`

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dummyEmail,
      password,
      options: {
        data: {
          nickname,
          grade: grade ? parseInt(grade) : null,
        }
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('이미 사용 중인 아이디예요.')
      } else {
        setError('가입 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.')
      }
      setLoading(false)
      return
    }

    // Create profile
    if (authData.user) {
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email: dummyEmail,
        nickname,
        grade: grade ? parseInt(grade) : null,
        role: 'student',
      })
    }

    setStep(3)
    setLoading(false)
  }

  if (step === 3) {
    return (
      <div className="page-enter text-center py-10">
        <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C6613F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="text-[24px] font-black text-ink mb-3">가입 완료!</h2>
        <p className="text-ink2 text-[15px] mb-2">잌명 커뮤니티에 오신 걸 환영해요 🎉</p>
        <p className="text-ink3 text-[13px] mb-8">
          이제 생성하신 아이디로 바로 로그인해 보세요!
        </p>
        <Link href="/auth/login">
          <button className="btn-primary w-full">로그인하기</button>
        </Link>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div className="mb-8 mt-6">
        <Link href="/auth/login" className="text-ink3 text-[14px] flex items-center gap-1 mb-6 hover:text-ink2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          돌아가기
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1,2].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-accent' : 'bg-line'}`}/>
          ))}
        </div>

        <h1 className="text-[24px] font-black text-ink">
          {step === 1 ? '계정 만들기' : '프로필 설정'}
        </h1>
        <p className="text-ink3 text-[14px] mt-1">
          {step === 1 ? '사용할 아이디와 비밀번호를 입력해 주세요' : '어떻게 불러드릴까요?'}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1} className="flex flex-col gap-3">
          <div>
            <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">아이디</label>
            <input
              type="text"
              className="input-base"
              placeholder="영문, 숫자 4~15자"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">비밀번호</label>
            <input
              type="password"
              className="input-base"
              placeholder="8자 이상 입력"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">비밀번호 확인</label>
            <input
              type="password"
              className="input-base"
              placeholder="비밀번호를 다시 입력"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-[13px] font-medium px-4 py-3 rounded-xl">{error}</div>
          )}
          <button type="submit" className="btn-primary w-full mt-2">다음</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <div>
            <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">닉네임</label>
            <input
              type="text"
              className="input-base"
              placeholder="2~10자로 입력"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={10}
              required
            />
            <p className="text-ink3 text-[12px] mt-1.5 ml-1">익명 게시판에서도 닉네임은 표시되지 않아요</p>
          </div>
          <div>
            <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">학년 <span className="text-ink3 font-normal">(선택)</span></label>
            <select
              className="input-base"
              value={grade}
              onChange={e => setGrade(e.target.value)}
            >
              <option value="">선택 안 함</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </select>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-[13px] font-medium px-4 py-3 rounded-xl">{error}</div>
          )}
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? '가입 중...' : '가입 완료'}
          </button>
        </form>
      )}

      <p className="text-center text-ink3 text-[12px] mt-6 leading-relaxed">
        가입 시 <span className="text-ink2 font-medium">이용약관</span> 및{' '}
        <span className="text-ink2 font-medium">개인정보처리방침</span>에 동의하게 됩니다
      </p>
    </div>
  )
}
