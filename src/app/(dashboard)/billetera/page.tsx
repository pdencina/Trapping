// src/app/(dashboard)/billetera/page.tsx
import { createClient } from '@/lib/supabase/server'
import { formatMoneda } from '@/utils/format'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { Plus, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react'
import type { Metadata } from 'next'
import type { Billetera } from '@/types/database'

export const metadata: Metadata = { title: 'Billetera' }

export default async function BilleteraPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [billeterasRes, historialRes] = await Promise.all([
    supabase.from('billeteras').select('*').eq('user_id', user!.id).is('deleted_at', null),
    supabase.from('billeteras_historial')
      .select('*')
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const billeteras = (billeterasRes.data ?? []) as Billetera[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const historial = (historialRes.data ?? []) as any[]

  const tipoIcon = {
    recarga: ArrowDownLeft,
    envio: ArrowUpRight,
    retiro: ArrowUpRight,
  }
  const tipoColor = {
    recarga: 'text-green-600 bg-green-50',
    envio: 'text-red-500 bg-red-50',
    retiro: 'text-red-500 bg-red-50',
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Billetera</h1>
        <Link href="/billetera/recargar" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Recargar
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {billeteras.map(b => (
          <div key={b.id} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center">
                  <span className="text-brand-700 font-bold text-sm">{b.moneda}</span>
                </div>
                <span className="text-gray-600 font-medium">
                  {b.moneda === 'CLP' ? 'Peso chileno' : 'Dólar'}
                </span>
              </div>
              <RefreshCw size={15} className="text-gray-300" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatMoneda(b.saldo, b.moneda)}</p>
            <p className="text-xs text-gray-400 mt-1">Saldo disponible</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de movimientos</h2>
        <div className="card overflow-hidden">
          {!historial.length ? (
            <div className="p-12 text-center text-gray-400 text-sm">No hay movimientos aún</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {historial.map((h) => {
                const tipo = h.tipo as keyof typeof tipoIcon
                const Icon = tipoIcon[tipo] ?? RefreshCw
                const iconColor = tipoColor[tipo] ?? 'text-gray-400 bg-gray-50'
                return (
                  <div key={h.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 capitalize">{h.tipo}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(h.created_at), "d MMM yyyy · HH:mm", { locale: es })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${h.tipo === 'recarga' ? 'text-green-600' : 'text-red-500'}`}>
                        {h.tipo === 'recarga' ? '+' : '-'}{formatMoneda(h.monto_aprobado ?? 0, h.moneda_billetera)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Saldo: {formatMoneda(h.saldo_billetera, h.moneda_billetera)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
