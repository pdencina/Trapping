'use server'
// src/lib/actions/referrals.ts
// Sistema de referidos: generación de código, validación y aplicación de descuentos

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Genera un código de referido único para el usuario actual.
 * Formato: NOMBRE-XXXX (4 caracteres aleatorios)
 */
export async function generarCodigoReferido(): Promise<{ code: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar si ya tiene código
  const service = createServiceClient()
  const { data: existing } = await service
    .from('referral_codes')
    .select('code')
    .eq('user_id', user.id)
    .single()

  if (existing) return { code: existing.code }

  // Obtener nombre para el código
  const { data: profile } = await service
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const nombre = ((profile as any)?.name ?? 'TRAPPING')
    .split(' ')[0]
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^A-Z]/g, '')
    .slice(0, 8)

  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  const code = `${nombre}-${random}`

  const { error } = await service.from('referral_codes').insert({
    user_id: user.id,
    code,
    reward_percent: 100, // 100% descuento en comisión para el referido
  })

  if (error) {
    // Si colisión de código, reintentar con otro random
    const random2 = Math.random().toString(36).substring(2, 6).toUpperCase()
    const code2 = `${nombre}-${random2}`
    await service.from('referral_codes').insert({ user_id: user.id, code: code2, reward_percent: 100 })
    return { code: code2 }
  }

  return { code }
}

/**
 * Obtiene el código de referido del usuario actual.
 */
export async function getMyReferralCode(): Promise<{ code: string; usesCount: number } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('referral_codes')
    .select('code, uses_count')
    .eq('user_id', user.id)
    .single()

  if (!data) return null
  return { code: data.code, usesCount: data.uses_count }
}

/**
 * Obtiene la lista de personas que el usuario ha referido.
 */
export async function getMisReferidos() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const service = createServiceClient()
  const { data } = await service
    .from('referrals')
    .select('id, referred_id, code, status, operations_with_discount, max_discount_operations, created_at')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  if (!data) return []

  // Obtener nombres de los referidos
  const referredIds = data.map(r => r.referred_id)
  const { data: profiles } = await service
    .from('profiles')
    .select('id, name, lastname')
    .in('id', referredIds)

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  return data.map(r => ({
    ...r,
    referredName: (() => {
      const p = profileMap.get(r.referred_id) as any
      return p ? `${p.name ?? ''} ${p.lastname ?? ''}`.trim() : 'Usuario'
    })(),
  }))
}

/**
 * Valida si un código de referido existe y está activo.
 * Se usa al registrarse para verificar el código.
 */
export async function validarCodigoReferido(code: string): Promise<{ valid: boolean; referrerId?: string }> {
  const service = createServiceClient()
  const { data } = await service
    .from('referral_codes')
    .select('user_id, active, max_uses, uses_count')
    .eq('code', code.trim().toUpperCase())
    .single()

  if (!data || !data.active) return { valid: false }
  if (data.max_uses && data.uses_count >= data.max_uses) return { valid: false }

  return { valid: true, referrerId: data.user_id }
}

/**
 * Aplica un código de referido durante el registro.
 * Crea la relación referrer → referred.
 */
export async function aplicarCodigoReferido(referredUserId: string, code: string): Promise<void> {
  const service = createServiceClient()

  const { data: codeData } = await service
    .from('referral_codes')
    .select('user_id, reward_percent')
    .eq('code', code.trim().toUpperCase())
    .eq('active', true)
    .single()

  if (!codeData) return

  // No auto-referirse
  if (codeData.user_id === referredUserId) return

  // Verificar que no esté ya referido
  const { data: existing } = await service
    .from('referrals')
    .select('id')
    .eq('referred_id', referredUserId)
    .single()

  if (existing) return // Ya tiene referidor

  // Crear relación
  await service.from('referrals').insert({
    referrer_id: codeData.user_id,
    referred_id: referredUserId,
    code: code.trim().toUpperCase(),
    status: 'active',
    discount_percent: codeData.reward_percent,
    max_discount_operations: 3, // 3 operaciones con descuento
  })

  // Incrementar contador del código
  await service
    .from('referral_codes')
    .update({ uses_count: (codeData as any).uses_count + 1 })
    .eq('user_id', codeData.user_id)

  // Guardar en profile
  await service
    .from('profiles')
    .update({ referred_by_code: code.trim().toUpperCase() })
    .eq('id', referredUserId)
}

/**
 * Verifica si el usuario tiene descuento de referido activo.
 * Retorna el porcentaje de descuento (0 si no tiene).
 */
export async function getDescuentoReferido(userId: string): Promise<number> {
  const service = createServiceClient()

  const { data } = await service
    .from('referrals')
    .select('discount_percent, operations_with_discount, max_discount_operations, status')
    .eq('referred_id', userId)
    .eq('status', 'active')
    .single()

  if (!data) return 0
  if (data.operations_with_discount >= data.max_discount_operations) return 0

  return data.discount_percent
}

/**
 * Consume un uso del descuento de referido (se llama al crear una operación exitosa).
 */
export async function consumirDescuentoReferido(userId: string): Promise<void> {
  const service = createServiceClient()

  const { data } = await service
    .from('referrals')
    .select('id, operations_with_discount, max_discount_operations')
    .eq('referred_id', userId)
    .eq('status', 'active')
    .single()

  if (!data) return

  const newCount = data.operations_with_discount + 1
  const updates: any = { operations_with_discount: newCount }

  // Si llegó al máximo, expirar
  if (newCount >= data.max_discount_operations) {
    updates.status = 'expired'
    updates.expired_at = new Date().toISOString()
  }

  await service.from('referrals').update(updates).eq('id', data.id)
}
