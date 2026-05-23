// src/app/(auth)/register/page.tsx
import { registerAction } from '@/lib/actions/auth'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const supabase = createServiceClient()
  const { data: tiposDoc } = await supabase
    .from('tipos_documentos')
    .select('id, nombre_documento')
    .is('deleted_at', null)
    .order('nombre_documento')

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Trapping</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">Crea tu cuenta gratuita</h1>
          <p className="text-sm text-gray-500 mt-1">Completa tus datos para empezar a enviar dinero</p>
        </div>

        <div className="card p-8">
          {searchParams.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {decodeURIComponent(searchParams.error)}
            </div>
          )}

          <form action={registerAction} className="space-y-5">
            {/* Datos personales */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
                Datos personales
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                  <input name="name" type="text" required placeholder="Tu nombre"
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido *</label>
                  <input name="lastname" type="text" required placeholder="Tu apellido"
                    className="input-field" />
                </div>
              </div>
            </div>

            {/* Documento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de documento *</label>
                <select name="tipo_documento_id" required className="input-field">
                  <option value="">Seleccionar...</option>
                  {tiposDoc?.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre_documento}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Número de documento *</label>
                <input name="rut" type="text" required placeholder="Ej: 12345678-9"
                  className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono celular *</label>
              <input name="celular" type="tel" required placeholder="+56 9 1234 5678"
                className="input-field" />
            </div>

            {/* Credenciales */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
                Acceso
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input name="email" type="email" required placeholder="tu@email.com"
                    className="input-field" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña *</label>
                    <input name="password" type="password" required placeholder="Mínimo 8 caracteres"
                      minLength={8} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña *</label>
                    <input name="password_confirm" type="password" required placeholder="Repite tu contraseña"
                      className="input-field" />
                  </div>
                </div>
              </div>
            </div>

            {/* Términos */}
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input name="terms" type="checkbox" required
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 cursor-pointer" />
                <span className="text-sm text-gray-600">
                  Acepto los{' '}
                  <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">términos y condiciones</a>
                  {' '}y la{' '}
                  <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">política de privacidad</a>.
                  Entiendo que mi cuenta debe ser validada por un administrador antes de poder operar.
                </span>
              </label>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base">
              Crear mi cuenta gratis
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
