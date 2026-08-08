'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Error crítico</h1>
            <p className="text-gray-500 text-sm mb-6">
              Ocurrió un error inesperado. Tu información está segura.
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 font-mono mb-4">Ref: {error.digest}</p>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
