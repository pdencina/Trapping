'use client'
// src/app/(auth)/login/page.tsx
import { useFormState, useFormStatus } from 'react-dom'
import { loginAction } from '@/lib/actions/auth'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full mt-2">
      {pending ? 'Ingresando...' : 'Ingresar'}
    </button>
  )
}

export default function LoginPage() {
  const [state, action] = useFormState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
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

        <div className="card p-8">
          <form action={action} className="space-y-5">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email" name="email" type="email"
                autoComplete="email" required
                placeholder="tu@email.com"
                className="input-field"
              />
              {state?.fieldErrors?.email && (
                <p className="text-xs text-red-500 mt-1">{state.fieldErrors.email[0]}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Link href="/reset-password" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="password" name="password" type="password"
                autoComplete="current-password" required
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <SubmitButton />
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
