// src/app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const Schema = z.object({
  name: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  rut: z.string().min(1),
  celular: z.string().min(1),
  tipo_documento_id: z.coerce.number().min(1),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = Schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos: ' + parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { name: parsed.data.name },
    },
  })

  if (error) {
    const msg = error.message.includes('already registered')
      ? 'Este email ya está registrado'
      : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Cuando "Confirm email" está ON, Supabase puede retornar user=null
  // si el email ya fue enviado recientemente (rate limit interno)
  // En ese caso igual fue exitoso — tratar como éxito
  if (!data.user) {
    return NextResponse.json({
      success: true,
      needsEmailConfirm: true,
      note: 'email_queued'
    })
  }

  const userId = data.user.id

  // Guardar datos del perfil
  const service = createServiceClient()
  await service.from('profiles').update({
    name: parsed.data.name,
    lastname: parsed.data.lastname,
    rut: parsed.data.rut,
    celular: parsed.data.celular,
    tipo_documento_id: parsed.data.tipo_documento_id,
    terms: true,
    validado: 0,
    role: 'User',
  }).eq('id', userId)

  return NextResponse.json({
    success: true,
    userId,
    needsEmailConfirm: !data.user.email_confirmed_at
  })
}
