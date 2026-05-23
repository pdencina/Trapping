// src/app/(admin)/admin/bancos/page.tsx
import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin · Bancos' }

async function crearBanco(formData: FormData) {
  'use server'
  const supabase = createServiceClient()
  await supabase.from('bancos').insert({
    codigo: formData.get('codigo') as string,
    nombre_banco: formData.get('nombre_banco') as string,
    pais_id: Number(formData.get('pais_id')),
    swift: (formData.get('swift') as string) || null,
  })
  revalidatePath('/admin/bancos')
}

export default async function AdminBancosPage({
  searchParams,
}: { searchParams: { nuevo?: string; pais?: string } }) {
  const supabase = createServiceClient()

  const [{ data: bancos }, { data: paises }] = await Promise.all([
    supabase.from('bancos')
      .select('*, paises(nombre_pais)')
      .is('deleted_at', null)
      .order('nombre_banco'),
    supabase.from('paises').select('id, nombre_pais').is('deleted_at', null).eq('estatus', true).order('nombre_pais'),
  ])

  const paisFiltro = searchParams.pais
  const bancosFiltrados = paisFiltro
    ? bancos?.filter((b: any) => String(b.pais_id) === paisFiltro)
    : bancos

  // Agrupar por país
  const porPais = (bancosFiltrados as any[])?.reduce((acc: any, b: any) => {
    const pais = b.paises?.nombre_pais ?? 'Sin país'
    if (!acc[pais]) acc[pais] = []
    acc[pais].push(b)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bancos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{bancos?.length ?? 0} bancos registrados</p>
        </div>
        <a href="/admin/bancos?nuevo=1" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Nuevo banco
        </a>
      </div>

      {searchParams.nuevo === '1' && (
        <div className="card p-6 border-brand-200 border-2">
          <h2 className="font-semibold text-gray-900 mb-5">Nuevo banco</h2>
          <form action={crearBanco} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">País *</label>
                <select name="pais_id" required className="input-field">
                  <option value="">Seleccionar...</option>
                  {paises?.map(p => <option key={p.id} value={p.id}>{p.nombre_pais}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Código *</label>
                <input name="codigo" required className="input-field" placeholder="0102" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre del banco *</label>
                <input name="nombre_banco" required className="input-field" placeholder="BANCO DE CHILE" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">SWIFT</label>
                <input name="swift" className="input-field" placeholder="BCHICLRM" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary text-sm px-6">Crear banco</button>
              <a href="/admin/bancos" className="btn-secondary text-sm px-6">Cancelar</a>
            </div>
          </form>
        </div>
      )}

      {/* Filtro por país */}
      <div className="flex gap-2 flex-wrap">
        <a href="/admin/bancos"
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!paisFiltro ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}>
          Todos
        </a>
        {Object.keys(porPais ?? {}).map(pais => (
          <a key={pais}
            href={`/admin/bancos?pais=${bancos?.find((b: any) => b.paises?.nombre_pais === pais)?.pais_id}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${paisFiltro && bancos?.find((b: any) => b.paises?.nombre_pais === pais && String(b.pais_id) === paisFiltro) ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}>
            {pais} ({porPais[pais].length})
          </a>
        ))}
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Código', 'Banco', 'País', 'SWIFT'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(bancosFiltrados as any[])?.map(b => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-gray-600">{b.codigo}</td>
                <td className="px-5 py-3 font-medium text-gray-900">{b.nombre_banco}</td>
                <td className="px-5 py-3 text-gray-500">{b.paises?.nombre_pais}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-400">{b.swift ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
