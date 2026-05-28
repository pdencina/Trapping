// src/app/(admin)/admin/usuarios/page.tsx
import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, CheckCircle2, Clock, XCircle, FileCheck, FileX, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin · Usuarios' }

async function cambiarValidado(userId: string, validado: number, email: string, nombre: string) {
  'use server'
  const supabase = createServiceClient()
  await supabase.from('profiles').update({ validado }).eq('id', userId)

  if (validado === 1 || validado === 2) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Trapping <no-reply@${process.env.RESEND_DOMAIN ?? 'trapping.cl'}>`,
        to: email,
        subject: validado === 1
          ? '¡Tu cuenta fue aprobada! Ya puedes enviar dinero 🎉'
          : 'Actualización sobre tu solicitud en Trapping',
        html: validado === 1
          ? `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px"><div style="background:#7c3aed;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px"><h1 style="color:#fff;font-size:22px;margin:0;font-weight:700">trapping</h1></div><h2 style="color:#111827;font-size:20px">¡Hola${nombre ? `, ${nombre}` : ''}! Tu cuenta fue aprobada 🎉</h2><p style="color:#6b7280;line-height:1.6;margin-top:12px">Ya puedes acceder y enviar dinero al exterior.</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;margin-top:20px">Ingresar →</a></div>`
          : `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px"><div style="background:#7c3aed;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px"><h1 style="color:#fff;font-size:22px;margin:0;font-weight:700">trapping</h1></div><h2 style="color:#111827;font-size:20px">Hola${nombre ? `, ${nombre}` : ''}</h2><p style="color:#6b7280;line-height:1.6;margin-top:12px">Revisamos tu solicitud y por ahora no pudimos aprobarla. Puedes actualizar tus documentos.</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/pending" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;margin-top:20px">Ver mi cuenta →</a></div>`,
      }),
    }).catch(() => {})
  }
  revalidatePath('/admin/usuarios')
}

const VCFG = {
  0: { label: 'Pendiente',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  1: { label: 'Aprobado',    cls: 'bg-green-50 text-green-700 border-green-200' },
  2: { label: 'Rechazado',   cls: 'bg-red-50 text-red-700 border-red-200' },
  4: { label: 'En revisión', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
} as const

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string; ver?: string }
}) {
  const supabase = createServiceClient()

  const [{ data: usuarios }, { data: authData }] = await Promise.all([
    supabase.from('profiles').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
    supabase.auth.admin.listUsers(),
  ])

  const emailMap = new Map(authData?.users?.map(u => [u.id, u.email ?? '—']) ?? [])

  const q = searchParams.q?.toLowerCase() ?? ''
  const estado = searchParams.estado ?? 'todos'

  const filtered = (usuarios ?? []).filter(u => {
    const email = emailMap.get(u.id) ?? ''
    const matchQ = !q || [u.name, u.lastname, u.rut, email, u.celular].some(v => v?.toLowerCase().includes(q))
    const matchEstado = estado === 'todos' || String(u.validado) === estado
    return matchQ && matchEstado
  })

  const stats = {
    total:      usuarios?.length ?? 0,
    pendientes: usuarios?.filter(u => u.validado === 0).length ?? 0,
    aprobados:  usuarios?.filter(u => u.validado === 1).length ?? 0,
    rechazados: usuarios?.filter(u => u.validado === 2).length ?? 0,
  }

  const verUsuario = searchParams.ver ? usuarios?.find(u => u.id === searchParams.ver) : null
  const verEmail = verUsuario ? (emailMap.get(verUsuario.id) ?? '—') : ''

  return (
    <div className="p-6 space-y-6 max-w-7xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestiona solicitudes de registro y validación KYC</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: stats.total,      icon: Users,        bg: 'bg-gray-100',   text: 'text-gray-700' },
          { label: 'Pendientes', value: stats.pendientes, icon: Clock,        bg: 'bg-amber-50',   text: 'text-amber-700' },
          { label: 'Aprobados',  value: stats.aprobados,  icon: CheckCircle2, bg: 'bg-green-50',   text: 'text-green-700' },
          { label: 'Rechazados', value: stats.rechazados, icon: XCircle,      bg: 'bg-red-50',     text: 'text-red-700' },
        ].map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={text} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${text}`}>{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <form className="flex flex-wrap gap-3">
          <input name="q" defaultValue={q}
            placeholder="Buscar por nombre, email o RUT..."
            className="input-field flex-1 min-w-48 h-10 text-sm" />
          <select name="estado" defaultValue={estado}
            className="input-field w-44 h-10 text-sm">
            <option value="todos">Todos los estados</option>
            <option value="0">Pendientes</option>
            <option value="1">Aprobados</option>
            <option value="2">Rechazados</option>
          </select>
          <button type="submit" className="btn-primary h-10 px-5 text-sm">Buscar</button>
          {(q || estado !== 'todos') && (
            <a href="/admin/usuarios" className="btn-secondary h-10 px-4 text-sm">Limpiar</a>
          )}
        </form>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Usuario', 'Email', 'RUT', 'Registro', 'Documentos', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : filtered.map(u => {
                const email = emailMap.get(u.id) ?? '—'
                const cfg = VCFG[u.validado as keyof typeof VCFG] ?? VCFG[0]
                const initials = `${u.name?.[0] ?? ''}${u.lastname?.[0] ?? ''}`.toUpperCase() || '?'
                const tieneDocs = !!u.documento

                return (
                  <tr key={u.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-brand-700 text-xs font-bold">{initials}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-32">
                            {[u.name, u.lastname].filter(Boolean).join(' ') || '—'}
                          </p>
                          <p className="text-xs text-gray-400">{u.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-gray-600 max-w-44 truncate">{email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.rut
                        ? <span className="font-mono text-xs text-gray-700">{u.rut}</span>
                        : <span className="text-xs text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                      {format(new Date(u.created_at), "d MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-4 py-3.5">
                      {tieneDocs ? (
                        <div className="flex items-center gap-1.5">
                          <FileCheck size={14} className="text-green-600 flex-shrink-0" />
                          <a href={`/admin/usuarios?ver=${u.id}`}
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                            Ver docs
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <FileX size={14} className="text-gray-300 flex-shrink-0" />
                          <span className="text-xs text-gray-300">Sin docs</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {u.validado === 0 && u.role !== 'Admin' && (
                          <>
                            <form action={cambiarValidado.bind(null, u.id, 1, email, u.name ?? '')}>
                              <button className="text-xs px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium transition-colors">
                                Aprobar
                              </button>
                            </form>
                            <form action={cambiarValidado.bind(null, u.id, 2, email, u.name ?? '')}>
                              <button className="text-xs px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors">
                                Rechazar
                              </button>
                            </form>
                          </>
                        )}
                        {u.validado === 1 && u.role !== 'Admin' && (
                          <form action={cambiarValidado.bind(null, u.id, 2, email, u.name ?? '')}>
                            <button className="text-xs px-2.5 py-1.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-medium transition-colors">
                              Suspender
                            </button>
                          </form>
                        )}
                        {u.validado === 2 && (
                          <form action={cambiarValidado.bind(null, u.id, 0, email, u.name ?? '')}>
                            <button className="text-xs px-2.5 py-1.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 font-medium transition-colors">
                              Reactivar
                            </button>
                          </form>
                        )}
                        <a href={`/admin/usuarios?ver=${u.id}`}
                          className="text-xs px-2.5 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg hover:bg-brand-100 font-medium transition-colors flex items-center gap-1">
                          Ver <ChevronRight size={11} />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
          <p className="text-xs text-gray-400">
            {filtered.length} de {usuarios?.length ?? 0} usuarios
          </p>
        </div>
      </div>

      {/* Detalle usuario */}
      {verUsuario && (
        <div className="card p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-700 font-bold text-lg">
                  {`${verUsuario.name?.[0] ?? ''}${verUsuario.lastname?.[0] ?? ''}`.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{verUsuario.name} {verUsuario.lastname}</h2>
                <p className="text-sm text-gray-500">{verEmail}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${VCFG[verUsuario.validado as keyof typeof VCFG]?.cls ?? ''}`}>
                  {VCFG[verUsuario.validado as keyof typeof VCFG]?.label}
                </span>
              </div>
            </div>
            <a href="/admin/usuarios" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ✕ Cerrar
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'RUT',      value: verUsuario.rut || 'No ingresado' },
              { label: 'Celular',  value: verUsuario.celular || '—' },
              { label: 'Registro', value: format(new Date(verUsuario.created_at), "d MMM yyyy", { locale: es }) },
              { label: 'Rol',      value: verUsuario.role },
            ].map(({ label, value }) => (
              <div key={label} className="bg-brand-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mb-3">Documentos KYC</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {['documento', 'foto'].map(field => {
              const val = (verUsuario as any)[field]
              const label = field === 'documento' ? 'Documento CI' : 'Selfie'
              return (
                <div key={field} className={`rounded-xl p-4 border ${val ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs font-semibold mb-1.5 flex items-center gap-1 ${val ? 'text-green-700' : 'text-gray-400'}`}>
                    {val ? <FileCheck size={13} /> : <FileX size={13} />}
                    {label}
                  </p>
                  {val
                    ? <p className="text-xs font-mono text-green-600 truncate">{val}</p>
                    : <p className="text-xs text-gray-400">Sin cargar</p>
                  }
                </div>
              )
            })}
          </div>

          {verUsuario.validado === 0 && verUsuario.role !== 'Admin' && (
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <form action={cambiarValidado.bind(null, verUsuario.id, 1, verEmail, verUsuario.name ?? '')}>
                <button className="btn-primary text-sm px-6">✓ Aprobar cuenta</button>
              </form>
              <form action={cambiarValidado.bind(null, verUsuario.id, 2, verEmail, verUsuario.name ?? '')}>
                <button className="btn-danger text-sm px-6">✕ Rechazar</button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
