import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const cspHeader = [
  "default-src 'self';",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:;",
  "style-src 'self' 'unsafe-inline' https:;",
  "img-src 'self' data: blob: https:;",
  "font-src 'self' https: data:;",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://cdn.jsdelivr.net https:;",
  "frame-src 'self' https://*.supabase.co https://*.supabase.in https://accounts.google.com https://github.com https://api.github.com;",
].join(' ')

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    // If auth check fails, treat as unauthenticated
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublic = isAuthPage || request.nextUrl.pathname === '/favicon.ico'

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.headers.set('Content-Security-Policy', cspHeader)
    return redirectResponse
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.headers.set('Content-Security-Policy', cspHeader)
    return redirectResponse
  }

  supabaseResponse.headers.set('Content-Security-Policy', cspHeader)
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

