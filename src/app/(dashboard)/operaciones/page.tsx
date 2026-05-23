// src/app/(dashboard)/operaciones/page.tsx
import { getOperacionesUsuario } from '@/lib/actions/operaciones'
import { formatMoneda, getEstatusLabel } from '@/utils/format'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowRightLeft, FileText } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Operaciones' }

export default async function OperacionesPage() {
  const operaciones = await getOperacionesUsuario()

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis operaciones</h1>
          <p className="text-gray-500 text-sm mt-0.5">{operaciones.length} operaciones totales</p>
        </div>
        <a href="/transferir" className="btn-primary flex items-center gap-2 text-sm">
          <ArrowRightLeft size={15} /> Nueva transferencia
        </a>
      </div>

      <div className="card overflow-hidden">
        {operaciones.length === 0 ? (
          <div className="p-16 text-center">
            <ArrowRightLeft size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400">No tienes operaciones aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Código', 'Fecha', 'Destinatario', 'País', 'Monto', 'Recibe', 'Estado'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {operaciones.map((op: any) => {
                  const { label, color } = getEstatusLabel(op.estatus_id)
                  const dest = op.cuentas_destinatarios?.destinatarios
                  return (
                    <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-gray-600">{op.codigo_operacion}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {format(new Date(op.created_at), "d MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {dest?.name} {dest?.lastname}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {dest?.paises?.nombre_pais}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {formatMoneda(op.monto_origen, op.moneda_origen)}
                      </td>
                      <td className="px-5 py-4 text-brand-700 font-medium">
                        {formatMoneda(op.monto_destino, op.moneda_destino)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${color}`}>{label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
