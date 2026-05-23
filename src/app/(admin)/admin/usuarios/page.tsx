// src/app/(admin)/admin/usuarios/page.tsx
import { createServiceClient } from '@/lib/supabase/server'
import { getValidadoLabel } from '@/utils/format'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin · Usuarios' }

async function cambiarValidado(userId: string, validado: 0 | 1 | 2 | 4) {
  'use server'
  const supabase = createServiceClient()
  await supabase
    .from('profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ validado })
    .eq('id', userId)
  revalidatePath('/admin/usuarios')
}

export default async function AdminUsuariosPage() {
  const supabase = createServiceClient()
  const { data: usuarios } = await supabase
    .from('profiles')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const stats = {
    total: usuarios?.length ?? 0,
    pendientes: usuarios?.filter(u => u.validado === 0).length ?? 0,
    aprobados: usuarios?.filter(u => u.validado === 1).length ?? 0,
    rechazados: usuarios?.filter(u => u.validado === 2).length ?? 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-500 text-sm mt-0.5">Aprueba o rechaza solicitudes de registro</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: stats.total,      color: 'text-gray-900' },
          { label: 'Pendientes', value: stats.pendientes,  color: 'text-amber-600' },
          { label: 'Aprobados',  value: stats.aprobados,   color: 'text-green-600' },
          { label: 'Rechazados', value: stats.rechazados,  color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Nombre', 'RUT', 'Celular', 'Registrado', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios?.map(u => {
                const { label, color } = getValidadoLabel(u.validado)
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{u.name} {u.lastname}</p>
                      <p className="text-xs text-gray-400">{u.role}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.rut ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{u.celular ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {format(new Date(u.created_at), 'd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${color}`}>{label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.validado === 0 && u.role !== 'Admin' && (
                        <div className="flex gap-1">
                          <form action={cambiarValidado.bind(null, u.id, 1)}>
                            <button className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                              Aprobar
                            </button>
                          </form>
                          <form action={cambiarValidado.bind(null, u.id, 2)}>
                            <button className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
                              Rechazar
                            </button>
                          </form>
                        </div>
                      )}
                      {u.validado === 2 && (
                        <form action={cambiarValidado.bind(null, u.id, 0)}>
                          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                            Reactivar
                          </button>
                        </form>
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
