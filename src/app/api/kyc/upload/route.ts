// src/app/api/kyc/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const token = formData.get('token') as string
  const side = formData.get('side') as 'front' | 'back'
  const file = formData.get('file') as File

  if (!token || !side || !file) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const service = createServiceClient()

  // Verificar token válido y no expirado
  const { data: session, error: sessionError } = await service
    .from('kyc_sessions')
    .select('user_id, status, expires_at')
    .eq('token', token)
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  if (new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Sesión expirada. Genera un nuevo QR.' }, { status: 401 })
  }

  // Subir archivo usando service client (bypassa RLS del Storage)
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${session.user_id}/kyc-${side}-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await service.storage
    .from('documentos')
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: `Error subiendo archivo: ${uploadError.message}` }, { status: 500 })
  }

  // Actualizar estado de la sesión KYC
  const newStatus = side === 'front' ? 'front_done' : 'completed'
  const updateData: Record<string, string> = { status: newStatus }
  if (side === 'front') updateData.front_path = path
  if (side === 'back') updateData.back_path = path

  await service.from('kyc_sessions').update(updateData).eq('token', token)

  // Si es el dorso → actualizar profile del usuario
  if (side === 'back') {
    const { data: kycSession } = await service
      .from('kyc_sessions').select('front_path').eq('token', token).single()

    await service.from('profiles').update({
      documento: kycSession?.front_path ?? path,
      foto: path,
    }).eq('id', session.user_id)
  }

  return NextResponse.json({ success: true, path, status: newStatus })
}
