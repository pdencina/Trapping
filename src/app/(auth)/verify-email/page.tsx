// src/app/(auth)/verify-email/page.tsx
import { Mail } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Verifica tu email' }

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail size={32} className="text-brand-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Revisa tu email</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Te enviamos un enlace de confirmación. Haz clic en él para activar tu cuenta.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Una vez verificado tu email, un administrador revisará tu perfil antes de que puedas ingresar.
          </p>
          <a href="/login" className="btn-secondary mt-6 w-full block">
            Volver al login
          </a>
        </div>
      </div>
    </div>
  )
}
