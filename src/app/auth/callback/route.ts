// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // Verificar si el usuario ya completó KYC
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('validado, documento')
        .eq('id', user.id)
        .single()

      // Si no tiene documento cargado → ir a KYC
      if (profile && !profile.documento) {
        return NextResponse.redirect(`${origin}/register/kyc`)
      }
    }
  }

  // Si ya tiene documentos o algo falló → dashboard
  return NextResponse.redirect(`${origin}/dashboard`)
}
