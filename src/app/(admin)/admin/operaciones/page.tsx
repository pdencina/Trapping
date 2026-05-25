// src/app/(admin)/admin/operaciones/page.tsx
import { getTodasOperaciones, actualizarEstatusOperacion } from '@/lib/actions/operaciones'
import { formatMoneda, getEstatusLabel } from '@/utils/format'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin · Operaciones' }

export default async function AdminOperacionesPage() {
  const operaciones = await getTodasOperaciones()

  const stats = {
    total: operaciones.length,
    generadas: operaciones.filter(o => o.estatus_id === 1).length,
    revision: operaciones.filter(o => o.estatus_id === 2).length,
    completadas: operaciones.filter(o => o.estatus_id === 4).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operaciones</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestiona todas las transferencias del sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Generadas', value: stats.generadas, color: 'text-gray-600' },
          { label: 'En revisión', value: stats.revision, color: 'text-amber-600' },
          { label: 'Completadas', value: stats.completadas, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Código', 'Fecha', 'Usuario', 'Destinatario', 'Monto', 'Recibe', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {operaciones.map((op: any) => {
                const { label, color } = getEstatusLabel(op.estatus_id)
                const profile = op.profiles
                const dest = op.cuentas_destinatarios?.destinatarios
                return (
                  <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{op.codigo_operacion}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {format(new Date(op.created_at), "d MMM HH:mm", { locale: es })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-xs">{profile?.name} {profile?.lastname}</p>
                      <p className="text-gray-400 text-xs">{profile?.rut}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium">{dest?.name} {dest?.lastname}</p>
                      <p className="text-gray-400">{dest?.paises?.nombre_pais}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatMoneda(op.monto_origen, op.moneda_origen)}
                    </td>
                    <td className="px-4 py-3 text-brand-700 font-medium">
                      {formatMoneda(op.monto_destino, op.moneda_destino)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${color}`}>{label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {op.estatus_id === 1 && (
                        <div className="flex gap-1">
                          <form action={async () => {
                            'use server'
                            await actualizarEstatusOperacion(op.id, 2)
                          }}>
                            <button className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100">
                              Revisar
                            </button>
                          </form>
                        </div>
                      )}
                      {op.estatus_id === 2 && (
                        <div className="flex gap-1">
                          <form action={async () => {
                            'use server'
                            await actualizarEstatusOperacion(op.id, 4)
                          }}>
                            <button className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                              Aprobar
                            </button>
                          </form>
                          <form action={async () => {
                            'use server'
                            await actualizarEstatusOperacion(op.id, 3)
                          }}>
                            <button className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
                              Rechazar
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
