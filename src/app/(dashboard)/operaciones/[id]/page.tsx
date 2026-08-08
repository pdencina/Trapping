import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatMoneda, getEstatusLabel } from '@/utils/format'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Copy, ExternalLink, Download } from 'lucide-react'
import Link from 'next/link'
import OperacionTimeline from '@/components/operaciones/OperacionTimeline'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Detalle de operación' }

export default async function OperacionDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
        destinatarios(name, lastname, paises(nombre_pais, siglas))
      ),
      cuentas(numero_cuenta, bancos(nombre_banco))
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!operacion) redirect('/operaciones')

  const dest = operacion.cuentas_destinatarios?.destinatarios
  const cuentaDest = operacion.cuentas_destinatarios
  const { label: estatusLabel, color: estatusColor } = getEstatusLabel(operacion.estatus_id)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/operaciones" className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Operación {operacion.codigo_operacion}</h1>
          <p className="text-sm text-gray-500">
            {format(new Date(operacion.created_at), "d 'de' MMMM yyyy · HH:mm", { locale: es })}
          </p>
        </div>
        <span className={`badge text-xs ${estatusColor}`}>{estatusLabel}</span>
      </div>

      {/* Timeline */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Estado de tu transferencia</h2>
        <OperacionTimeline
          estatusId={operacion.estatus_id}
          createdAt={operacion.created_at}
          updatedAt={operacion.updated_at}
        />
      </div>

      {/* Resumen de montos */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Resumen</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Monto enviado</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatMoneda(operacion.monto_origen, operacion.moneda_origen)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Tasa aplicada</span>
            <span className="text-sm text-gray-700">
              1 {operacion.moneda_origen} = {operacion.tasas?.valor?.toFixed(4)} {operacion.moneda_destino}
            </span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="text-sm font-medium text-brand-800">Destinatario recibe</span>
            <span className="text-lg font-bold text-brand-700">
              {formatMoneda(operacion.monto_destino, operacion.moneda_destino)}
            </span>
          </div>
        </div>
      </div>

      {/* Destinatario */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Destinatario</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Nombre</span>
            <span className="text-sm font-medium text-gray-900">{dest?.name} {dest?.lastname}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">País</span>
            <span className="text-sm text-gray-700">{dest?.paises?.nombre_pais}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Banco</span>
            <span className="text-sm text-gray-700">{cuentaDest?.bancos?.nombre_banco}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Cuenta</span>
            <span className="text-sm font-mono text-gray-700">{cuentaDest?.numero_cuenta}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Tipo</span>
            <span className="text-sm text-gray-700">{cuentaDest?.tipos_cuentas?.nombre_tipo}</span>
          </div>
        </div>
      </div>

      {/* Propósito y observaciones */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Detalles adicionales</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Propósito</span>
            <span className="text-sm text-gray-700">
              {operacion.operaciones_propositos?.nombre_proposito ?? '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Método de pago</span>
            <span className="text-sm text-gray-700">
              {operacion.billetera_id ? 'Billetera Trapping' : 'Transferencia bancaria'}
            </span>
          </div>
          {operacion.observaciones && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs font-medium text-amber-700 mb-1">Observaciones</p>
              <p className="text-sm text-amber-600">{operacion.observaciones}</p>
            </div>
          )}
        </div>
      </div>

      {/* Código de operación + Descargar PDF */}
      <div className="card p-5 bg-gray-50 border-dashed">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Código de operación</p>
            <p className="text-base font-mono font-bold text-brand-700 mt-0.5">{operacion.codigo_operacion}</p>
          </div>
          <a
            href={`/api/operaciones/${params.id}/comprobante`}
            className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2"
            download
          >
            <Download size={14} /> Descargar PDF
          </a>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <Link
          href={`/transferir?repetir=1&moneda_origen=${operacion.moneda_origen}&moneda_destino=${operacion.moneda_destino}&monto=${operacion.monto_origen}&cuenta_destinatario=${operacion.cuenta_destinatario_id}&proposito=${operacion.proposito_id}`}
          className="btn-primary flex-1 text-center text-sm"
        >
          Repetir esta operación
        </Link>
        <Link href="/operaciones" className="btn-secondary flex-1 text-center text-sm">
          Volver al historial
        </Link>
      </div>
    </div>
  )
}
