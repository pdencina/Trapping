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
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
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
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
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

function initials(name?: string | null, lastname?: string | null) {
  const first = name?.trim()?.[0] ?? 'U'
  const last = lastname?.trim()?.[0] ?? ''
  return `${first}${last}`.toUpperCase()
}

function kycPercent(user: any) {
  let completed = 0
  if (user?.name) completed += 1
  if (user?.lastname) completed += 1
  if (user?.rut) completed += 1
  if (user?.celular) completed += 1
  if (user?.documento) completed += 1
  return Math.round((completed / 5) * 100)
}

function statusBadge(validado: number) {
  if (validado === 1) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  }
  if (validado === 2) {
    return 'bg-rose-50 text-rose-700 border-rose-100'
  }
  return 'bg-amber-50 text-amber-700 border-amber-100'
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
  const emailMap = new Map(authUsers?.users?.map((u) => [u.id, u.email]) ?? [])

  const stats = {
    total: usuarios?.length ?? 0,
    pendientes: usuarios?.filter((u) => u.validado === 0).length ?? 0,
    aprobados: usuarios?.filter((u) => u.validado === 1).length ?? 0,
    rechazados: usuarios?.filter((u) => u.validado === 2).length ?? 0,
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
            Panel KYC
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">
            Administra solicitudes KYC, documentos y validación de usuarios.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          Última actualización automática desde Supabase
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total',
            value: stats.total,
            description: 'Usuarios registrados',
            color: 'text-slate-900',
            icon: '👥',
            bg: 'bg-violet-50',
          },
          {
            label: 'En revisión',
            value: stats.pendientes,
            description: 'Pendientes de aprobación',
            color: 'text-orange-500',
            icon: '⏱',
            bg: 'bg-orange-50',
          },
          {
            label: 'Aprobados',
            value: stats.aprobados,
            description: 'Usuarios verificados',
            color: 'text-emerald-600',
            icon: '✓',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Rechazados',
            value: stats.rechazados,
            description: 'Solicitudes rechazadas',
            color: 'text-rose-600',
            icon: '×',
            bg: 'bg-rose-50',
          },
        ].map((item) => (
          <article
            key={item.label}
            className="flex min-h-[138px] items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <p className="text-sm font-semibold text-slate-500">{item.label}</p>
              <p className={`mt-4 text-4xl font-extrabold ${item.color}`}>{item.value}</p>
              <p className="mt-2 text-sm text-slate-500">{item.description}</p>
            </div>
            <div className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${item.bg}`}>
              {item.icon}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_230px_150px_145px]">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              placeholder="Buscar usuario por nombre, email, RUT o celular..."
            />
          </div>

          <select className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100">
            <option>Todos los estados</option>
            <option>Pendientes</option>
            <option>Aprobados</option>
            <option>Rechazados</option>
          </select>

          <button
            type="button"
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Más filtros
          </button>

          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-violet-300 bg-white px-4 text-sm font-extrabold text-violet-700 transition hover:bg-violet-50"
          >
            ↓ Exportar
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-left text-slate-900">
                <th className="px-6 py-5 font-extrabold">Usuario</th>
                <th className="px-6 py-5 font-extrabold">Contacto</th>
                <th className="px-6 py-5 font-extrabold">Registrado</th>
                <th className="px-6 py-5 font-extrabold">Estado KYC</th>
                <th className="px-6 py-5 font-extrabold">Documentos</th>
                <th className="px-6 py-5 text-center font-extrabold">% Perfil</th>
                <th className="px-6 py-5 font-extrabold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios?.map((u) => {
                const { label } = getValidadoLabel(u.validado)
                const email = emailMap.get(u.id) ?? '—'
                const percent = kycPercent(u)
                const approved = u.validado === 1
                const rejected = u.validado === 2

                return (
                  <tr key={u.id} className="border-b border-slate-100 align-middle last:border-b-0 hover:bg-slate-50/60">
                    <td className="px-6 py-7">
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-extrabold text-violet-700">
                          {initials(u.name, u.lastname)}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                              approved ? 'bg-emerald-500' : rejected ? 'bg-rose-500' : 'bg-orange-500'
                            }`}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900">{u.name} {u.lastname}</p>
                          <p className="mt-1 max-w-[260px] truncate text-slate-500">{email}</p>
                          <p className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                            ID: {u.rut ?? 'Sin RUT'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-7 text-slate-700">
                      <p>{u.celular ?? '—'}</p>
                      <p className="mt-1 text-xs text-slate-400">{u.role ?? 'User'}</p>
                    </td>

                    <td className="px-6 py-7 text-slate-700">
                      <p>{u.created_at ? format(new Date(u.created_at), 'd MMM yyyy', { locale: es }) : '—'}</p>
                      <p className="mt-1 text-xs text-slate-400">Registro</p>
                    </td>

                    <td className="px-6 py-7">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${statusBadge(u.validado)}`}>
                        {label}
                      </span>
                    </td>

                    <td className="px-6 py-7">
                      {u.documento ? (
                        <div className="flex flex-col gap-2">
                          <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                            ✓ Documento cargado
                          </span>
                          <a
                            href={u.documento}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-violet-700 hover:text-violet-900"
                          >
                            Ver documento
                          </a>
                        </div>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                          Sin documentos
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-7">
                      <div className="flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-violet-600 bg-white text-xs font-extrabold text-slate-900">
                          {percent}%
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-7">
                      {u.validado === 0 && u.role !== 'Admin' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <form action={cambiarValidado.bind(null, u.id, 1, email, u.name ?? '')}>
                            <button className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-100">
                              Aprobar
                            </button>
                          </form>
                          <form action={cambiarValidado.bind(null, u.id, 2, email, u.name ?? '')}>
                            <button className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100">
                              Rechazar
                            </button>
                          </form>
                          <a
                            href={`/admin/usuarios?user=${u.id}`}
                            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-700 transition hover:bg-violet-100"
                          >
                            Ver / Editar
                          </a>
                        </div>
                      )}

                      {u.validado === 1 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Activo</span>
                          <a
                            href={`/admin/usuarios?user=${u.id}`}
                            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-700 transition hover:bg-violet-100"
                          >
                            Ver / Editar
                          </a>
                        </div>
                      )}

                      {u.validado === 2 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <form action={cambiarValidado.bind(null, u.id, 0, email, u.name ?? '')}>
                            <button className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200">
                              Reactivar
                            </button>
                          </form>
                          <a
                            href={`/admin/usuarios?user=${u.id}`}
                            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-700 transition hover:bg-violet-100"
                          >
                            Ver / Editar
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Mostrando 1 a {usuarios?.length ?? 0} de {usuarios?.length ?? 0} usuarios</p>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">‹</button>
            <button className="h-10 w-10 rounded-lg bg-violet-600 font-extrabold text-white">1</button>
            <button className="h-10 w-10 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">›</button>
          </div>
        </div>
      </section>
    </div>
  )
}
