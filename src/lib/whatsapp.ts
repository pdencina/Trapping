// src/lib/whatsapp.ts
// Módulo de envío de mensajes WhatsApp via Twilio API
// Configurar env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
//
// Para usar con la API de Meta Business (alternativa):
// Cambiar la implementación interna sin modificar la interfaz pública.

import { formatMoneda } from '@/utils/format'

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886' // Sandbox number

type SendWhatsAppResult =
  | { ok: true; sid: string }
  | { ok: false; error: string }

/**
 * Envía un mensaje de WhatsApp via Twilio.
 * El número debe incluir código de país (ej: +56912345678)
 */
async function sendWhatsApp(to: string, body: string): Promise<SendWhatsAppResult> {
  if (!TWILIO_SID || !TWILIO_TOKEN) {
    console.warn('[WhatsApp] TWILIO credentials no configuradas — mensaje no enviado')
    return { ok: false, error: 'Twilio no configurado' }
  }

  // Formatear número para Twilio
  const toFormatted = `whatsapp:${to.startsWith('+') ? to : `+${to}`}`

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_FROM,
        To: toFormatted,
        Body: body,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { ok: false, error: data.message ?? `Twilio error: ${response.status}` }
    }

    return { ok: true, sid: data.sid }
  } catch (err) {
    return { ok: false, error: `Error de conexión: ${(err as Error).message}` }
  }
}

// ─── Mensajes predefinidos ─────────────────────────────────────

/**
 * Notifica al usuario que su operación fue creada.
 */
export async function whatsappOperacionCreada(params: {
  telefono: string
  nombre: string
  codigo: string
  montoOrigen: number
  monedaOrigen: string
  montoDestino: number
  monedaDestino: string
  destinatario: string
}): Promise<SendWhatsAppResult> {
  const body = [
    `✅ *Operación registrada*`,
    ``,
    `Hola ${params.nombre}, tu transferencia fue creada:`,
    ``,
    `📋 Código: *${params.codigo}*`,
    `💰 Envías: *${formatMoneda(params.montoOrigen, params.monedaOrigen)}*`,
    `🎯 Recibe: *${formatMoneda(params.montoDestino, params.monedaDestino)}*`,
    `👤 Para: ${params.destinatario}`,
    ``,
    `La revisaremos pronto. Te avisamos cuando cambie de estado.`,
    ``,
    `— Trapping`,
  ].join('\n')

  return sendWhatsApp(params.telefono, body)
}

/**
 * Notifica al usuario que su operación fue completada.
 */
export async function whatsappOperacionCompletada(params: {
  telefono: string
  nombre: string
  codigo: string
  montoDestino: number
  monedaDestino: string
  destinatario: string
}): Promise<SendWhatsAppResult> {
  const body = [
    `🎉 *¡Transferencia completada!*`,
    ``,
    `Hola ${params.nombre}, tu envío ya llegó:`,
    ``,
    `📋 Código: *${params.codigo}*`,
    `💸 Entregado: *${formatMoneda(params.montoDestino, params.monedaDestino)}*`,
    `👤 A: ${params.destinatario}`,
    ``,
    `¡El dinero ya está en manos de tu destinatario!`,
    ``,
    `— Trapping`,
  ].join('\n')

  return sendWhatsApp(params.telefono, body)
}

/**
 * Notifica al usuario que su operación fue rechazada.
 */
export async function whatsappOperacionRechazada(params: {
  telefono: string
  nombre: string
  codigo: string
  motivo?: string | null
}): Promise<SendWhatsAppResult> {
  const body = [
    `⚠️ *Operación no procesada*`,
    ``,
    `Hola ${params.nombre}, no pudimos procesar tu transferencia:`,
    ``,
    `📋 Código: *${params.codigo}*`,
    params.motivo ? `📝 Motivo: ${params.motivo}` : '',
    ``,
    `Puedes crear una nueva operación o escribirnos si necesitas ayuda.`,
    ``,
    `— Trapping`,
  ].filter(Boolean).join('\n')

  return sendWhatsApp(params.telefono, body)
}

/**
 * Notifica al usuario que su cuenta fue aprobada.
 */
export async function whatsappCuentaAprobada(params: {
  telefono: string
  nombre: string
}): Promise<SendWhatsAppResult> {
  const body = [
    `🎊 *¡Cuenta verificada!*`,
    ``,
    `Hola ${params.nombre}, tu identidad fue verificada correctamente.`,
    ``,
    `Ya puedes enviar dinero al exterior desde tu panel en Trapping.`,
    ``,
    `¿Dudas? Responde este mensaje y te ayudamos.`,
    ``,
    `— Trapping`,
  ].join('\n')

  return sendWhatsApp(params.telefono, body)
}
