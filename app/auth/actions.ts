'use server'

import { createClient } from '@/lib/supabase/server'

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

  // We no longer redirect from the server action because
  // a Redirect response prevents the client from receiving
  // the result and leaves the form stuck in loading state.
  // Instead, return a success flag and let the client push.
  return { success: true }
}

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

  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: dummyEmail,
      nickname,
      grade: grade ? parseInt(grade) : null,
      role: 'student',
    })
  }

  return { success: true }
}

export async function logout() {
  const supabase = createClient()

  await supabase.auth.signOut()

  return { success: true }
}
