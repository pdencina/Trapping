// src/app/(dashboard)/contactos/page.tsx
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Star, Plus, ArrowRightLeft, Trash2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contactos' }

async function crearDestinatario(formData: FormData) {
  'use server'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: destinatario, error } = await supabase
    .from('destinatarios')
    .insert({
      user_id: user.id,
      rut: formData.get('rut') as string,
      tipo_documento_id: Number(formData.get('tipo_documento_id')),
      name: formData.get('name') as string,
      lastname: formData.get('lastname') as string,
      email: (formData.get('email') as string) || null,
      celular: (formData.get('celular') as string) || null,
      pais_id: Number(formData.get('pais_id')),
      estatus: true,
      favorito: false,
    })
    .select('id, rut, tipo_documento_id, name, lastname')
    .single()

  if (error || !destinatario) {
    redirect('/contactos?nuevo=1&error=' + encodeURIComponent(error?.message ?? 'No se pudo crear el contacto'))
  }

  const bancoId = Number(formData.get('banco_id'))
  const tipoCuentaId = Number(formData.get('tipo_cuenta_id'))
  const numeroCuenta = String(formData.get('numero_cuenta') ?? '').trim()

  if (bancoId && tipoCuentaId && numeroCuenta) {
    const { error: cuentaError } = await supabase.from('cuentas_destinatarios').insert({
      destinatario_id: destinatario.id,
      rut: (formData.get('rut_cuenta') as string) || destinatario.rut,
      tipo_documento_id: Number(formData.get('tipo_documento_cuenta_id')) || destinatario.tipo_documento_id,
      banco_id: bancoId,
      tipo_cuenta_id: tipoCuentaId,
      clase_cuenta: (formData.get('clase_cuenta') as 'Persona' | 'Empresa') || 'Persona',
      razon_social: (formData.get('razon_social') as string) || `${destinatario.name ?? ''} ${destinatario.lastname ?? ''}`.trim(),
      numero_cuenta: numeroCuenta,
      favorito: true,
    })

    if (cuentaError) {
      redirect('/contactos?nuevo=1&error=' + encodeURIComponent(`Contacto creado, pero falló la cuenta bancaria: ${cuentaError.message}`))
    }
  }

  revalidatePath('/contactos')
  revalidatePath('/transferir')
  redirect('/contactos?success=' + encodeURIComponent('Contacto y cuenta bancaria creados correctamente'))
}

async function eliminarDestinatario(id: number) {
  'use server'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('destinatarios')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/contactos')
  revalidatePath('/transferir')
}

async function toggleFavorito(id: number, actual: boolean) {
  'use server'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('destinatarios')
    .update({ favorito: !actual })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/contactos')
  revalidatePath('/transferir')
}

export default async function ContactosPage({
  searchParams,
}: { searchParams: { nuevo?: string; error?: string; success?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: destinatarios },
    { data: paises },
    { data: tiposDoc },
    { data: bancos },
    { data: tiposCuenta },
  ] = await Promise.all([
    supabase.from('destinatarios')
      .select('*, paises(nombre_pais), cuentas_destinatarios(id, numero_cuenta, bancos(nombre_banco), tipos_cuentas(nombre_tipo))')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('favorito', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('paises').select('id, nombre_pais').is('deleted_at', null).eq('estatus', true).order('nombre_pais'),
    supabase.from('tipos_documentos').select('id, nombre_documento').is('deleted_at', null),
    supabase.from('bancos').select('id, nombre_banco, pais_id').is('deleted_at', null).order('nombre_banco'),
    supabase.from('tipos_cuentas').select('id, nombre_tipo').is('deleted_at', null).order('nombre_tipo'),
  ])

  const mostrarFormulario = searchParams.nuevo === '1'

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contactos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{destinatarios?.length ?? 0} destinatarios registrados</p>
        </div>
        <a href="/contactos?nuevo=1" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Nuevo contacto
        </a>
      </div>

      {searchParams.error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {searchParams.error}
        </div>
      )}

      {searchParams.success && (
        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          {searchParams.success}
        </div>
      )}

      {/* Formulario nuevo contacto */}
      {mostrarFormulario && (
        <div className="card p-6 border-brand-200 border-2">
          <h2 className="font-semibold text-gray-900 mb-1">Nuevo destinatario</h2>
          <p className="text-sm text-gray-500 mb-5">Agrega el contacto junto con su cuenta bancaria para que pueda usarse inmediatamente en una transferencia.</p>
          <form action={crearDestinatario} className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Datos del destinatario</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre *</label>
                  <input name="name" required className="input-field" placeholder="Nombre" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Apellido *</label>
                  <input name="lastname" required className="input-field" placeholder="Apellido" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo documento *</label>
                  <select name="tipo_documento_id" required className="input-field">
                    <option value="">Seleccionar...</option>
                    {tiposDoc?.map(t => <option key={t.id} value={t.id}>{t.nombre_documento}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Número documento *</label>
                  <input name="rut" required className="input-field" placeholder="Número de documento" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">País *</label>
                  <select name="pais_id" required className="input-field">
                    <option value="">Seleccionar...</option>
                    {paises?.map(p => <option key={p.id} value={p.id}>{p.nombre_pais}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                  <input name="email" type="email" className="input-field" placeholder="email@ejemplo.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Celular</label>
                  <input name="celular" className="input-field" placeholder="+58 412 123 4567" />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Cuenta bancaria del destinatario</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <option value="">Seleccionar...</option>
                    {tiposCuenta?.map(t => <option key={t.id} value={t.id}>{t.nombre_tipo}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Número de cuenta *</label>
                  <input name="numero_cuenta" required className="input-field" placeholder="Número de cuenta" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo persona</label>
                  <select name="clase_cuenta" className="input-field" defaultValue="Persona">
                    <option value="Persona">Persona</option>
                    <option value="Empresa">Empresa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Documento cuenta</label>
                  <input name="rut_cuenta" className="input-field" placeholder="Si es distinto al contacto" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo documento cuenta</label>
                  <select name="tipo_documento_cuenta_id" className="input-field">
                    <option value="">Usar el mismo del contacto</option>
                    {tiposDoc?.map(t => <option key={t.id} value={t.id}>{t.nombre_documento}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Razón social / titular</label>
                  <input name="razon_social" className="input-field" placeholder="Opcional, si es distinto al nombre del contacto" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary text-sm px-6">Guardar contacto</button>
              <a href="/contactos" className="btn-secondary text-sm px-6">Cancelar</a>
            </div>
          </form>
        </div>
      )}

      {/* Lista de contactos */}
      {!destinatarios?.length ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No tienes contactos aún</p>
          <a href="/contactos?nuevo=1" className="btn-primary text-sm">Agregar primer contacto</a>
        </div>
      ) : (
        <div className="space-y-3">
          {(destinatarios as any[]).map(d => (
            <div key={d.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-700 font-semibold text-sm">
                      {d.name?.[0]}{d.lastname?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {d.name} {d.lastname}
                      {d.favorito && <Star size={12} className="inline ml-1.5 text-amber-400 fill-amber-400" />}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(d.paises as any)?.nombre_pais}
                      {d.email && <span className="ml-2">· {d.email}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <form action={toggleFavorito.bind(null, d.id, d.favorito)}>
                    <button className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center transition-colors" title="Favorito">
                      <Star size={14} className={d.favorito ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                    </button>
                  </form>
                  <a href="/transferir"
                    className="w-8 h-8 rounded-lg hover:bg-brand-50 flex items-center justify-center transition-colors text-brand-600"
                    title="Enviar">
                    <ArrowRightLeft size={14} />
                  </a>
                  <form action={eliminarDestinatario.bind(null, d.id)}>
                    <button className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors text-gray-300 hover:text-red-500" title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </div>

              {/* Cuentas bancarias del destinatario */}
              {d.cuentas_destinatarios?.length > 0 ? (
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                  {d.cuentas_destinatarios.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="font-medium text-gray-700">{c.bancos?.nombre_banco}</span>
                      <span>{c.tipos_cuentas?.nombre_tipo} · {c.numero_cuenta}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Este contacto aún no tiene cuenta bancaria. Agrégalo nuevamente con cuenta o carga una cuenta desde base de datos.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
