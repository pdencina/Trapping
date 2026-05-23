// src/app/(auth)/login/page.tsx
import { loginAction } from '@/lib/actions/auth'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Trapping</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Bienvenido de vuelta</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresa a tu cuenta para continuar</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form action={loginAction} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@email.com"
                className="input-field"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-2">
              Ingresar
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-brand-600 hover:text-brand-700 font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
