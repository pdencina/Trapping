import { getAuditLogs } from '@/lib/audit'
import { createServiceClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Shield, User, ArrowRightLeft, Settings, Building2, Wallet } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin · Audit Log' }

const actionLabels: Record<string, string> = {
  'user.approve': 'Aprobó usuario',
  'user.reject': 'Rechazó usuario',
  'user.suspend': 'Suspendió usuario',
  'user.update': 'Actualizó usuario',
  'user.tier_change': 'Cambió tier de usuario',
  'operacion.review': 'Puso operación en revisión',
  'operacion.complete': 'Completó operación',
  'operacion.reject': 'Rechazó operación',
  'tasa.create': 'Creó tasa',
  'tasa.update': 'Actualizó tasa',
  'tasa.toggle': 'Activó/desactivó tasa',
  'cuenta.create': 'Creó cuenta bancaria',
  'cuenta.toggle': 'Activó/desactivó cuenta',
  'banco.create': 'Creó banco',
  'config.update': 'Actualizó configuración',
}

const resourceIcons: Record<string, React.ElementType> = {
  user: User,
  operacion: ArrowRightLeft,
  tasa: Settings,
  banco: Building2,
  cuenta: Wallet,
  config: Shield,
}

const actionColors: Record<string, string> = {
  'user.approve': 'text-green-600 bg-green-50',
  'user.reject': 'text-red-600 bg-red-50',
  'user.suspend': 'text-gray-600 bg-gray-100',
  'operacion.complete': 'text-green-600 bg-green-50',
  'operacion.reject': 'text-red-600 bg-red-50',
  'operacion.review': 'text-amber-600 bg-amber-50',
}

export default async function AdminLogsPage() {
  const logs = await getAuditLogs(100)

  // Obtener nombres de admins
  const service = createServiceClient()
  const adminIds = Array.from(new Set(logs.map((l: any) => l.admin_id)))
  const { data: admins } = await service
    .from('profiles')
    .select('id, name, lastname')
    .in('id', adminIds)

  const adminMap = new Map((admins ?? []).map((a: any) => [a.id, `${a.name ?? ''} ${a.lastname ?? ''}`.trim()]))

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-500 text-sm mt-0.5">Registro de acciones administrativas</p>
      </div>

      <div className="card overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-16 text-center">
            <Shield size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400">No hay registros de auditoría aún</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log: any) => {
              const Icon = resourceIcons[log.resource_type] ?? Shield
              const colorClass = actionColors[log.action] ?? 'text-gray-600 bg-gray-50'
              const adminName = adminMap.get(log.admin_id) ?? 'Admin'

              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {actionLabels[log.action] ?? log.action}
                      </p>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500 font-mono">{log.resource_type}:{log.resource_id}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      por <span className="font-medium">{adminName}</span>
                      {' · '}
                      {format(new Date(log.created_at), "d MMM yyyy HH:mm", { locale: es })}
                    </p>
                    {log.details && (
                      <pre className="text-xs text-gray-400 mt-1.5 bg-gray-50 rounded-lg p-2 overflow-x-auto max-w-full">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
