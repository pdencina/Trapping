// src/lib/emails/notify.ts
// Funciones de alto nivel para disparar notificaciones por email
// Se usan desde server actions cuando cambia el estado de una operación

import { sendEmail } from './resend'
import {
  operacionCreadaEmail,
  operacionCompletadaEmail,
  operacionRechazadaEmail,
  recargaAprobadaEmail,
} from './templates'
import { formatMoneda } from '@/utils/format'

interface OperacionEmailData {
  email: string
  nombre: string
  codigoOperacion: string
  montoOrigen: number
  monedaOrigen: string
  montoDestino: number
  monedaDestino: string
  destinatario: string
  paisDestino: string
  motivo?: string | null
}

/**
 * Envía email cuando se crea una nueva operación.
 * Se llama desde crearOperacionAction.
 */
export async function notificarOperacionCreada(data: OperacionEmailData) {
  const { subject, html } = operacionCreadaEmail({
    nombre: data.nombre,
    codigoOperacion: data.codigoOperacion,
    montoOrigen: formatMoneda(data.montoOrigen, data.monedaOrigen),
    monedaOrigen: data.monedaOrigen,
    montoDestino: formatMoneda(data.montoDestino, data.monedaDestino),
    monedaDestino: data.monedaDestino,
    destinatario: data.destinatario,
    paisDestino: data.paisDestino,
  })

  return sendEmail({ to: data.email, subject, html })
}

/**
 * Envía email cuando una operación es completada (estatus 4).
 * Se llama desde actualizarEstatusOperacion en admin.
 */
export async function notificarOperacionCompletada(data: OperacionEmailData) {
  const { subject, html } = operacionCompletadaEmail({
    nombre: data.nombre,
    codigoOperacion: data.codigoOperacion,
    montoDestino: formatMoneda(data.montoDestino, data.monedaDestino),
    monedaDestino: data.monedaDestino,
    destinatario: data.destinatario,
    paisDestino: data.paisDestino,
  })

  return sendEmail({ to: data.email, subject, html })
}

/**
 * Envía email cuando una operación es rechazada (estatus 3).
 * Se llama desde actualizarEstatusOperacion en admin.
 */
export async function notificarOperacionRechazada(data: OperacionEmailData) {
  const { subject, html } = operacionRechazadaEmail({
    nombre: data.nombre,
    codigoOperacion: data.codigoOperacion,
    montoOrigen: formatMoneda(data.montoOrigen, data.monedaOrigen),
    monedaOrigen: data.monedaOrigen,
    motivo: data.motivo,
  })

  return sendEmail({ to: data.email, subject, html })
}

/**
 * Envía email cuando se aprueba una recarga de billetera.
 */
export async function notificarRecargaAprobada(data: {
  email: string
  nombre: string
  monto: number
  moneda: string
  saldoActual: number
}) {
  const { subject, html } = recargaAprobadaEmail({
    nombre: data.nombre,
    monto: formatMoneda(data.monto, data.moneda),
    moneda: data.moneda,
    saldoActual: formatMoneda(data.saldoActual, data.moneda),
  })

  return sendEmail({ to: data.email, subject, html })
}
