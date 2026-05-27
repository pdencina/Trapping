// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas que requieren estar logueado
const PROTECTED_ROUTES = ['/dashboard', '/transferir', '/operaciones', '/contactos', '/billetera', '/simulador', '/perfil', '/admin']
// Rutas solo admin
const ADMIN_ROUTES = ['/admin']
// Rutas de auth (redirigir al dashboard si ya está logueado)
const AUTH_ROUTES = ['/login']
// Rutas KYC — accesibles con cualquier estado de validación
const KYC_ROUTES = ['/register/kyc', '/kyc', '/pending', '/perfil']

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

  // Sin sesión → redirigir a login si intenta acceder a rutas protegidas
  if (!user && PROTECTED_ROUTES.some(r => path.startsWith(r))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Sin sesión → KYC routes también requieren sesión
  if (!user && KYC_ROUTES.filter(r => r !== '/register').some(r => path.startsWith(r))) {
    // /register/kyc y /kyc/* necesitan sesión — si no hay, login
    if (path.startsWith('/register/kyc') || path.startsWith('/kyc/')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  if (user) {
    // Logueado en login → dashboard
    if (AUTH_ROUTES.some(r => path === r)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Para rutas protegidas Y rutas KYC → verificar estado del perfil
    const needsProfileCheck = 
      PROTECTED_ROUTES.some(r => path.startsWith(r)) ||
      path.startsWith('/register/kyc') ||
      path.startsWith('/kyc/')

    if (needsProfileCheck) {
      const { data: profile } = await supabase
        .from('profiles').select('validado, role, documento').eq('id', user.id).single()

      if (profile) {
        // Solo admin puede acceder a rutas admin
        if (ADMIN_ROUTES.some(r => path.startsWith(r)) && profile.role !== 'Admin') {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          return NextResponse.redirect(url)
        }

        // Usuario pendiente de validación
        if (profile.validado !== 1 && profile.role !== 'Admin') {
          // Siempre puede acceder a KYC, pending y perfil
          if (KYC_ROUTES.some(r => path.startsWith(r))) {
            return supabaseResponse // dejar pasar
          }
          // Cualquier otra ruta protegida → mandar a pending o kyc
          if (PROTECTED_ROUTES.some(r => path.startsWith(r))) {
            const url = request.nextUrl.clone()
            // Si no tiene documentos → ir a kyc primero
            url.pathname = !profile.documento ? '/register/kyc' : '/pending'
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
