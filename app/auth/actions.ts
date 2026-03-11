'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// 로그인
export async function login(username: string, password: string) {
  const supabase = createClient()

  const dummyEmail = `${username.trim().toLowerCase()}@ikmeong.local`

  const { error } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // 로그인 성공 → 홈 이동
  redirect('/')
}


// 회원가입
export async function signup(
  username: string,
  password: string,
  nickname: string,
  grade: string
) {
  const supabase = createClient()

  const dummyEmail = `${username.trim().toLowerCase()}@ikmeong.local`

  const { data, error } = await supabase.auth.signUp({
    email: dummyEmail,
    password,
    options: {
      data: {
        nickname,
        grade: grade ? parseInt(grade) : null,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // profiles 테이블 생성
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: dummyEmail,
      nickname,
      grade: grade ? parseInt(grade) : null,
      role: 'student',
    })

    if (profileError) {
      return { error: profileError.message }
    }
  }

  return { success: true }
}


// 로그아웃
export async function logout() {
  const supabase = createClient()

  await supabase.auth.signOut()

  redirect('/auth/login')
}