'use server'
// src/lib/actions/notifications.ts
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'operacion'

export type Notification = {
  id: number
  user_id: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
  read_at: string | null
}

/**
 * Obtiene las notificaciones del usuario actual.
 * Retorna las últimas 20 ordenadas por fecha.
 */
export async function getNotificaciones(limit = 20): Promise<Notification[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as Notification[]
}

/**
 * Cuenta las notificaciones no leídas del usuario actual.
 */
export async function getUnreadCount(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return count ?? 0
}

/**
 * Marca una notificación como leída.
 */
export async function markAsRead(notificationId: number): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}

/**
 * Marca todas las notificaciones como leídas.
 */
export async function markAllAsRead(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('read', false)

  revalidatePath('/dashboard')
}

// ─── Funciones para crear notificaciones (usan service client) ───

/**
 * Crea una notificación para un usuario específico.
 * Se usa desde server actions cuando ocurre un evento relevante.
 */
export async function crearNotificacion(params: {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}): Promise<void> {
  const service = createServiceClient()
  await service.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link ?? null,
  })
}

/**
 * Notificación de operación creada.
 */
export async function notificarOperacionCreadaInApp(userId: string, codigo: string): Promise<void> {
  await crearNotificacion({
    userId,
    type: 'operacion',
    title: 'Operación registrada',
    message: `Tu transferencia ${codigo} fue creada. La revisaremos pronto.`,
    link: '/operaciones',
  })
}

/**
 * Notificación de operación completada.
 */
export async function notificarOperacionCompletadaInApp(userId: string, codigo: string): Promise<void> {
  await crearNotificacion({
    userId,
    type: 'success',
    title: '¡Transferencia completada!',
    message: `La operación ${codigo} fue procesada. El dinero ya llegó a destino.`,
    link: '/operaciones',
  })
}

/**
 * Notificación de operación rechazada.
 */
export async function notificarOperacionRechazadaInApp(userId: string, codigo: string, motivo?: string): Promise<void> {
  await crearNotificacion({
    userId,
    type: 'warning',
    title: 'Operación no procesada',
    message: motivo
      ? `La operación ${codigo} no pudo ser procesada: ${motivo}`
      : `La operación ${codigo} no pudo ser procesada. Revisa los detalles.`,
    link: '/operaciones',
  })
}

/**
 * Notificación de cuenta aprobada (KYC).
 */
export async function notificarCuentaAprobadaInApp(userId: string): Promise<void> {
  await crearNotificacion({
    userId,
    type: 'success',
    title: '¡Cuenta verificada!',
    message: 'Tu identidad fue verificada correctamente. Ya puedes enviar dinero.',
    link: '/transferir',
  })
}
