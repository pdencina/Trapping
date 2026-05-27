// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Error al verificar email')}`)
    }

    // Obtener perfil del usuario recién confirmado
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('documento, validado, role')
        .eq('id', user.id)
        .single()

      // Admin → dashboard directo
      if (profile?.role === 'Admin') {
        return NextResponse.redirect(`${origin}/dashboard`)
      }

      // Sin documentos → ir a KYC
      if (!profile?.documento) {
        return NextResponse.redirect(`${origin}/register/kyc`)
      }

      // Con documentos pero pendiente → pending
      if (profile?.validado !== 1) {
        return NextResponse.redirect(`${origin}/pending`)
      }

      // Todo ok → dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
