import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const debugAuth = process.env.DEBUG_AUTH === '1'

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  let authError: unknown = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    // Auth check failed — treat as unauthenticated
    authError = true
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublic = isAuthPage || request.nextUrl.pathname === '/favicon.ico'

  if (debugAuth) {
    try {
      const cookieNames = request.cookies.getAll().map(c => c.name)
      const hasSb = cookieNames.some(n => n.startsWith('sb-'))
      console.log('[auth-debug]', {
        path: request.nextUrl.pathname,
        method: request.method,
        hasUser: Boolean(user),
        authError: Boolean(authError),
        cookieCount: cookieNames.length,
        hasSupabaseCookies: hasSb,
        host: request.headers.get('host'),
        proto: request.headers.get('x-forwarded-proto'),
      })
    } catch (e) {
      console.log('[auth-debug] log failed', e)
    }
  }

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    const redirectResponse = NextResponse.redirect(url)
    
    // Pass over Supabase cookies if any were set
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      const { name, value, ...options } = cookie
      redirectResponse.cookies.set(name, value, options)
    })
    
    return redirectResponse
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    const redirectResponse = NextResponse.redirect(url)
    
    // Pass over Supabase cookies if any were set
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      const { name, value, ...options } = cookie
      redirectResponse.cookies.set(name, value, options)
    })

    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

