import { createServiceClient } from '@/lib/supabase/server'
import { formatMoneda } from '@/utils/format'
import { format, subDays, startOfMonth, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { TrendingUp, Users, ArrowRightLeft, DollarSign, Clock, CheckCircle2, XCircle, BarChart3 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin · Analytics' }

export default async function AdminAnalyticsPage() {
  const supabase = createServiceClient()

  const ahora = new Date()
  const hace30dias = subDays(ahora, 30).toISOString()
  const hace7dias = subDays(ahora, 7).toISOString()
  const inicioMes = startOfMonth(ahora).toISOString()
  const hoy = startOfDay(ahora).toISOString()

  // Obtener datos en paralelo
  const [
    { data: operaciones },
    { data: usuarios },
    { count: totalUsuarios },
    { data: operacionesHoy },
  ] = await Promise.all([
    supabase
      .from('operaciones')
      .select('id, monto_origen, moneda_origen, monto_destino, moneda_destino, estatus_id, created_at')
      .is('deleted_at', null)
      .gte('created_at', hace30dias)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, created_at, validado')
      .gte('created_at', hace30dias)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('operaciones')
      .select('id, monto_origen, estatus_id')
      .is('deleted_at', null)
      .gte('created_at', hoy),
  ])

  const ops = operaciones ?? []
  const users = usuarios ?? []
  const opsHoy = operacionesHoy ?? []

  // ─── Métricas principales ────────────────────────────────
  const volumenMes = ops
    .filter(o => o.created_at >= inicioMes)
    .reduce((sum, o) => sum + (o.monto_origen ?? 0), 0)

  const volumenSemana = ops
    .filter(o => o.created_at >= hace7dias)
    .reduce((sum, o) => sum + (o.monto_origen ?? 0), 0)

  const opsCompletadas = ops.filter(o => o.estatus_id === 4).length
  const opsPendientes = ops.filter(o => o.estatus_id === 1 || o.estatus_id === 2).length
  const opsRechazadas = ops.filter(o => o.estatus_id === 3).length
  const tasaExito = ops.length > 0 ? Math.round((opsCompletadas / ops.length) * 100) : 0

  const usuariosNuevosMes = users.filter(u => u.created_at >= inicioMes).length
  const usuariosNuevosSemana = users.filter(u => u.created_at >= hace7dias).length

  // ─── Operaciones por día (últimos 14 días) ───────────────
  const operacionesPorDia: { fecha: string; count: number; volumen: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const dia = subDays(ahora, i)
    const diaStr = format(dia, 'yyyy-MM-dd')
    const opsDelDia = ops.filter(o => o.created_at.startsWith(diaStr))
    operacionesPorDia.push({
      fecha: format(dia, 'd MMM', { locale: es }),
      count: opsDelDia.length,
      volumen: opsDelDia.reduce((s, o) => s + (o.monto_origen ?? 0), 0),
    })
  }

  const maxOps = Math.max(...operacionesPorDia.map(d => d.count), 1)

  // ─── Distribución por moneda destino ─────────────────────
  const porMoneda: Record<string, { count: number; volumen: number }> = {}
  ops.forEach(o => {
    const m = o.moneda_destino ?? 'OTRO'
    if (!porMoneda[m]) porMoneda[m] = { count: 0, volumen: 0 }
    porMoneda[m].count++
    porMoneda[m].volumen += o.monto_origen ?? 0
  })

  return (
    <div className="p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Métricas de los últimos 30 días</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Volumen del mes',
            value: formatMoneda(volumenMes, 'CLP'),
            sub: `${formatMoneda(volumenSemana, 'CLP')} esta semana`,
            icon: DollarSign,
            color: 'text-brand-600',
            bg: 'bg-brand-50',
          },
          {
            label: 'Operaciones (30d)',
            value: String(ops.length),
            sub: `${opsHoy.length} hoy`,
            icon: ArrowRightLeft,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Usuarios totales',
            value: String(totalUsuarios ?? 0),
            sub: `+${usuariosNuevosMes} este mes · +${usuariosNuevosSemana} esta semana`,
            icon: Users,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            label: 'Tasa de éxito',
            value: `${tasaExito}%`,
            sub: `${opsCompletadas} completadas · ${opsRechazadas} rechazadas`,
            icon: TrendingUp,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
        ].map(kpi => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-500 mt-2">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de barras — operaciones por día */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Operaciones por día</h2>
            <p className="text-xs text-gray-400 mt-0.5">Últimos 14 días</p>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 size={14} className="text-gray-400" />
          </div>
        </div>

        <div className="flex items-end gap-1.5 h-32">
          {operacionesPorDia.map((dia, i) => {
            const height = Math.max(4, (dia.count / maxOps) * 100)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-gray-500 font-medium">{dia.count || ''}</span>
                <div
                  className="w-full bg-brand-500 rounded-t-sm transition-all hover:bg-brand-600"
                  style={{ height: `${height}%`, minHeight: dia.count > 0 ? '4px' : '2px' }}
                  title={`${dia.fecha}: ${dia.count} ops · ${formatMoneda(dia.volumen, 'CLP')}`}
                />
                <span className="text-[9px] text-gray-400 truncate w-full text-center">{dia.fecha}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de operaciones */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Estado de operaciones (30d)</h2>
          <div className="space-y-3">
            {[
              { label: 'Completadas', count: opsCompletadas, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', bar: 'bg-green-500' },
              { label: 'Pendientes / En revisión', count: opsPendientes, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' },
              { label: 'Rechazadas', count: opsRechazadas, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' },
            ].map(item => {
              const percent = ops.length > 0 ? (item.count / ops.length) * 100 : 0
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                    <item.icon size={14} className={item.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700 font-medium">{item.label}</span>
                      <span className="text-xs text-gray-500 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.bar} rounded-full`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Distribución por moneda destino */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Por país destino (30d)</h2>
          <div className="space-y-3">
            {Object.entries(porMoneda)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([moneda, data]) => {
                const percent = ops.length > 0 ? (data.count / ops.length) * 100 : 0
                return (
                  <div key={moneda} className="flex items-center gap-3">
                    <span className="w-10 text-xs font-mono font-semibold text-brand-700">{moneda}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{data.count} operaciones</span>
                        <span className="text-xs text-gray-500">{formatMoneda(data.volumen, 'CLP')}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-400 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            {Object.keys(porMoneda).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin operaciones en los últimos 30 días</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
