'use server'
// src/lib/actions/operaciones.ts
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generarCodigoOperacion } from '@/utils/format'
import { z } from 'zod'
import type { ActionResult } from './auth'
import type { Profile, Billetera } from '@/types/database'

const CrearOperacionSchema = z.object({
  cuenta_destinatario_id: z.number().min(1, 'Selecciona una cuenta de destino'),
  monto_origen: z.number().positive('Ingresa un monto válido'),
  moneda_origen: z.string().min(1, 'Selecciona moneda origen'),
  tasa_id: z.number().min(1, 'Selecciona una tasa válida'),
  monto_destino: z.number().positive('El monto destino debe ser mayor a cero'),
  moneda_destino: z.string().min(1, 'Selecciona moneda destino'),
  proposito_id: z.number().min(1, 'Selecciona el propósito del envío'),
  cuenta_app_id: z.number().optional().nullable(),
  billetera_id: z.number().optional().nullable(),
  boucherPath: z.string().optional().nullable(),
}).refine(d => Boolean(d.cuenta_app_id) !== Boolean(d.billetera_id), {
  message: 'Selecciona solo un método de pago: cuenta bancaria o billetera',
}).refine(d => !d.cuenta_app_id || !!d.boucherPath, {
  message: 'Debes adjuntar el comprobante de pago',
})

function toMoney(value: unknown): number {
  const numberValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

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
  boucherPath?: string | null
}): Promise<ActionResult & { codigo?: string }> {
  const parsed = CrearOperacionSchema.safeParse(payload)

  if (!parsed.success) {
    const firstError =
      parsed.error.flatten().formErrors[0] ||
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ||
      'Revisa los datos de la operación'

    return { error: firstError, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('validado')
    .eq('id', user.id)
    .single()

  const profile = profileData as Pick<Profile, 'validado'> | null

  if (!profile || profile.validado !== 1) {
    return { error: 'Tu cuenta aún no ha sido aprobada por un administrador.' }
  }

  const { data: tasaData, error: tasaError } = await supabase
    .from('tasas')
    .select('id, moneda_origen, moneda_destino, monto_minimo, monto_maximo, activo')
    .eq('id', parsed.data.tasa_id)
    .eq('activo', true)
    .is('deleted_at', null)
    .single()

  if (tasaError || !tasaData) return { error: 'La tasa seleccionada ya no está disponible.' }

  const tasa = tasaData as {
    moneda_origen: string
    moneda_destino: string
    monto_minimo: number | null
    monto_maximo: number | null
    activo: boolean
  }

  if (tasa.moneda_origen !== parsed.data.moneda_origen || tasa.moneda_destino !== parsed.data.moneda_destino) {
    return { error: 'La tasa seleccionada no coincide con las monedas de la operación.' }
  }

  const minimo = toMoney(tasa.monto_minimo)
  const maximo = toMoney(tasa.monto_maximo)

  if (minimo > 0 && parsed.data.monto_origen < minimo) {
    return { error: `El monto mínimo para esta tasa es ${minimo} ${parsed.data.moneda_origen}.` }
  }

  if (maximo > 0 && parsed.data.monto_origen > maximo) {
    return { error: `El monto máximo para esta tasa es ${maximo} ${parsed.data.moneda_origen}.` }
  }

  const { data: cuentaDestino } = await supabase
    .from('cuentas_destinatarios')
    .select('id, destinatarios!inner(user_id, deleted_at, estatus)')
    .eq('id', parsed.data.cuenta_destinatario_id)
    .eq('destinatarios.user_id', user.id)
    .eq('destinatarios.estatus', true)
    .is('destinatarios.deleted_at', null)
    .single()

  if (!cuentaDestino) return { error: 'La cuenta de destino no pertenece a tu usuario o no está disponible.' }

  if (parsed.data.cuenta_app_id) {
    const { data: cuentaApp } = await supabase
      .from('cuentas')
      .select('id')
      .eq('id', parsed.data.cuenta_app_id)
      .eq('estatus', true)
      .is('deleted_at', null)
      .single()

    if (!cuentaApp) return { error: 'La cuenta bancaria de Trapping seleccionada no está disponible.' }
  }

  if (parsed.data.billetera_id) {
    const { data: bData } = await supabase
      .from('billeteras')
      .select('id, user_id, moneda, saldo')
      .eq('id', parsed.data.billetera_id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    const billetera = bData as Pick<Billetera, 'id' | 'moneda' | 'saldo'> | null

    if (!billetera) return { error: 'La billetera seleccionada no está disponible.' }

    if (billetera.moneda !== parsed.data.moneda_origen) {
      return { error: `La billetera seleccionada es ${billetera.moneda}, pero la operación está en ${parsed.data.moneda_origen}.` }
    }

    if (toMoney(billetera.saldo) < parsed.data.monto_origen) {
      return { error: 'Saldo insuficiente en tu billetera para realizar esta operación.' }
    }
  }

  const codigo = generarCodigoOperacion()

  const { data: operacionData, error: insertError } = await supabase
    .from('operaciones')
    .insert({
      user_id: user.id,
      codigo_operacion: codigo,
      cuenta_destinatario_id: parsed.data.cuenta_destinatario_id,
      monto_origen: parsed.data.monto_origen,
      moneda_origen: parsed.data.moneda_origen,
      tasa_id: parsed.data.tasa_id,
      monto_destino: parsed.data.monto_destino,
      moneda_destino: parsed.data.moneda_destino,
      proposito_id: parsed.data.proposito_id,
      cuenta_app_id: parsed.data.cuenta_app_id ?? null,
      billetera_id: parsed.data.billetera_id ?? null,
      boucher: parsed.data.boucherPath ?? null,
      origen: !parsed.data.billetera_id,
      estatus_id: 1,
    })
    .select('id')
    .single()

  if (insertError || !operacionData) {
    return { error: `Error al crear operación: ${insertError?.message ?? 'No se pudo crear la operación'}` }
  }

  if (parsed.data.billetera_id) {
    const { data: bData } = await supabase
      .from('billeteras')
      .select('saldo')
      .eq('id', parsed.data.billetera_id)
      .eq('user_id', user.id)
      .single()

    const saldoActual = toMoney((bData as Pick<Billetera, 'saldo'> | null)?.saldo)

    if (saldoActual < parsed.data.monto_origen) {
      await supabase.from('operaciones').delete().eq('id', operacionData.id).eq('user_id', user.id)
      return { error: 'Saldo insuficiente en tu billetera para realizar esta operación.' }
    }

    const nuevoSaldo = saldoActual - parsed.data.monto_origen

    const { error: billeteraError } = await supabase
      .from('billeteras')
      .update({ saldo: nuevoSaldo })
      .eq('id', parsed.data.billetera_id)
      .eq('user_id', user.id)

    if (billeteraError) {
      await supabase.from('operaciones').delete().eq('id', operacionData.id).eq('user_id', user.id)
      return { error: `No se pudo descontar el saldo de la billetera: ${billeteraError.message}` }
    }
  }

  revalidatePath('/operaciones')
  revalidatePath('/dashboard')
  revalidatePath('/billetera')

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
