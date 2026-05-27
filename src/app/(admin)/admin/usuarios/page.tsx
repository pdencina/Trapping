// src/app/(admin)/admin/usuarios/page.tsx
import { createServiceClient } from '@/lib/supabase/server'
import { getValidadoLabel } from '@/utils/format'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin · Usuarios' }

async function cambiarValidado(userId: string, validado: number, email: string, nombre: string) {
  'use server'
  const supabase = createServiceClient()
  
  await supabase.from('profiles').update({ validado }).eq('id', userId)

  // Enviar email de notificación via Resend
  if (validado === 1) {
    // Aprobado — enviar email de bienvenida
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Trapping <no-reply@${process.env.RESEND_DOMAIN ?? 'trapping.cl'}>`,
        to: email,
        subject: '¡Tu cuenta fue aprobada! Ya puedes enviar dinero 🎉',
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <div style="background:#5b21b6;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
              <h1 style="color:#fff;font-size:24px;margin:0">Trapping</h1>
            </div>
            <h2 style="color:#111827;font-size:20px">¡Hola${nombre ? `, ${nombre}` : ''}! Tu cuenta fue aprobada 🎉</h2>
            <p style="color:#6b7280;line-height:1.6">
              Nuestro equipo revisó tu documentación y todo está en orden. 
              Ya puedes acceder a tu cuenta y comenzar a enviar dinero al exterior.
            </p>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:24px 0">
              <p style="color:#374151;font-size:14px;margin:0">
                ✅ Cuenta verificada<br/>
                ✅ Documentos aprobados<br/>
                ✅ Lista para operar
              </p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
               style="display:inline-block;background:#5b21b6;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px">
              Ingresar a mi cuenta →
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:32px">
              Trapping · Plataforma de remesas desde Chile
            </p>
          </div>
        `,
      }),
    }).catch(() => {}) // No fallar si el email no se envía
  } else if (validado === 2) {
    // Rechazado — notificar también
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Trapping <no-reply@${process.env.RESEND_DOMAIN ?? 'trapping.cl'}>`,
        to: email,
        subject: 'Actualización sobre tu solicitud en Trapping',
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <div style="background:#5b21b6;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
              <h1 style="color:#fff;font-size:24px;margin:0">Trapping</h1>
            </div>
            <h2 style="color:#111827;font-size:20px">Hola${nombre ? `, ${nombre}` : ''}</h2>
            <p style="color:#6b7280;line-height:1.6">
              Revisamos tu solicitud y por el momento no pudimos aprobar tu cuenta. 
              Puedes actualizar tus documentos e intentarlo nuevamente.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/pending" 
               style="display:inline-block;background:#5b21b6;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px">
              Ver mi cuenta →
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:32px">
              Si tienes dudas, contáctanos por WhatsApp.
            </p>
          </div>
        `,
      }),
    }).catch(() => {})
  }

  revalidatePath('/admin/usuarios')
}

export default async function AdminUsuariosPage() {
  const supabase = createServiceClient()
  
  // Obtener profiles + emails de auth.users
  const { data: usuarios } = await supabase
    .from('profiles')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Obtener emails desde auth.users
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const emailMap = new Map(authUsers?.users?.map(u => [u.id, u.email]) ?? [])

  const stats = {
    total: usuarios?.length ?? 0,
    pendientes: usuarios?.filter(u => u.validado === 0).length ?? 0,
    aprobados: usuarios?.filter(u => u.validado === 1).length ?? 0,
    rechazados: usuarios?.filter(u => u.validado === 2).length ?? 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-500 text-sm mt-0.5">Aprueba o rechaza solicitudes de registro</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: stats.total,      color: 'text-gray-900' },
          { label: 'Pendientes', value: stats.pendientes,  color: 'text-amber-600' },
          { label: 'Aprobados',  value: stats.aprobados,   color: 'text-green-600' },
          { label: 'Rechazados', value: stats.rechazados,  color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Nombre', 'RUT', 'Email', 'Celular', 'Docs', 'Registrado', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios?.map(u => {
                const { label, color } = getValidadoLabel(u.validado)
                const email = emailMap.get(u.id) ?? '—'
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{u.name} {u.lastname}</p>
                      <p className="text-xs text-gray-400">{u.role}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.rut ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{email}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{u.celular ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {u.documento
                          ? <span className="badge text-green-700 bg-green-50 text-[10px]">✓ CI</span>
                          : <span className="badge text-gray-400 bg-gray-100 text-[10px]">Sin docs</span>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {format(new Date(u.created_at), 'd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${color}`}>{label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.validado === 0 && u.role !== 'Admin' && (
                        <div className="flex gap-1">
                          <form action={cambiarValidado.bind(null, u.id, 1, email, u.name ?? '')}>
                            <button className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium">
                              Aprobar
                            </button>
                          </form>
                          <form action={cambiarValidado.bind(null, u.id, 2, email, u.name ?? '')}>
                            <button className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium">
                              Rechazar
                            </button>
                          </form>
                        </div>
                      )}
                      {u.validado === 1 && (
                        <span className="text-xs text-gray-400">Activo</span>
                      )}
                      {u.validado === 2 && (
                        <form action={cambiarValidado.bind(null, u.id, 0, email, u.name ?? '')}>
                          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                            Reactivar
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
