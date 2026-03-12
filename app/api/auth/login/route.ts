import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { username?: string; password?: string } | null
  const username = body?.username?.trim()
  const password = body?.password ?? ''

  if (!username) {
    return NextResponse.json({ error: '아이디를 입력해 주세요.' }, { status: 400 })
  }

  let response = NextResponse.json({ ok: true })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const dummyEmail = `${username.trim().toLowerCase()}@ikmeong.local`
  const { error } = await supabase.auth.signInWithPassword({ email: dummyEmail, password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return response
}

