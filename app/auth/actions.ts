'use server'

import { createClient } from '@/lib/supabase/server'

import { redirect } from 'next/navigation'

export async function login(username: string, password: string) {
  const supabase = await createClient()
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

  // Next.js 공식 가이드: 서버 액션에서 성공 시 redirect() 호출
  redirect('/')
}

export async function signup(
  username: string,
  password: string,
  nickname: string,
  grade: string
) {
  const supabase = await createClient()
  const trimmedUsername = username.trim().toLowerCase()
  const dummyEmail = `${trimmedUsername}@ikmeong.local`

  // 1. Auth 회원가입만 수행
  // profiles 테이블 삽입은 DB 트리거(on_auth_user_created)가 담당합니다.
  const { error: signUpError } = await supabase.auth.signUp({
    email: dummyEmail,
    password,
    options: {
      data: {
        nickname: nickname.trim(),
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

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}


