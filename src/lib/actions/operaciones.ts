'use server'
// src/lib/actions/operaciones.ts
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generarCodigoOperacion } from '@/utils/format'
import { z } from 'zod'
import type { ActionResult } from './auth'
import type { Profile, Billetera } from '@/types/database'

const CrearOperacionSchema = z.object({
  cuenta_destinatario_id: z.number().min(1),
  monto_origen: z.number().positive(),
  moneda_origen: z.string().min(1),
  tasa_id: z.number().min(1),
  monto_destino: z.number().positive(),
  moneda_destino: z.string().min(1),
  proposito_id: z.number().min(1),
  cuenta_app_id: z.number().optional().nullable(),
  billetera_id: z.number().optional().nullable(),
}).refine(d => d.cuenta_app_id || d.billetera_id, {
  message: 'Debes seleccionar una cuenta bancaria o billetera',
})

export async function crearOperacionAction(payload: {
  cuenta_destinatario_id: number
  monto_origen: number
  moneda_origen: string
  tasa_id: number
  monto_destino: number
  moneda_destino: string
  proposito_id: number
  cuenta_app_id?: number | null
  billetera_id?: number | null
  boucherPath?: string
}): Promise<ActionResult & { codigo?: string }> {
  const parsed = CrearOperacionSchema.safeParse(payload)
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profileData } = await supabase
    .from('profiles').select('validado').eq('id', user.id).single()
  const profile = profileData as Pick<Profile, 'validado'> | null

  if (!profile || profile.validado !== 1) return { error: 'Tu cuenta aún no ha sido aprobada.' }

  const codigo = generarCodigoOperacion()

  const { error } = await supabase.from('operaciones').insert({
    user_id: user.id,
    codigo_operacion: codigo,
    cuenta_destinatario_id: payload.cuenta_destinatario_id,
    monto_origen: payload.monto_origen,
    moneda_origen: payload.moneda_origen,
    tasa_id: payload.tasa_id,
    monto_destino: payload.monto_destino,
    moneda_destino: payload.moneda_destino,
    proposito_id: payload.proposito_id,
    cuenta_app_id: payload.cuenta_app_id ?? null,
    billetera_id: payload.billetera_id ?? null,
    boucher: payload.boucherPath ?? null,
    origen: !payload.billetera_id,
    estatus_id: 1,
  })

  if (error) return { error: `Error al crear operación: ${error.message}` }

  if (payload.billetera_id) {
    const { data: bData } = await supabase
      .from('billeteras').select('saldo').eq('id', payload.billetera_id).single()
    const billetera = bData as Pick<Billetera, 'saldo'> | null
    if (billetera) {
      await supabase.from('billeteras')
        .update({ saldo: billetera.saldo - payload.monto_origen })
        .eq('id', payload.billetera_id)
    }
  }

  revalidatePath('/operaciones')
  revalidatePath('/dashboard')
  return { success: true, codigo }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getOperacionesUsuario(): Promise<any[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('operaciones')
    .select(`*, estatus_operaciones(nombre_estatus), tasas(valor, moneda_origen, moneda_destino),
      operaciones_propositos(nombre_proposito),
      cuentas_destinatarios(numero_cuenta, bancos(nombre_banco), tipos_cuentas(nombre_tipo),
        destinatarios(name, lastname, paises(nombre_pais))),
      cuentas(numero_cuenta, bancos(nombre_banco))`)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []) as any[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTodasOperaciones(estatus?: number): Promise<any[]> {
  const supabase = createClient()
  let query = supabase
    .from('operaciones')
    .select(`*, profiles(name, lastname, email, rut), estatus_operaciones(nombre_estatus),
      tasas(valor, moneda_origen, moneda_destino), operaciones_propositos(nombre_proposito),
      cuentas_destinatarios(numero_cuenta, bancos(nombre_banco),
        destinatarios(name, lastname, paises(nombre_pais)))`)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (estatus) query = query.eq('estatus_id', estatus)
  const { data } = await query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []) as any[]
}

export async function actualizarEstatusOperacion(
  operacionId: number,
  estatusId: number,
  observaciones?: string
): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase
    .from('operaciones')
    .update({ estatus_id: estatusId, observaciones: observaciones ?? null })
    .eq('id', operacionId)
  if (error) return { error: error.message }
  revalidatePath('/admin/operaciones')
  revalidatePath('/operaciones')
  return { success: true }
}
