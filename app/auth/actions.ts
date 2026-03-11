'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(username: string, password: string) {
  try {
    const supabase = createClient()

    const dummyEmail = `${username.trim()}@ikmeong.local`

    const { error } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // 로그인 성공 → 홈 이동
    redirect('/')
  } catch (err: any) {
    console.error('Login action error:', err)
    return { error: err.message || '서버 오류가 발생했습니다.' }
  }
}

export async function signup(
  username: string,
  password: string,
  nickname: string,
  grade: string
) {
  try {
    const supabase = createClient()

    const dummyEmail = `${username.toLowerCase()}@ikmeong.local`

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dummyEmail,
      password,
      options: {
        data: {
          nickname,
          grade: grade ? parseInt(grade) : null,
        },
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    if (authData.user) {
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email: dummyEmail,
        nickname,
        grade: grade ? parseInt(grade) : null,
        role: 'student',
      })
    }

    return { success: true }
  } catch (err: any) {
    console.error('Signup action error:', err)
    return { error: err.message || '서버 오류가 발생했습니다.' }
  }
}

export async function logout() {
  const supabase = createClient()

  await supabase.auth.signOut()

  redirect('/auth/login')
}
