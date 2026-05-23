// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas que requieren estar autenticado
const PROTECTED_ROUTES = ['/dashboard', '/transferir', '/operaciones', '/contactos', '/billetera', '/simulador', '/perfil', '/admin']

// Rutas solo para admin
const ADMIN_ROUTES = ['/admin']

// Rutas públicas (no redirigir si ya está autenticado)
const AUTH_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresca sesión
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Sin sesión → redirigir a login si intenta acceder a rutas protegidas
  if (!user && PROTECTED_ROUTES.some(r => path.startsWith(r))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Con sesión → obtener profile para validaciones adicionales
  if (user) {
    // Si intenta entrar a rutas de auth → redirigir al dashboard
    if (AUTH_ROUTES.some(r => path === r)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Verificar validado y role para rutas protegidas
    if (PROTECTED_ROUTES.some(r => path.startsWith(r))) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('validado, role')
        .eq('id', user.id)
        .single()

      if (profile) {
        // Admin routes: solo Admin
        if (ADMIN_ROUTES.some(r => path.startsWith(r)) && profile.role !== 'Admin') {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          return NextResponse.redirect(url)
        }

        // Usuario no validado → solo puede ir a /pending y /perfil
        if (profile.validado !== 1 && profile.role !== 'Admin') {
          const allowedWhenPending = ['/pending', '/perfil']
          if (!allowedWhenPending.some(r => path.startsWith(r))) {
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
