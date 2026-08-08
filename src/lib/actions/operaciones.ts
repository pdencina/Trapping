'use server'
// src/lib/actions/operaciones.ts
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generarCodigoOperacion } from '@/utils/format'
import { notificarOperacionCreada, notificarOperacionCompletada, notificarOperacionRechazada } from '@/lib/emails/notify'
import { notificarOperacionCreadaInApp, notificarOperacionCompletadaInApp, notificarOperacionRechazadaInApp } from '@/lib/actions/notifications'
import { whatsappOperacionCreada, whatsappOperacionCompletada, whatsappOperacionRechazada } from '@/lib/whatsapp'
import { validarLimitesOperacionales } from '@/lib/limites'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import type { ActionResult } from './auth'
import type { Profile, Billetera, Tasa } from '@/types/database'

const CrearOperacionSchema = z.object({
  cuenta_destinatario_id: z.number().min(1, 'Selecciona una cuenta de destino'),
  monto_origen: z.number().positive('Ingresa un monto válido'),
  moneda_origen: z.string().min(1),
  tasa_id: z.number().min(1, 'No hay tasa seleccionada'),
  monto_destino: z.number().positive('No se pudo calcular el monto destino'),
  moneda_destino: z.string().min(1),
  proposito_id: z.number().min(1, 'Selecciona el propósito del envío'),
  cuenta_app_id: z.number().optional().nullable(),
  billetera_id: z.number().optional().nullable(),
  boucherPath: z.string().optional().nullable(),
}).refine(d => d.cuenta_app_id || d.billetera_id, {
  message: 'Debes seleccionar transferencia bancaria o billetera',
}).refine(d => !d.cuenta_app_id || !!d.boucherPath, {
  message: 'Debes adjuntar el comprobante de pago',
})

function getFirstZodError(error: z.ZodError) {
  const flat = error.flatten()
  return flat.formErrors[0] || Object.values(flat.fieldErrors).flat().find(Boolean) || 'Revisa los datos de la operación'
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
    return {
      error: getFirstZodError(parsed.error),
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
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
    return { error: 'Tu cuenta aún no ha sido aprobada.' }
  }

  // Validar límites operacionales del usuario
  const limiteCheck = await validarLimitesOperacionales(user.id, parsed.data.monto_origen)
  if (!limiteCheck.ok) {
    return { error: limiteCheck.error }
  }

  const { data: tasaData, error: tasaError } = await supabase
    .from('tasas')
    .select('*')
    .eq('id', parsed.data.tasa_id)
    .eq('activo', true)
    .is('deleted_at', null)
    .single()

  if (tasaError || !tasaData) return { error: 'La tasa seleccionada ya no está disponible.' }

  const tasa = tasaData as Tasa
  if (tasa.moneda_origen !== parsed.data.moneda_origen || tasa.moneda_destino !== parsed.data.moneda_destino) {
    return { error: 'La tasa no corresponde a las monedas seleccionadas.' }
  }

  if (tasa.monto_minimo > 0 && parsed.data.monto_origen < tasa.monto_minimo) {
    return { error: `El monto mínimo para esta tasa es ${tasa.monto_minimo.toLocaleString('es-CL')} ${tasa.moneda_origen}` }
  }

  if (tasa.monto_maximo > 0 && parsed.data.monto_origen > tasa.monto_maximo) {
    return { error: `El monto máximo para esta tasa es ${tasa.monto_maximo.toLocaleString('es-CL')} ${tasa.moneda_origen}` }
  }

  const { data: cuentaDestino } = await supabase
    .from('cuentas_destinatarios')
    .select('id, destinatarios!inner(user_id, deleted_at, estatus)')
    .eq('id', parsed.data.cuenta_destinatario_id)
    .eq('destinatarios.user_id', user.id)
    .eq('destinatarios.estatus', true)
    .is('destinatarios.deleted_at', null)
    .single()

  if (!cuentaDestino) return { error: 'La cuenta de destino no existe o no pertenece a tu usuario.' }

  if (parsed.data.billetera_id) {
    const { data: bData } = await supabase
      .from('billeteras')
      .select('id, saldo, moneda')
      .eq('id', parsed.data.billetera_id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    const billetera = bData as Pick<Billetera, 'id' | 'saldo' | 'moneda'> | null
    if (!billetera) return { error: 'La billetera seleccionada no existe.' }
    if (billetera.moneda !== parsed.data.moneda_origen) {
      return { error: 'La moneda de la billetera no coincide con la moneda de origen.' }
    }
    if (billetera.saldo < parsed.data.monto_origen) {
      return { error: 'Saldo insuficiente en la billetera.' }
    }
  }

  const codigo = generarCodigoOperacion()

  const { data: operacion, error } = await supabase
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
      boucher_transferencia: parsed.data.boucherPath ?? null,
      origen: !parsed.data.billetera_id,
      estatus_id: 1,
    })
    .select('id')
    .single()

  if (error) return { error: `Error al crear operación: ${error.message}` }

  if (parsed.data.billetera_id) {
    const { data: bData } = await supabase
      .from('billeteras')
      .select('saldo, moneda')
      .eq('id', parsed.data.billetera_id)
      .eq('user_id', user.id)
      .single()

    const billetera = bData as Pick<Billetera, 'saldo' | 'moneda'> | null
    if (!billetera || billetera.saldo < parsed.data.monto_origen) {
      await supabase.from('operaciones').update({ estatus_id: 3, observaciones: 'Saldo insuficiente al confirmar' }).eq('id', operacion.id)
      return { error: 'Saldo insuficiente en la billetera.' }
    }

    const nuevoSaldo = billetera.saldo - parsed.data.monto_origen
    const { error: walletError } = await supabase
      .from('billeteras')
      .update({ saldo: nuevoSaldo })
      .eq('id', parsed.data.billetera_id)
      .eq('user_id', user.id)

    if (walletError) {
      await supabase.from('operaciones').update({ estatus_id: 3, observaciones: 'No se pudo descontar billetera' }).eq('id', operacion.id)
      return { error: `No se pudo descontar la billetera: ${walletError.message}` }
    }

    await supabase.from('billeteras_historial').insert({
      user_id: user.id,
      billetera_id: parsed.data.billetera_id,
      operacion_id: operacion.id,
      operacion_billetera_id: null,
      tipo: 'envio',
      saldo_billetera: nuevoSaldo,
      moneda_billetera: billetera.moneda,
      monto_conversion: parsed.data.monto_destino,
      moneda_conversion: parsed.data.moneda_destino,
      monto_aprobado: parsed.data.monto_origen,
      moneda_aprobado: parsed.data.moneda_origen,
      detalle: `Envío ${codigo}`,
      admin_id: user.id,
      is_corregido: false,
    })
  }

  revalidatePath('/operaciones')
  revalidatePath('/dashboard')
  revalidatePath('/billetera')

  // Enviar email de confirmación de operación creada (fire-and-forget)
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (currentUser?.email) {
    const { data: profileForEmail } = await supabase
      .from('profiles').select('name').eq('id', user.id).single()
    const { data: destInfo } = await supabase
      .from('cuentas_destinatarios')
      .select('destinatarios(name, lastname, paises(nombre_pais))')
      .eq('id', parsed.data.cuenta_destinatario_id)
      .single()

    const dest = (destInfo as any)?.destinatarios
    notificarOperacionCreada({
      email: currentUser.email,
      nombre: (profileForEmail as any)?.name ?? '',
      codigoOperacion: codigo,
      montoOrigen: parsed.data.monto_origen,
      monedaOrigen: parsed.data.moneda_origen,
      montoDestino: parsed.data.monto_destino,
      monedaDestino: parsed.data.moneda_destino,
      destinatario: `${dest?.name ?? ''} ${dest?.lastname ?? ''}`.trim(),
      paisDestino: dest?.paises?.nombre_pais ?? '',
    }).catch(() => {}) // No bloquear si falla el email

    // Notificación in-app
    notificarOperacionCreadaInApp(user.id, codigo).catch(() => {})

    // WhatsApp (si tiene celular)
    const { data: profileWa } = await supabase.from('profiles').select('celular').eq('id', user.id).single()
    if ((profileWa as any)?.celular) {
      whatsappOperacionCreada({
        telefono: (profileWa as any).celular,
        nombre: (profileForEmail as any)?.name ?? '',
        codigo,
        montoOrigen: parsed.data.monto_origen,
        monedaOrigen: parsed.data.moneda_origen,
        montoDestino: parsed.data.monto_destino,
        monedaDestino: parsed.data.moneda_destino,
        destinatario: `${dest?.name ?? ''} ${dest?.lastname ?? ''}`.trim(),
      }).catch(() => {})
    }
  }

  return { success: true, codigo }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getOperacionesUsuario(): Promise<any[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('operaciones')
    .select(`*, estatus_operaciones(nombre_estatus), tasas(valor, moneda_origen, moneda_destino),
      operaciones_propositos(nombre_proposito),
      cuentas_destinatarios(numero_cuenta, bancos(nombre_banco), tipos_cuentas(nombre_tipo),
        destinatarios(name, lastname, paises(nombre_pais))),
      cuentas(numero_cuenta, bancos(nombre_banco))`)
    .eq('user_id', user.id)
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
    .select(`*, profiles(name, lastname, rut), estatus_operaciones(nombre_estatus),
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

  // Enviar email de notificación al usuario (solo para completada/rechazada)
  if (estatusId === 3 || estatusId === 4) {
    const service = createServiceClient()
    const { data: op } = await service
      .from('operaciones')
      .select(`
        user_id, codigo_operacion, monto_origen, moneda_origen, monto_destino, moneda_destino, observaciones,
        cuentas_destinatarios(destinatarios(name, lastname, paises(nombre_pais)))
      `)
      .eq('id', operacionId)
      .single()

    if (op) {
      const { data: { user: authUser } } = await service.auth.admin.getUserById(op.user_id)
      const { data: profile } = await service.from('profiles').select('name').eq('id', op.user_id).single()

      const email = authUser?.email
      const dest = (op as any).cuentas_destinatarios?.destinatarios

      if (email) {
        const emailData = {
          email,
          nombre: (profile as any)?.name ?? '',
          codigoOperacion: op.codigo_operacion,
          montoOrigen: op.monto_origen,
          monedaOrigen: op.moneda_origen,
          montoDestino: op.monto_destino,
          monedaDestino: op.moneda_destino,
          destinatario: `${dest?.name ?? ''} ${dest?.lastname ?? ''}`.trim(),
          paisDestino: dest?.paises?.nombre_pais ?? '',
          motivo: op.observaciones,
        }

        if (estatusId === 4) {
          notificarOperacionCompletada(emailData).catch(() => {})
        } else {
          notificarOperacionRechazada(emailData).catch(() => {})
        }
      }

      // Notificación in-app
      if (estatusId === 4) {
        notificarOperacionCompletadaInApp(op.user_id, op.codigo_operacion).catch(() => {})
      } else {
        notificarOperacionRechazadaInApp(op.user_id, op.codigo_operacion, op.observaciones ?? undefined).catch(() => {})
      }

      // WhatsApp automático
      const { data: profileWa } = await service.from('profiles').select('celular, name').eq('id', op.user_id).single()
      const celular = (profileWa as any)?.celular
      if (celular) {
        const dest = (op as any).cuentas_destinatarios?.destinatarios
        if (estatusId === 4) {
          whatsappOperacionCompletada({
            telefono: celular,
            nombre: (profileWa as any)?.name ?? '',
            codigo: op.codigo_operacion,
            montoDestino: op.monto_destino,
            monedaDestino: op.moneda_destino,
            destinatario: `${dest?.name ?? ''} ${dest?.lastname ?? ''}`.trim(),
          }).catch(() => {})
        } else {
          whatsappOperacionRechazada({
            telefono: celular,
            nombre: (profileWa as any)?.name ?? '',
            codigo: op.codigo_operacion,
            motivo: op.observaciones,
          }).catch(() => {})
        }
      }
    }
  }

  // Audit log
  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (adminUser) {
    const actionMap: Record<number, string> = { 2: 'operacion.review', 3: 'operacion.reject', 4: 'operacion.complete' }
    logAudit({
      adminId: adminUser.id,
      action: (actionMap[estatusId] ?? 'operacion.review') as any,
      resourceType: 'operacion',
      resourceId: String(operacionId),
      details: { estatusId, observaciones },
    }).catch(() => {})
  }

  revalidatePath('/admin/operaciones')
  revalidatePath('/operaciones')
  return { success: true }
}
