'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Reportar a Sentry automáticamente
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="card p-10">
          <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={32} className="text-danger-600" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Algo salió mal
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Ocurrió un error inesperado. No te preocupes, tu información está segura.
            Intenta de nuevo o vuelve al inicio.
          </p>

          {error.digest && (
            <p className="text-xs text-gray-400 font-mono mb-4">
              Ref: {error.digest}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Intentar de nuevo
            </button>
            <Link href="/dashboard" className="btn-secondary w-full flex items-center justify-center gap-2">
              <Home size={16} />
              Ir al inicio
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Si el problema persiste, escríbenos por WhatsApp.
        </p>
      </div>
    </div>
  )
}
