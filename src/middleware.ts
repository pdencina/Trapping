// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/transferir', '/operaciones', '/contactos', '/billetera', '/simulador', '/perfil', '/admin']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient<any>(
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

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && PROTECTED_ROUTES.some((r: string) => path.startsWith(r))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    if (AUTH_ROUTES.some((r: string) => path === r)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    if (PROTECTED_ROUTES.some((r: string) => path.startsWith(r))) {
      const { data: profile } = await supabase
        .from('profiles').select('validado, role').eq('id', user.id).single()

      if (profile) {
        if (ADMIN_ROUTES.some((r: string) => path.startsWith(r)) && profile.role !== 'Admin') {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          return NextResponse.redirect(url)
        }
        if (profile.validado !== 1 && profile.role !== 'Admin') {
          const allowedWhenPending = ['/pending', '/perfil', '/register/kyc', '/kyc']
          if (!allowedWhenPending.some((r: string) => path.startsWith(r))) {
            const url = request.nextUrl.clone()
            url.pathname = '/pending'
            return NextResponse.redirect(url)
          }
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
