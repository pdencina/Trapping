// src/app/(admin)/admin/tasas/page.tsx
import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Plus, Pencil, Power } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin · Tasas' }

async function crearTasa(formData: FormData) {
  'use server'
  const supabase = createServiceClient()
  await supabase.from('tasas').insert({
    moneda_origen: formData.get('moneda_origen') as string,
    valor: parseFloat(formData.get('valor') as string),
    moneda_destino: formData.get('moneda_destino') as string,
    monto_minimo: parseFloat((formData.get('monto_minimo') as string) || '0'),
    monto_maximo: parseFloat((formData.get('monto_maximo') as string) || '0'),
    impuesto_moneda_origen: parseFloat((formData.get('impuesto') as string) || '19'),
    activo: true,
  })
  revalidatePath('/admin/tasas')
}

async function toggleTasa(id: number, activo: boolean) {
  'use server'
  const supabase = createServiceClient()
  await supabase.from('tasas').update({ activo: !activo }).eq('id', id)
  revalidatePath('/admin/tasas')
}

async function actualizarValor(formData: FormData) {
  'use server'
  const supabase = createServiceClient()
  const id = Number(formData.get('id'))
  await supabase.from('tasas').update({
    valor: parseFloat(formData.get('valor') as string),
    monto_minimo: parseFloat((formData.get('monto_minimo') as string) || '0'),
    monto_maximo: parseFloat((formData.get('monto_maximo') as string) || '0'),
  }).eq('id', id)
  revalidatePath('/admin/tasas')
}

export default async function AdminTasasPage({
  searchParams,
}: { searchParams: { nueva?: string; editar?: string } }) {
  const supabase = createServiceClient()
  const { data: tasas } = await supabase
    .from('tasas')
    .select('*')
    .is('deleted_at', null)
    .order('moneda_origen')

  const MONEDAS = ['CLP', 'USD', 'ARS', 'COP', 'VES', 'PAB', 'PEN']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasas de cambio</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestiona las tasas de conversión</p>
        </div>
        <a href="/admin/tasas?nueva=1" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Nueva tasa
        </a>
      </div>

      {/* Formulario nueva tasa */}
      {searchParams.nueva === '1' && (
        <div className="card p-6 border-brand-200 border-2">
          <h2 className="font-semibold text-gray-900 mb-5">Nueva tasa de cambio</h2>
          <form action={crearTasa} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Moneda origen</label>
                <select name="moneda_origen" required className="input-field">
                  {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Moneda destino</label>
                <select name="moneda_destino" required className="input-field">
                  {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Valor (tasa)</label>
                <input name="valor" type="number" step="0.0000000001" required
                  className="input-field" placeholder="0.0000358700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Monto mínimo</label>
                <input name="monto_minimo" type="number" step="0.01" className="input-field" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Monto máximo (0=sin límite)</label>
                <input name="monto_maximo" type="number" step="0.01" className="input-field" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Impuesto %</label>
                <input name="impuesto" type="number" step="0.01" defaultValue="19"
                  className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary text-sm px-6">Crear tasa</button>
              <a href="/admin/tasas" className="btn-secondary text-sm px-6">Cancelar</a>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de tasas */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Par', 'Valor', 'Mín', 'Máx', 'Impuesto', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tasas?.map((t: any) => {
              const editando = searchParams.editar === String(t.id)
              return (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-900">{t.moneda_origen}</span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span className="font-semibold text-gray-900">{t.moneda_destino}</span>
                  </td>
                  {editando ? (
                    <td colSpan={4} className="px-5 py-3">
                      <form action={actualizarValor} className="flex items-center gap-2 flex-wrap">
                        <input type="hidden" name="id" value={t.id} />
                        <input name="valor" type="number" step="0.0000000001"
                          defaultValue={t.valor} className="input-field w-36 text-xs py-1.5" />
                        <input name="monto_minimo" type="number" step="0.01"
                          defaultValue={t.monto_minimo} className="input-field w-28 text-xs py-1.5" placeholder="Mín" />
                        <input name="monto_maximo" type="number" step="0.01"
                          defaultValue={t.monto_maximo} className="input-field w-28 text-xs py-1.5" placeholder="Máx" />
                        <button type="submit" className="btn-primary text-xs px-3 py-1.5">Guardar</button>
                        <a href="/admin/tasas" className="btn-secondary text-xs px-3 py-1.5">Cancelar</a>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="px-5 py-4 font-mono text-xs text-gray-700">{t.valor.toFixed(8)}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{t.monto_minimo > 0 ? t.monto_minimo.toLocaleString('es-CL') : '—'}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{t.monto_maximo > 0 ? t.monto_maximo.toLocaleString('es-CL') : 'Sin límite'}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{t.impuesto_moneda_origen}%</td>
                    </>
                  )}
                  <td className="px-5 py-4">
                    <span className={`badge ${t.activo ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                      {t.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <a href={`/admin/tasas?editar=${t.id}`}
                        className="w-7 h-7 rounded-lg hover:bg-brand-50 flex items-center justify-center text-gray-400 hover:text-brand-600">
                        <Pencil size={13} />
                      </a>
                      <form action={toggleTasa.bind(null, t.id, t.activo)}>
                        <button className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${t.activo ? 'hover:bg-red-50 text-gray-400 hover:text-red-500' : 'hover:bg-green-50 text-gray-400 hover:text-green-500'}`}>
                          <Power size={13} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
