import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="card p-10">
          {/* 404 estilizado */}
          <div className="mb-6">
            <p className="text-7xl font-bold text-brand-200">404</p>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Página no encontrada
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            La página que buscas no existe o fue movida. Vuelve al inicio para continuar.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="btn-primary w-full flex items-center justify-center gap-2">
              <Home size={16} />
              Ir al inicio
            </Link>
            <Link href="/" className="btn-secondary w-full flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              Ir a la landing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
