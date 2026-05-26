'use server'
// src/lib/actions/kyc.ts
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

export async function crearSesionKYC(): Promise<{ token: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Generar token único de 32 chars
  const token = randomBytes(16).toString('hex')

  const service = createServiceClient()
  const { error } = await service.from('kyc_sessions').insert({
    user_id: user.id,
    token,
    status: 'pending',
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
  })

  if (error) return { error: error.message }
  return { token }
}

export async function getEstadoKYC(token: string) {
  const service = createServiceClient()
  const { data } = await service
    .from('kyc_sessions')
    .select('status, front_path, back_path, user_id, expires_at')
    .eq('token', token)
    .single()
  return data
}

export async function completarKYC(userId: string, frontPath: string, backPath: string) {
  const service = createServiceClient()

  // Actualizar perfil con paths de documentos
  await service.from('profiles').update({
    documento: frontPath,
    foto: backPath,
    validado: 0, // Sigue pendiente hasta que admin revise
  }).eq('id', userId)

  // Marcar sesión como completada
  await service.from('kyc_sessions').update({
    status: 'completed',
  }).eq('user_id', userId).eq('status', 'back_done')

  revalidatePath('/register/kyc')
}
