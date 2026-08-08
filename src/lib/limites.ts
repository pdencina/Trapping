// src/lib/limites.ts
// Validación de límites operacionales por usuario

import { createClient } from '@/lib/supabase/server'
import { formatMoneda } from '@/utils/format'

export type LimiteOperacional = {
  id: number
  tier: string
  descripcion: string | null
  max_operaciones_dia: number
  max_monto_dia_clp: number
  max_operaciones_mes: number
  max_monto_mes_clp: number
  max_monto_operacion_clp: number
  activo: boolean
}

export type ValidacionLimite =
  | { ok: true }
  | { ok: false; error: string; tipo: 'operacion' | 'dia' | 'mes' }

/**
 * Valida que el usuario puede crear una operación según sus límites.
 * Retorna { ok: true } si puede, o { ok: false, error, tipo } si excede.
 */
export async function validarLimitesOperacionales(
  userId: string,
  montoOrigenCLP: number
): Promise<ValidacionLimite> {
  const supabase = createClient()

  // Obtener tier del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', userId)
    .single()

  const tier = (profile as any)?.tier ?? 'standard'

  // Obtener configuración del tier
  const { data: limite } = await supabase
    .from('limites_operacionales')
    .select('*')
    .eq('tier', tier)
    .eq('activo', true)
    .single()

  if (!limite) {
    // Si no hay configuración de límites, permitir (fail-open)
    return { ok: true }
  }

  const limiteData = limite as LimiteOperacional

  // 1. Validar monto individual
  if (montoOrigenCLP > limiteData.max_monto_operacion_clp) {
    return {
      ok: false,
      tipo: 'operacion',
      error: `El monto máximo por operación es ${formatMoneda(limiteData.max_monto_operacion_clp, 'CLP')}. Tu tier actual es "${tier}".`,
    }
  }

  // 2. Validar límites diarios
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const inicioDelDia = hoy.toISOString()

  const { data: opsDia, count: countDia } = await supabase
    .from('operaciones')
    .select('monto_origen', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('created_at', inicioDelDia)
    .neq('estatus_id', 3) // No contar rechazadas

  const totalDia = (opsDia ?? []).reduce((sum: number, op: any) => sum + (op.monto_origen ?? 0), 0)

  if ((countDia ?? 0) >= limiteData.max_operaciones_dia) {
    return {
      ok: false,
      tipo: 'dia',
      error: `Alcanzaste el máximo de ${limiteData.max_operaciones_dia} operaciones por día. Intenta mañana.`,
    }
  }

  if (totalDia + montoOrigenCLP > limiteData.max_monto_dia_clp) {
    const disponible = limiteData.max_monto_dia_clp - totalDia
    return {
      ok: false,
      tipo: 'dia',
      error: `Excedes tu límite diario. Monto disponible hoy: ${formatMoneda(Math.max(0, disponible), 'CLP')}.`,
    }
  }

  // 3. Validar límites mensuales
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString()

  const { data: opsMes, count: countMes } = await supabase
    .from('operaciones')
    .select('monto_origen', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('created_at', inicioMes)
    .neq('estatus_id', 3) // No contar rechazadas

  const totalMes = (opsMes ?? []).reduce((sum: number, op: any) => sum + (op.monto_origen ?? 0), 0)

  if ((countMes ?? 0) >= limiteData.max_operaciones_mes) {
    return {
      ok: false,
      tipo: 'mes',
      error: `Alcanzaste el máximo de ${limiteData.max_operaciones_mes} operaciones este mes.`,
    }
  }

  if (totalMes + montoOrigenCLP > limiteData.max_monto_mes_clp) {
    const disponible = limiteData.max_monto_mes_clp - totalMes
    return {
      ok: false,
      tipo: 'mes',
      error: `Excedes tu límite mensual. Monto disponible este mes: ${formatMoneda(Math.max(0, disponible), 'CLP')}.`,
    }
  }

  return { ok: true }
}

/**
 * Obtiene el resumen de uso de límites del usuario (para mostrar en UI).
 */
export async function getResumenLimites(userId: string) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', userId)
    .single()

  const tier = (profile as any)?.tier ?? 'standard'

  const { data: limite } = await supabase
    .from('limites_operacionales')
    .select('*')
    .eq('tier', tier)
    .eq('activo', true)
    .single()

  if (!limite) return null

  const limiteData = limite as LimiteOperacional

  // Operaciones del día
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const { data: opsDia } = await supabase
    .from('operaciones')
    .select('monto_origen')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('created_at', hoy.toISOString())
    .neq('estatus_id', 3)

  // Operaciones del mes
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString()
  const { data: opsMes } = await supabase
    .from('operaciones')
    .select('monto_origen')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('created_at', inicioMes)
    .neq('estatus_id', 3)

  const usoDia = (opsDia ?? []).reduce((s: number, o: any) => s + (o.monto_origen ?? 0), 0)
  const usoMes = (opsMes ?? []).reduce((s: number, o: any) => s + (o.monto_origen ?? 0), 0)

  return {
    tier,
    dia: {
      operaciones: opsDia?.length ?? 0,
      maxOperaciones: limiteData.max_operaciones_dia,
      montoUsado: usoDia,
      montoMaximo: limiteData.max_monto_dia_clp,
      disponible: Math.max(0, limiteData.max_monto_dia_clp - usoDia),
    },
    mes: {
      operaciones: opsMes?.length ?? 0,
      maxOperaciones: limiteData.max_operaciones_mes,
      montoUsado: usoMes,
      montoMaximo: limiteData.max_monto_mes_clp,
      disponible: Math.max(0, limiteData.max_monto_mes_clp - usoMes),
    },
    maxPorOperacion: limiteData.max_monto_operacion_clp,
  }
}
