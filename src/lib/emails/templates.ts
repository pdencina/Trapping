// src/lib/emails/templates.ts
// Plantillas HTML para emails transaccionales de Trapping

const BRAND_COLOR = '#7c3aed'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://trapping-green.vercel.app'

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f8f7ff;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <!-- Header -->
    <div style="background:${BRAND_COLOR};border-radius:16px;padding:24px;text-align:center;margin-bottom:32px">
      <h1 style="color:#fff;font-size:24px;margin:0;font-weight:800;letter-spacing:-0.5px">trapping</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:8px 0 0">Envío de remesas</p>
    </div>

    <!-- Content -->
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #ede9fe">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;padding:0 16px">
      <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0">
        Este email fue enviado por Trapping. Si tienes dudas, escríbenos por
        <a href="https://wa.me/56912345678" style="color:${BRAND_COLOR};text-decoration:none">WhatsApp</a>.
      </p>
      <p style="color:#d1d5db;font-size:11px;margin-top:12px">
        © ${new Date().getFullYear()} Trapping · Santiago, Chile
      </p>
    </div>
  </div>
</body>
</html>`
}

function button(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:14px;margin-top:24px">${text}</a>`
}

// ─── OPERACIÓN CREADA ──────────────────────────────────────────
export function operacionCreadaEmail(params: {
  nombre: string
  codigoOperacion: string
  montoOrigen: string
  monedaOrigen: string
  montoDestino: string
  monedaDestino: string
  destinatario: string
  paisDestino: string
}): { subject: string; html: string } {
  return {
    subject: `Operación ${params.codigoOperacion} registrada correctamente`,
    html: baseLayout(`
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px">¡Operación registrada!</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px">
        Hola ${params.nombre}, tu transferencia fue creada exitosamente. Nuestro equipo la revisará pronto.
      </p>

      <div style="background:#f8f7ff;border-radius:12px;padding:20px;margin-bottom:20px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr>
            <td style="padding:6px 0;color:#6b7280">Código</td>
            <td style="padding:6px 0;text-align:right;font-weight:700;color:${BRAND_COLOR};font-family:monospace">${params.codigoOperacion}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280">Envías</td>
            <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">${params.montoOrigen} ${params.monedaOrigen}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280">Recibe</td>
            <td style="padding:6px 0;text-align:right;font-weight:600;color:${BRAND_COLOR}">${params.montoDestino} ${params.monedaDestino}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280">Destinatario</td>
            <td style="padding:6px 0;text-align:right;color:#111827">${params.destinatario}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280">País</td>
            <td style="padding:6px 0;text-align:right;color:#111827">${params.paisDestino}</td>
          </tr>
        </table>
      </div>

      <p style="color:#6b7280;font-size:13px;line-height:1.6">
        Te notificaremos cuando tu operación cambie de estado. Puedes ver el progreso en tu panel.
      </p>

      ${button('Ver mi operación →', `${APP_URL}/operaciones`)}
    `),
  }
}

// ─── OPERACIÓN COMPLETADA ──────────────────────────────────────
export function operacionCompletadaEmail(params: {
  nombre: string
  codigoOperacion: string
  montoDestino: string
  monedaDestino: string
  destinatario: string
  paisDestino: string
}): { subject: string; html: string } {
  return {
    subject: `¡Tu envío ${params.codigoOperacion} fue completado! 🎉`,
    html: baseLayout(`
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:64px;height:64px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center">
          <span style="font-size:32px">✓</span>
        </div>
      </div>

      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;text-align:center">¡Transferencia completada!</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;text-align:center">
        Hola ${params.nombre}, el dinero ya fue entregado a tu destinatario.
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:20px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr>
            <td style="padding:6px 0;color:#6b7280">Código</td>
            <td style="padding:6px 0;text-align:right;font-weight:700;font-family:monospace;color:#15803d">${params.codigoOperacion}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280">Recibió</td>
            <td style="padding:6px 0;text-align:right;font-weight:700;color:#15803d">${params.montoDestino} ${params.monedaDestino}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280">Destinatario</td>
            <td style="padding:6px 0;text-align:right;color:#111827">${params.destinatario}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280">País</td>
            <td style="padding:6px 0;text-align:right;color:#111827">${params.paisDestino}</td>
          </tr>
        </table>
      </div>

      <p style="color:#6b7280;font-size:13px;line-height:1.6;text-align:center">
        ¿Necesitas enviar más dinero? Puedes hacer una nueva transferencia desde tu panel.
      </p>

      ${button('Hacer otra transferencia →', `${APP_URL}/transferir`)}
    `),
  }
}

// ─── OPERACIÓN RECHAZADA ───────────────────────────────────────
export function operacionRechazadaEmail(params: {
  nombre: string
  codigoOperacion: string
  montoOrigen: string
  monedaOrigen: string
  motivo?: string | null
}): { subject: string; html: string } {
  return {
    subject: `Operación ${params.codigoOperacion} — Requiere tu atención`,
    html: baseLayout(`
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Operación no procesada</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px">
        Hola ${params.nombre}, no pudimos procesar tu transferencia <strong>${params.codigoOperacion}</strong>
        por ${params.montoOrigen} ${params.monedaOrigen}.
      </p>

      ${params.motivo ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:20px">
        <p style="color:#991b1b;font-size:13px;font-weight:600;margin:0 0 4px">Motivo</p>
        <p style="color:#dc2626;font-size:14px;margin:0;line-height:1.5">${params.motivo}</p>
      </div>
      ` : ''}

      <p style="color:#6b7280;font-size:13px;line-height:1.6">
        Puedes crear una nueva operación con los datos corregidos, o contactar a nuestro equipo
        por WhatsApp si necesitas ayuda.
      </p>

      ${button('Intentar de nuevo →', `${APP_URL}/transferir`)}
    `),
  }
}

// ─── RECARGA DE BILLETERA APROBADA ─────────────────────────────
export function recargaAprobadaEmail(params: {
  nombre: string
  monto: string
  moneda: string
  saldoActual: string
}): { subject: string; html: string } {
  return {
    subject: `Recarga aprobada — ${params.monto} ${params.moneda} acreditados`,
    html: baseLayout(`
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Recarga acreditada</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px">
        Hola ${params.nombre}, tu recarga fue aprobada y ya está disponible en tu billetera.
      </p>

      <div style="background:#f8f7ff;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px">
        <p style="color:#6b7280;font-size:12px;margin:0 0 4px">Monto acreditado</p>
        <p style="color:${BRAND_COLOR};font-size:28px;font-weight:800;margin:0">+${params.monto} ${params.moneda}</p>
        <p style="color:#9ca3af;font-size:12px;margin:8px 0 0">Saldo actual: ${params.saldoActual} ${params.moneda}</p>
      </div>

      ${button('Ver mi billetera →', `${APP_URL}/billetera`)}
    `),
  }
}
