// src/app/api/kyc/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const token = formData.get('token') as string
  const side = formData.get('side') as 'front' | 'back' | 'selfie'
  const file = formData.get('file') as File

  if (!token || !side || !file) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const service = createServiceClient()

  // Verificar token válido
  const { data: session, error: sessionError } = await service
    .from('kyc_sessions')
    .select('user_id, status, expires_at, front_path, back_path')
    .eq('token', token)
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }
  if (new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Sesión expirada. Genera un nuevo QR.' }, { status: 401 })
  }

  // Subir archivo usando service client
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${session.user_id}/kyc-${side}-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const bucket = side === 'selfie' ? 'avatars' : 'documentos'

  const { error: uploadError } = await service.storage
    .from(bucket)
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: `Error subiendo archivo: ${uploadError.message}` }, { status: 500 })
  }

  // Actualizar estado según el lado
  const statusMap = { front: 'front_done', back: 'back_done', selfie: 'completed' }
  const newStatus = statusMap[side]
  const updateData: Record<string, string> = { status: newStatus }

  if (side === 'front') updateData.front_path = path
  if (side === 'back') updateData.back_path = path
  if (side === 'selfie') updateData.selfie_path = path

  await service.from('kyc_sessions').update(updateData).eq('token', token)

  // Si es selfie (último paso) → actualizar profile completo
  if (side === 'selfie') {
    await service.from('profiles').update({
      documento: session.front_path ?? path,  // frente del CI
      foto: path,                              // selfie como foto de perfil
    }).eq('id', session.user_id)
  }

  return NextResponse.json({ success: true, path, status: newStatus })
}
