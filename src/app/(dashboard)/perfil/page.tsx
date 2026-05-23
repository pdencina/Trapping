// src/app/(dashboard)/perfil/page.tsx
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getValidadoLabel } from '@/utils/format'
import type { Metadata } from 'next'
import type { Profile } from '@/types/database'

export const metadata: Metadata = { title: 'Mi perfil' }

async function actualizarPerfil(formData: FormData) {
  'use server'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').update({
    name: formData.get('name') as string,
    lastname: formData.get('lastname') as string,
    celular: formData.get('celular') as string,
    direccion: (formData.get('direccion') as string) || null,
    fono: (formData.get('fono') as string) || null,
  }).eq('id', user.id)

  revalidatePath('/perfil')
}

export default async function PerfilPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profileData }, { data: tiposDoc }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('tipos_documentos').select('id, nombre_documento').is('deleted_at', null),
  ])

  const profile = profileData as Profile | null
  if (!profile) return null

  const { label: estadoLabel, color: estadoColor } = getValidadoLabel(profile.validado)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestiona tu información personal</p>
      </div>

      {/* Estado de validación */}
      <div className={`card p-5 flex items-center gap-4 ${profile.validado === 1 ? 'border-green-200 bg-green-50' : profile.validado === 2 ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Estado de tu cuenta</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {profile.validado === 0 && 'Tu perfil está siendo revisado por nuestro equipo. Te notificaremos cuando sea aprobado.'}
            {profile.validado === 1 && '¡Tu cuenta está activa y puedes realizar transferencias!'}
            {profile.validado === 2 && 'Tu solicitud fue rechazada. Actualiza tus datos y vuelve a enviar.'}
            {profile.validado === 4 && 'Tu perfil está en revisión adicional.'}
          </p>
        </div>
        <span className={`badge ${estadoColor} flex-shrink-0`}>{estadoLabel}</span>
      </div>

      {/* Datos del perfil */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 font-bold text-xl">
              {profile.name?.[0]?.toUpperCase()}{profile.lastname?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{profile.name} {profile.lastname}</p>
            <p className="text-sm text-gray-500">{user!.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {profile.rut && `Documento: ${profile.rut}`}
            </p>
          </div>
        </div>

        <form action={actualizarPerfil} className="space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">
            Datos personales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre</label>
              <input name="name" defaultValue={profile.name ?? ''} required className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Apellido</label>
              <input name="lastname" defaultValue={profile.lastname ?? ''} required className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Celular</label>
              <input name="celular" defaultValue={profile.celular ?? ''} className="input-field" placeholder="+56 9 1234 5678" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Teléfono fijo</label>
              <input name="fono" defaultValue={profile.fono ?? ''} className="input-field" placeholder="+56 2 1234 5678" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Dirección</label>
              <input name="direccion" defaultValue={profile.direccion ?? ''} className="input-field" placeholder="Tu dirección en Chile" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary text-sm px-6">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>

      {/* Info documento */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Documentos de identidad</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-4 border-2 border-dashed text-center ${profile.documento ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <p className="text-xs font-medium text-gray-600 mb-1">Documento de identidad</p>
            {profile.documento ? (
              <p className="text-xs text-green-600 font-medium">✓ Cargado</p>
            ) : (
              <p className="text-xs text-gray-400">Sin cargar</p>
            )}
          </div>
          <div className={`rounded-xl p-4 border-2 border-dashed text-center ${profile.foto ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <p className="text-xs font-medium text-gray-600 mb-1">Foto de perfil</p>
            {profile.foto ? (
              <p className="text-xs text-green-600 font-medium">✓ Cargada</p>
            ) : (
              <p className="text-xs text-gray-400">Sin cargar</p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Para subir documentos, contacta a nuestro equipo por WhatsApp
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Último ingreso', value: profile.last_login ? new Date(profile.last_login).toLocaleDateString('es-CL') : 'Primera vez' },
          { label: 'Total ingresos', value: profile.total_login?.toString() ?? '0' },
          { label: 'Cuenta desde', value: new Date(profile.created_at).toLocaleDateString('es-CL') },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="font-semibold text-gray-900 text-sm">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
