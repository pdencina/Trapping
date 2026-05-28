// src/app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { formatMoneda, getEstatusLabel } from '@/utils/format'
import Link from 'next/link'
import { ArrowRightLeft, Plus, Clock, Users, ChevronRight } from 'lucide-react'
import AppHeader from '@/components/layout/AppHeader'
import type { Metadata } from 'next'
import type { Billetera, Profile } from '@/types/database'

export const metadata: Metadata = { title: 'Inicio' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileRes, billeterasRes, operacionesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('billeteras').select('*').eq('user_id', user!.id).is('deleted_at', null),
    supabase.from('operaciones')
      .select('id, estatus_id, monto_origen, moneda_origen, codigo_operacion, created_at, cuentas_destinatarios(destinatarios(name, lastname, paises(nombre_pais)))')
      .eq('user_id', user!.id).is('deleted_at', null)
      .order('created_at', { ascending: false }).limit(5),
  ])

  const profile = profileRes.data as Profile | null
  const billeteras = (billeterasRes.data ?? []) as Billetera[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const operaciones = (operacionesRes.data ?? []) as any[]
  const email = user!.email

  const totalEnviado = operaciones
    .filter(o => o.estatus_id === 4)
    .reduce((acc: number, o: any) => acc + o.monto_origen, 0)

  const mainBilletera = billeteras.find(b => b.moneda === 'CLP') ?? billeteras[0]

  return (
    <div>
      {/* Header con gradiente */}
      <AppHeader
        profile={profile!}
        email={email}
        subtitle={`Hola de nuevo 👋`}
        title={profile?.name ?? 'Bienvenido'}
      >
        {/* Card de saldo */}
        {mainBilletera && (
          <div className="mt-5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl p-4">
            <p className="text-brand-200 text-xs mb-1">Saldo disponible</p>
            <p className="text-white font-bold text-3xl mb-3">
              {formatMoneda(mainBilletera.saldo, mainBilletera.moneda)}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs bg-white/20 text-white/90 px-3 py-1 rounded-full">
                Billetera {mainBilletera.moneda}
              </span>
              <Link href="/billetera/recargar"
                className="text-xs text-brand-200 flex items-center gap-1 hover:text-white transition-colors">
                + Recargar
              </Link>
            </div>
          </div>
        )}
      </AppHeader>

      <div className="px-4 py-5 space-y-6">
        {/* Acciones rápidas */}
        <section>
          <div className="grid grid-cols-4 gap-3">
            {[
              { href: '/transferir',         label: 'Enviar',    icon: ArrowRightLeft },
              { href: '/billetera/recargar',  label: 'Recargar',  icon: Plus },
              { href: '/operaciones',         label: 'Historial', icon: Clock },
              { href: '/contactos',           label: 'Contactos', icon: Users },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="card flex flex-col items-center gap-2 p-3 hover:shadow-brand transition-shadow active:scale-95">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  <Icon size={18} className="text-brand-600" />
                </div>
                <span className="text-[11px] font-medium text-gray-600">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Otras billeteras */}
        {billeteras.length > 1 && (
          <section>
            <div className="grid grid-cols-2 gap-3">
              {billeteras.filter(b => b.id !== mainBilletera?.id).map(b => (
                <div key={b.id} className="card p-4">
                  <p className="text-xs text-gray-400 mb-1">{b.moneda === 'USD' ? 'Dólar' : b.moneda}</p>
                  <p className="font-bold text-gray-900">{formatMoneda(b.saldo, b.moneda)}</p>
                </div>
              ))}
              <div className="card p-4 bg-brand-600 border-0">
                <p className="text-xs text-brand-200 mb-1">Total enviado</p>
                <p className="font-bold text-white">{formatMoneda(totalEnviado, 'CLP')}</p>
              </div>
            </div>
          </section>
        )}

        {/* Operaciones recientes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Recientes</h2>
            <Link href="/operaciones" className="text-xs text-brand-600 font-medium flex items-center gap-0.5">
              Ver todas <ChevronRight size={13} />
            </Link>
          </div>

          {!operaciones.length ? (
            <div className="card p-10 text-center">
              <ArrowRightLeft size={28} className="mx-auto text-brand-300 mb-3" />
              <p className="text-gray-500 text-sm mb-4">Aún no tienes operaciones</p>
              <Link href="/transferir" className="btn-primary text-xs px-5 py-2.5">
                Primera transferencia
              </Link>
            </div>
          ) : (
            <div className="card overflow-hidden">
              {operaciones.map((op: any) => {
                const { label, color } = getEstatusLabel(op.estatus_id)
                const dest = op.cuentas_destinatarios?.destinatarios
                return (
                  <div key={op.id} className="list-item">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <ArrowRightLeft size={16} className="text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {dest?.name} {dest?.lastname}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{dest?.paises?.nombre_pais}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatMoneda(op.monto_origen, op.moneda_origen)}
                      </p>
                      <span className={`badge text-[10px] ${color}`}>{label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
