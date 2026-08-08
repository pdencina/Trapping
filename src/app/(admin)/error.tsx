'use client'

import { useEffect } from 'react'
import { ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error en admin:', error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={28} className="text-danger-600" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Error en el panel admin
        </h2>
        <p className="text-gray-500 text-sm mb-2">
          Ocurrió un error cargando esta sección del panel de administración.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mb-4">Ref: {error.digest}</p>
        )}

        <div className="flex gap-3 justify-center mt-6">
          <button onClick={reset} className="btn-primary flex items-center gap-2 text-sm">
            <RefreshCw size={15} /> Reintentar
          </button>
          <Link href="/admin/operaciones" className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowLeft size={15} /> Panel admin
          </Link>
        </div>
      </div>
    </div>
  )
}
