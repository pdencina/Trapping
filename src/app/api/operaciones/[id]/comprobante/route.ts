// src/app/api/operaciones/[id]/comprobante/route.ts
// Genera un comprobante PDF de la operación
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { jsPDF } from 'jspdf'
import { formatMoneda } from '@/utils/format'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limit: 60 requests por minuto (generación de PDF)
  const rateLimited = checkRateLimit(req, RATE_LIMITS.api)
  if (rateLimited) return rateLimited

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: operacion } = await supabase
    .from('operaciones')
    .select(`
      *,
      estatus_operaciones(nombre_estatus),
      tasas(valor, moneda_origen, moneda_destino),
      operaciones_propositos(nombre_proposito),
      cuentas_destinatarios(
        numero_cuenta,
        bancos(nombre_banco),
        tipos_cuentas(nombre_tipo),
        destinatarios(name, lastname, rut, paises(nombre_pais))
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!operacion) {
    return NextResponse.json({ error: 'Operación no encontrada' }, { status: 404 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, lastname, rut')
    .eq('id', user.id)
    .single()

  const dest = operacion.cuentas_destinatarios?.destinatarios
  const cuentaDest = operacion.cuentas_destinatarios
  const estatus = operacion.estatus_operaciones?.nombre_estatus ?? 'Pendiente'

  // ─── Generar PDF ──────────────────────────────────────────
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const BRAND_COLOR: [number, number, number] = [124, 58, 237]
  const GRAY: [number, number, number] = [107, 114, 128]
  const BLACK: [number, number, number] = [17, 24, 39]
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 20

  // ── Header ──
  doc.setFillColor(...BRAND_COLOR)
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 4, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('trapping', margin + 8, y + 14)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Comprobante de Transferencia', pageWidth - margin - 8, y + 14, { align: 'right' })

  y += 32

  // ── Código de operación ──
  doc.setTextColor(...GRAY)
  doc.setFontSize(9)
  doc.text('Código de operación', margin, y)
  y += 5
  doc.setTextColor(...BRAND_COLOR)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(operacion.codigo_operacion, margin, y)

  // Fecha
  doc.setTextColor(...GRAY)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(
    format(new Date(operacion.created_at), "d 'de' MMMM yyyy · HH:mm", { locale: es }),
    pageWidth - margin,
    y,
    { align: 'right' }
  )

  y += 5
  // Estado
  doc.setFontSize(10)
  doc.setTextColor(...(operacion.estatus_id === 4 ? [22, 163, 74] as [number, number, number] : operacion.estatus_id === 3 ? [220, 38, 38] as [number, number, number] : GRAY))
  doc.setFont('helvetica', 'bold')
  doc.text(`Estado: ${estatus}`, margin, y)

  y += 12

  // ── Línea divisoria ──
  doc.setDrawColor(237, 233, 254)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // ── Resumen de montos ──
  doc.setTextColor(...BLACK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen de la operación', margin, y)
  y += 8

  const addRow = (label: string, value: string, bold = false) => {
    doc.setTextColor(...GRAY)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(label, margin + 4, y)
    doc.setTextColor(...BLACK)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.text(value, pageWidth - margin - 4, y, { align: 'right' })
    y += 6
  }

  addRow('Monto enviado', formatMoneda(operacion.monto_origen, operacion.moneda_origen))
  addRow('Tasa aplicada', `1 ${operacion.moneda_origen} = ${operacion.tasas?.valor?.toFixed(6)} ${operacion.moneda_destino}`)
  addRow('Moneda destino', operacion.moneda_destino)
  y += 2
  doc.setDrawColor(237, 233, 254)
  doc.line(margin + 4, y, pageWidth - margin - 4, y)
  y += 6
  addRow('Destinatario recibe', formatMoneda(operacion.monto_destino, operacion.moneda_destino), true)
  y += 4

  // ── Datos del remitente ──
  doc.setDrawColor(237, 233, 254)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10
  doc.setTextColor(...BLACK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Datos del remitente', margin, y)
  y += 8

  addRow('Nombre', `${(profile as any)?.name ?? ''} ${(profile as any)?.lastname ?? ''}`.trim())
  addRow('Documento', (profile as any)?.rut ?? '—')
  addRow('Email', user.email ?? '—')
  y += 4

  // ── Datos del destinatario ──
  doc.setDrawColor(237, 233, 254)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10
  doc.setTextColor(...BLACK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Datos del destinatario', margin, y)
  y += 8

  addRow('Nombre', `${dest?.name ?? ''} ${dest?.lastname ?? ''}`.trim())
  addRow('Documento', dest?.rut ?? '—')
  addRow('País', dest?.paises?.nombre_pais ?? '—')
  addRow('Banco', cuentaDest?.bancos?.nombre_banco ?? '—')
  addRow('Tipo de cuenta', cuentaDest?.tipos_cuentas?.nombre_tipo ?? '—')
  addRow('Número de cuenta', cuentaDest?.numero_cuenta ?? '—')
  y += 4

  // ── Detalles adicionales ──
  doc.setDrawColor(237, 233, 254)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10
  doc.setTextColor(...BLACK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalles adicionales', margin, y)
  y += 8

  addRow('Propósito', operacion.operaciones_propositos?.nombre_proposito ?? '—')
  addRow('Método de pago', operacion.billetera_id ? 'Billetera Trapping' : 'Transferencia bancaria')

  if (operacion.observaciones) {
    y += 2
    addRow('Observaciones', operacion.observaciones)
  }

  // ── Footer ──
  y += 12
  doc.setDrawColor(237, 233, 254)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8
  doc.setTextColor(...GRAY)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Este comprobante fue generado por Trapping. Para consultas: soporte@trapping.cl', margin, y)
  y += 4
  doc.text(`Generado el ${format(new Date(), "d/MM/yyyy HH:mm", { locale: es })}`, margin, y)

  // ── Generar buffer y responder ──
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="trapping-${operacion.codigo_operacion}.pdf"`,
      'Cache-Control': 'no-cache',
    },
  })
}
