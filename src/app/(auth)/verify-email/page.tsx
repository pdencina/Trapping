import { MailCheck } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Verifica tu email' }

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <MailCheck size={34} className="text-green-600" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600 mb-2">
            Registro exitoso
          </p>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Revisa tu correo
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed">
            Tus datos fueron registrados correctamente. Te enviamos un enlace de confirmación
            para activar tu cuenta en Trapping.
          </p>

          <div className="mt-6 rounded-2xl bg-brand-50 border border-brand-100 p-4 text-left">
            <p className="text-sm font-semibold text-gray-900">
              Próximo paso
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Abre tu correo, presiona <strong>Confirmar mi cuenta</strong> y luego inicia sesión.
              Después, un administrador revisará tu solicitud.
            </p>
          </div>

          <p className="text-xs text-gray-400 mt-5">
            Si no ves el correo, revisa Spam, Promociones o No deseados.
          </p>

          <Link href="/login" className="btn-secondary mt-6 w-full block">
            Ir al login
          </Link>
        </div>
      </div>
    </div>
  )
}
