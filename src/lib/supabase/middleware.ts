import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const publicPaths = ['/', '/auth/signin', '/auth/signup', '/auth/callback']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path)

  // Only call getUser for protected routes - this is the expensive network call
  let user = null
  if (!isPublicPath || request.nextUrl.pathname === '/auth/signin' || request.nextUrl.pathname === '/auth/signup') {
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    return NextResponse.redirect(url)
  }

  if (user && (request.nextUrl.pathname === '/auth/signin' || request.nextUrl.pathname === '/auth/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
