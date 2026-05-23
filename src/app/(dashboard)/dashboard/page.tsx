// src/app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { formatMoneda, getEstatusLabel } from '@/utils/format'
import Link from 'next/link'
import { ArrowRightLeft, Plus, Clock, TrendingUp } from 'lucide-react'
import type { Metadata } from 'next'
import type { Billetera } from '@/types/database'

export const metadata: Metadata = { title: 'Inicio' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [billeterasRes, operacionesRes] = await Promise.all([
    supabase.from('billeteras').select('*').eq('user_id', user!.id).is('deleted_at', null),
    supabase.from('operaciones')
      .select('id, estatus_id, monto_origen, moneda_origen, codigo_operacion, cuentas_destinatarios(destinatarios(name, lastname, paises(nombre_pais)))')
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const billeteras = (billeterasRes.data ?? []) as Billetera[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const operaciones = (operacionesRes.data ?? []) as any[]

  const totalEnviado = operaciones
    .filter((o) => o.estatus_id === 4)
    .reduce((acc: number, o: { monto_origen: number }) => acc + o.monto_origen, 0)

  return (
    <div className="space-y-6 max-w-5xl">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mis billeteras</h2>
          <Link href="/billetera/recargar" className="text-sm text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1">
            <Plus size={14} /> Recargar
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {billeteras.map(b => (
            <div key={b.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                    <span className="text-brand-700 text-xs font-bold">{b.moneda}</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {b.moneda === 'CLP' ? 'Peso chileno' : 'Dólar estadounidense'}
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatMoneda(b.saldo, b.moneda)}</p>
              <p className="text-xs text-gray-400 mt-1">Saldo disponible</p>
            </div>
          ))}

          <div className="card p-5 bg-brand-600 border-0">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-brand-200" />
              <span className="text-sm text-brand-100 font-medium">Total enviado</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatMoneda(totalEnviado, 'CLP')}</p>
            <p className="text-xs text-brand-200 mt-1">Operaciones completadas</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/transferir',        label: 'Enviar dinero',       icon: ArrowRightLeft, color: 'bg-brand-50 text-brand-700' },
            { href: '/billetera/recargar', label: 'Recargar billetera', icon: Plus,           color: 'bg-green-50 text-green-700' },
            { href: '/operaciones',        label: 'Mis operaciones',    icon: Clock,          color: 'bg-amber-50 text-amber-700' },
            { href: '/contactos',          label: 'Mis contactos',      icon: TrendingUp,     color: 'bg-blue-50 text-blue-700' },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link key={href} href={href}
              className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon size={18} />
              </div>
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Últimas operaciones</h2>
          <Link href="/operaciones" className="text-sm text-brand-600 font-medium hover:text-brand-700">Ver todas →</Link>
        </div>
        <div className="card overflow-hidden">
          {!operaciones.length ? (
            <div className="p-12 text-center">
              <ArrowRightLeft size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Aún no tienes operaciones</p>
              <Link href="/transferir" className="btn-primary mt-4 inline-flex">Hacer primera transferencia</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {operaciones.map((op) => {
                const { label, color } = getEstatusLabel(op.estatus_id)
                const dest = op.cuentas_destinatarios?.destinatarios
                return (
                  <div key={op.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <ArrowRightLeft size={16} className="text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {dest?.name} {dest?.lastname}
                        <span className="text-gray-400 ml-1">· {dest?.paises?.nombre_pais}</span>
                      </p>
                      <p className="text-xs text-gray-400 truncate">{op.codigo_operacion}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatMoneda(op.monto_origen, op.moneda_origen)}
                      </p>
                      <span className={`badge text-[10px] mt-0.5 ${color}`}>{label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
