'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error en auth:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-sm text-center">
        <div className="card p-8">
          <div className="w-14 h-14 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={26} className="text-danger-600" />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Error de conexión
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            No pudimos procesar tu solicitud. Verifica tu conexión e intenta de nuevo.
          </p>

          <div className="space-y-3">
            <button onClick={reset} className="btn-primary w-full flex items-center justify-center gap-2">
              <RefreshCw size={15} /> Intentar de nuevo
            </button>
            <Link href="/login" className="btn-secondary w-full block">
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
