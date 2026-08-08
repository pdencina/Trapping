// src/lib/audit.ts
// Sistema de audit logging para acciones admin sensibles

import { createServiceClient } from '@/lib/supabase/server'

export type AuditAction =
  | 'user.approve'
  | 'user.reject'
  | 'user.suspend'
  | 'user.update'
  | 'user.tier_change'
  | 'operacion.review'
  | 'operacion.complete'
  | 'operacion.reject'
  | 'tasa.create'
  | 'tasa.update'
  | 'tasa.toggle'
  | 'cuenta.create'
  | 'cuenta.toggle'
  | 'banco.create'
  | 'config.update'

export type ResourceType = 'user' | 'operacion' | 'tasa' | 'cuenta' | 'banco' | 'config'

interface AuditEntry {
  adminId: string
  action: AuditAction
  resourceType: ResourceType
  resourceId: string
  details?: Record<string, any>
}

/**
 * Registra una acción en el audit log.
 * Se llama desde server actions cuando un admin realiza una acción sensible.
 * Fire-and-forget para no bloquear el flujo.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const service = createServiceClient()
    await service.from('audit_logs').insert({
      admin_id: entry.adminId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      details: entry.details ?? null,
    })
  } catch (err) {
    // Nunca bloquear por un fallo de audit
    console.error('[Audit] Error registrando log:', err)
  }
}

/**
 * Obtiene los últimos N logs de auditoría.
 */
export async function getAuditLogs(limit = 50) {
  const service = createServiceClient()
  const { data } = await service
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}

/**
 * Obtiene logs de auditoría filtrados por recurso.
 */
export async function getAuditLogsForResource(resourceType: ResourceType, resourceId: string, limit = 20) {
  const service = createServiceClient()
  const { data } = await service
    .from('audit_logs')
    .select('*')
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}
