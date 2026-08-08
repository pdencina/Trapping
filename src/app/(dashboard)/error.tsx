'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error en dashboard:', error)
  }, [error])

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <div className="card p-8">
        <div className="w-14 h-14 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-danger-600" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Error al cargar la página
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          No pudimos cargar esta sección. Tu información y operaciones están seguras.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mb-4">Ref: {error.digest}</p>
        )}

        <div className="flex gap-3">
          <button onClick={reset} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <RefreshCw size={15} /> Reintentar
          </button>
          <Link href="/dashboard" className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <ArrowLeft size={15} /> Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
