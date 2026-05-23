// src/app/(admin)/admin/cuentas/page.tsx
import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Plus, Power } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin · Cuentas' }

async function crearCuenta(formData: FormData) {
  'use server'
  const supabase = createServiceClient()
  await supabase.from('cuentas').insert({
    rut: (formData.get('rut') as string) || null,
    tipo_documento_id: Number(formData.get('tipo_documento_id')),
    name: formData.get('name') as string,
    lastname: (formData.get('lastname') as string) || null,
    banco_id: Number(formData.get('banco_id')),
    tipo_cuenta_id: Number(formData.get('tipo_cuenta_id')),
    clase_cuenta: formData.get('clase_cuenta') as 'Persona' | 'Empresa',
    razon_social: (formData.get('razon_social') as string) || null,
    email: (formData.get('email') as string) || null,
    numero_cuenta: formData.get('numero_cuenta') as string,
    principal: formData.get('principal') === 'on',
    estatus: true,
  })
  revalidatePath('/admin/cuentas')
}

async function toggleCuenta(id: number, estatus: boolean) {
  'use server'
  const supabase = createServiceClient()
  await supabase.from('cuentas').update({ estatus: !estatus }).eq('id', id)
  revalidatePath('/admin/cuentas')
}

export default async function AdminCuentasPage({
  searchParams,
}: { searchParams: { nueva?: string } }) {
  const supabase = createServiceClient()

  const [{ data: cuentas }, { data: bancos }, { data: tiposCuenta }, { data: tiposDoc }] = await Promise.all([
    supabase.from('cuentas')
      .select('*, bancos(nombre_banco, paises(nombre_pais)), tipos_cuentas(nombre_tipo)')
      .is('deleted_at', null)
      .order('principal', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('bancos').select('id, nombre_banco, pais_id').is('deleted_at', null).order('nombre_banco'),
    supabase.from('tipos_cuentas').select('id, nombre_tipo').is('deleted_at', null),
    supabase.from('tipos_documentos').select('id, nombre_documento').is('deleted_at', null),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuentas de Trapping</h1>
          <p className="text-gray-500 text-sm mt-0.5">Cuentas bancarias propias para recibir pagos</p>
        </div>
        <a href="/admin/cuentas?nueva=1" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Nueva cuenta
        </a>
      </div>

      {searchParams.nueva === '1' && (
        <div className="card p-6 border-brand-200 border-2">
          <h2 className="font-semibold text-gray-900 mb-5">Nueva cuenta bancaria</h2>
          <form action={crearCuenta} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo persona</label>
                <select name="clase_cuenta" required className="input-field">
                  <option value="Persona">Persona</option>
                  <option value="Empresa">Empresa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre / Razón social *</label>
                <input name="name" required className="input-field" placeholder="Nombre del titular" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo documento *</label>
                <select name="tipo_documento_id" required className="input-field">
                  {tiposDoc?.map(t => <option key={t.id} value={t.id}>{t.nombre_documento}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">RUT / Documento</label>
                <input name="rut" className="input-field" placeholder="12.345.678-9" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Banco *</label>
                <select name="banco_id" required className="input-field">
                  <option value="">Seleccionar...</option>
                  {bancos?.map(b => <option key={b.id} value={b.id}>{b.nombre_banco}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo de cuenta *</label>
                <select name="tipo_cuenta_id" required className="input-field">
                  {tiposCuenta?.map(t => <option key={t.id} value={t.id}>{t.nombre_tipo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Número de cuenta *</label>
                <input name="numero_cuenta" required className="input-field" placeholder="00000000000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <input name="email" type="email" className="input-field" placeholder="pagos@trapping.cl" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input name="principal" type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-gray-700">Marcar como cuenta principal</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary text-sm px-6">Crear cuenta</button>
              <a href="/admin/cuentas" className="btn-secondary text-sm px-6">Cancelar</a>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(cuentas as any[])?.map(c => (
          <div key={c.id} className={`card p-5 ${!c.estatus ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{c.name} {c.lastname}</p>
                  {c.principal && <span className="badge text-brand-700 bg-brand-50 text-[10px]">Principal</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{c.bancos?.nombre_banco}</p>
              </div>
              <form action={toggleCuenta.bind(null, c.id, c.estatus)}>
                <button className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.estatus ? 'hover:bg-red-50 text-green-500 hover:text-red-500' : 'hover:bg-green-50 text-gray-300 hover:text-green-500'}`}>
                  <Power size={14} />
                </button>
              </form>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo</span>
                <span className="text-gray-700">{c.tipos_cuentas?.nombre_tipo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">N° cuenta</span>
                <span className="text-gray-700 font-mono">{c.numero_cuenta}</span>
              </div>
              {c.email && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-gray-700">{c.email}</span>
                </div>
              )}
              {c.rut && (
                <div className="flex justify-between">
                  <span className="text-gray-400">RUT</span>
                  <span className="text-gray-700">{c.rut}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
