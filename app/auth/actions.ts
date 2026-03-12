'use server'

import { createClient } from '@/lib/supabase/server'

import { redirect } from 'next/navigation'

export async function login(username: string, password: string) {
  const supabase = createClient()
  const trimmedUsername = username.trim().toLowerCase()
  const dummyEmail = `${trimmedUsername}@ikmeong.local`

  const { error } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: '아이디 또는 비밀번호가 올바르지 않아요.' }
    }
    return { error: error.message }
  }

  // 성공 시 바로 홈으로 리다이렉트
  // 서버 액션에서의 리다이렉트는 쿠키 동기화를 가장 확실하게 보장합니다.
  redirect('/')
}

export async function signup(
  username: string,
  password: string,
  nickname: string,
  grade: string
) {
  const supabase = createClient()
  const trimmedUsername = username.trim().toLowerCase()
  const dummyEmail = `${trimmedUsername}@ikmeong.local`

  // 1. Auth 회원가입
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: dummyEmail,
    password,
    options: {
      data: {
        nickname,
        grade: grade ? parseInt(grade) : null,
      },
    },
  })

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      return { error: '이미 사용 중인 아이디예요.' }
    }
    return { error: signUpError.message }
  }

  // 2. Profile 생성 (Auth 유저가 정상 생성된 경우)
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: dummyEmail,
      nickname: nickname.trim(),
      grade: grade ? parseInt(grade) : null,
      role: 'student',
    })

    if (profileError) {
      console.error('Profile creation failed:', profileError)
      // 프로필 생성 실패 시에도 일단 가입은 된 것이므로 성공으로 간주하거나, 
      // 혹은 유저에게 알릴 수 있음. 여기서는 일단 성공으로 반환.
    }
  }

  return { success: true }
}

export async function logout() {
  const supabase = createClient()

  await supabase.auth.signOut()

  redirect('/auth/login')
}

