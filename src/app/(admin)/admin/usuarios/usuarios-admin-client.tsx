"use client"

import { useMemo, useState, useTransition } from "react"
import { AdminUserRow, KycStatus, updateAdminUserAction, updateUserKycStatusAction } from "./actions"

type Props = { initialUsers: AdminUserRow[] }

const statusLabels: Record<KycStatus, string> = {
  pending_review: "En revisión",
  docs_pending: "Documentación pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  suspended: "Suspendido",
}

const statusDetails: Record<KycStatus, string> = {
  pending_review: "Pendiente de revisión",
  docs_pending: "Faltan documentos",
  approved: "Usuario verificado",
  rejected: "Solicitud rechazada",
  suspended: "Cuenta suspendida",
}

const statusDot: Record<KycStatus, string> = {
  pending_review: "bg-amber-500",
  docs_pending: "bg-orange-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  suspended: "bg-slate-500",
}

const statusBadge: Record<KycStatus, string> = {
  pending_review: "bg-amber-100 text-amber-700",
  docs_pending: "bg-orange-100 text-orange-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-slate-200 text-slate-700",
}

function getInitials(user: AdminUserRow) {
  const first = user.name?.[0] ?? "U"
  const last = user.lastname?.[0] ?? ""
  return `${first}${last}`.toUpperCase()
}

function formatDate(date?: string | null) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date))
}

function formatTime(date?: string | null) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" }).format(new Date(date))
}

function getProfilePercent(user: AdminUserRow) {
  const checks = [Boolean(user.name), Boolean(user.lastname), Boolean(user.rut), Boolean(user.phone), Boolean(user.email), Boolean(user.email_confirmed_at), user.kyc_status === "approved"]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function exportCsv(users: AdminUserRow[]) {
  const headers = ["Nombre", "Apellido", "Email", "RUT", "Teléfono", "Estado KYC", "Email confirmado", "Operaciones", "Fecha registro"]
  const rows = users.map((user) => [user.name, user.lastname, user.email, user.rut, user.phone, statusLabels[user.kyc_status], user.email_confirmed_at ? "Sí" : "No", String(user.operations_count), user.created_at ?? ""])
  const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "usuarios-trapping.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function UsuariosAdminClient({ initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | KycStatus>("all")
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = `${user.name} ${user.lastname} ${user.email} ${user.rut} ${user.phone}`.toLowerCase()
      return search.includes(query.toLowerCase()) && (statusFilter === "all" || user.kyc_status === statusFilter)
    })
  }, [users, query, statusFilter])

  const stats = [
    { label: "Total", value: users.length, description: "Usuarios registrados", icon: "👥", valueClass: "text-slate-950", iconClass: "bg-violet-100 text-violet-700" },
    { label: "En revisión", value: users.filter((u) => u.kyc_status === "pending_review").length, description: "Pendientes de revisión", icon: "⏱", valueClass: "text-orange-500", iconClass: "bg-orange-100 text-orange-600" },
    { label: "Aprobados", value: users.filter((u) => u.kyc_status === "approved").length, description: "Usuarios verificados", icon: "✓", valueClass: "text-green-600", iconClass: "bg-green-100 text-green-600" },
    { label: "Suspendidos", value: users.filter((u) => u.kyc_status === "suspended").length, description: "Usuarios suspendidos", icon: "⊖", valueClass: "text-slate-600", iconClass: "bg-slate-100 text-slate-600" },
  ]

  function setUserStatus(userId: string, status: KycStatus) {
    setMessage("")
    startTransition(async () => {
      const result = await updateUserKycStatusAction(userId, status)
      if (result?.error) {
        setMessage(result.error)
        return
      }
      setUsers((current) => current.map((user) => (user.id === userId ? { ...user, kyc_status: status, validado: status === "approved" ? 1 : 0 } : user)))
      setSelectedUser((current) => (current?.id === userId ? { ...current, kyc_status: status, validado: status === "approved" ? 1 : 0 } : current))
      setMessage("Usuario actualizado correctamente.")
    })
  }

  function saveUser(formData: FormData) {
    setMessage("")
    startTransition(async () => {
      const result = await updateAdminUserAction(formData)
      if (result?.error) {
        setMessage(result.error)
        return
      }
      const updatedUser: AdminUserRow = {
        ...(selectedUser as AdminUserRow),
        name: String(formData.get("name") ?? ""),
        lastname: String(formData.get("lastname") ?? ""),
        rut: String(formData.get("rut") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        kyc_status: String(formData.get("kyc_status")) as KycStatus,
        kyc_message: String(formData.get("kyc_message") ?? ""),
        kyc_internal_note: String(formData.get("kyc_internal_note") ?? ""),
        validado: formData.get("kyc_status") === "approved" ? 1 : 0,
      }
      setUsers((current) => current.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
      setSelectedUser(updatedUser)
      setMessage("Usuario guardado correctamente.")
    })
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc]">
      <div className="mx-auto w-full max-w-[1536px] px-5 py-6 sm:px-7 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">Administra solicitudes KYC y validación de usuarios.</p>
        </div>

        {message && <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-800">{message}</div>}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className={`mt-3 text-4xl font-extrabold ${item.valueClass}`}>{item.value}</p>
                  <p className="mt-3 text-sm text-slate-500">{item.description}</p>
                </div>
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl ${item.iconClass}`}>{item.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col gap-3 md:flex-row xl:max-w-[900px]">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100" placeholder="Buscar usuario por nombre, email o celular..." />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | KycStatus)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 md:w-56">
              <option value="all">Todos los estados</option>
              <option value="pending_review">En revisión</option>
              <option value="docs_pending">Documentación pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
              <option value="suspended">Suspendido</option>
            </select>
            <button type="button" onClick={() => { setStatusFilter("all"); setQuery("") }} className="h-12 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:w-36">Limpiar</button>
          </div>
          <button type="button" onClick={() => exportCsv(filteredUsers)} className="h-12 rounded-xl border border-violet-300 bg-white px-7 text-sm font-extrabold text-violet-700 transition hover:bg-violet-50">↓ Exportar</button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1220px] text-sm">
              <thead><tr className="border-b border-slate-200 bg-white text-left"><th className="px-5 py-4 font-extrabold text-slate-800">Usuario</th><th className="px-5 py-4 font-extrabold text-slate-800">Contacto</th><th className="px-5 py-4 font-extrabold text-slate-800">Registrado</th><th className="px-5 py-4 font-extrabold text-slate-800">Estado KYC</th><th className="px-5 py-4 font-extrabold text-slate-800">Email verificado</th><th className="px-5 py-4 font-extrabold text-slate-800">% Perfil</th><th className="px-5 py-4 font-extrabold text-slate-800">Operaciones</th><th className="px-5 py-4 font-extrabold text-slate-800">Acciones</th></tr></thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const profilePercent = getProfilePercent(user)
                  return <tr key={user.id} className="border-b border-slate-100 transition hover:bg-slate-50/70">
                    <td className="px-5 py-5"><div className="flex items-center gap-4"><div className="relative shrink-0"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-sm font-extrabold text-violet-700">{getInitials(user)}</div><span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${statusDot[user.kyc_status]}`} /></div><div><p className="font-extrabold text-slate-950">{user.name} {user.lastname}</p><p className="mt-1 text-sm text-slate-500">{user.email || "Sin email"}</p><span className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">ID: {user.rut || "Sin RUT"}</span></div></div></td>
                    <td className="px-5 py-5 text-slate-700">{user.phone || "—"}</td>
                    <td className="px-5 py-5 text-slate-700"><p>{formatDate(user.created_at)}</p><p className="mt-1 text-slate-500">{formatTime(user.created_at)}</p></td>
                    <td className="px-5 py-5"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${statusBadge[user.kyc_status]}`}>{statusLabels[user.kyc_status]}</span><p className="mt-2 text-xs text-slate-500">{statusDetails[user.kyc_status]}</p></td>
                    <td className="px-5 py-5">{user.email_confirmed_at ? <><span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-700">Verificado</span><p className="mt-2 text-xs text-slate-500">{formatDate(user.email_confirmed_at)}</p></> : <><span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-red-700">No verificado</span><p className="mt-2 text-xs text-slate-500">—</p></>}</td>
                    <td className="px-5 py-5"><div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-violet-600 bg-white text-xs font-extrabold text-slate-800">{profilePercent}%</div></td>
                    <td className="px-5 py-5"><div className="flex w-20 flex-col items-center"><span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-violet-100 px-2 text-sm font-extrabold text-violet-700">{user.operations_count}</span><span className="mt-1 text-xs text-slate-500">operaciones</span></div></td>
                    <td className="px-5 py-5"><div className="flex flex-wrap items-center gap-2"><button type="button" disabled={isPending} onClick={() => setUserStatus(user.id, "approved")} className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-extrabold text-green-700 hover:bg-green-100 disabled:opacity-50">Aprobar</button><button type="button" disabled={isPending} onClick={() => setUserStatus(user.id, "docs_pending")} className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-extrabold text-orange-700 hover:bg-orange-100 disabled:opacity-50">Solicitar docs</button><button type="button" disabled={isPending} onClick={() => setUserStatus(user.id, "rejected")} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100 disabled:opacity-50">Rechazar</button><button type="button" disabled={isPending} onClick={() => setUserStatus(user.id, "suspended")} className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Suspender</button><button type="button" onClick={() => setSelectedUser(user)} className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-700 hover:bg-violet-100">Ver / Editar</button></div></td>
                  </tr>
                })}
                {filteredUsers.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-500">No hay usuarios para mostrar.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> usuarios</p><div className="flex items-center gap-2"><button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400">‹</button><button className="rounded-lg bg-violet-700 px-3 py-2 font-extrabold text-white">1</button><button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-500">›</button></div></div>
        </div>

        {selectedUser && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div><h3 className="text-lg font-extrabold text-violet-800">Ver / Editar Usuario</h3><p className="text-sm text-slate-500">{selectedUser.email}</p></div><button type="button" onClick={() => setSelectedUser(null)} className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100">✕</button></div><form action={saveUser} className="space-y-5 p-6"><input type="hidden" name="id" value={selectedUser.id} /><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><label className="space-y-1"><span className="text-sm font-bold text-violet-800">Nombres</span><input name="name" defaultValue={selectedUser.name} className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-violet-500" /></label><label className="space-y-1"><span className="text-sm font-bold text-violet-800">Apellidos</span><input name="lastname" defaultValue={selectedUser.lastname} className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-violet-500" /></label><label className="space-y-1"><span className="text-sm font-bold text-violet-800">RUT</span><input name="rut" defaultValue={selectedUser.rut} className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-violet-500" /></label><label className="space-y-1"><span className="text-sm font-bold text-violet-800">Teléfono</span><input name="phone" defaultValue={selectedUser.phone} className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-violet-500" /></label><label className="space-y-1 md:col-span-2"><span className="text-sm font-bold text-violet-800">Estado KYC</span><select name="kyc_status" defaultValue={selectedUser.kyc_status} className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-violet-500"><option value="pending_review">En revisión</option><option value="docs_pending">Documentación pendiente</option><option value="approved">Aprobado</option><option value="rejected">Rechazado</option><option value="suspended">Suspendido</option></select></label><label className="space-y-1 md:col-span-2"><span className="text-sm font-bold text-violet-800">Mensaje visible para el cliente</span><textarea name="kyc_message" defaultValue={selectedUser.kyc_message} rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-violet-500" /></label><label className="space-y-1 md:col-span-2"><span className="text-sm font-bold text-violet-800">Nota interna</span><textarea name="kyc_internal_note" defaultValue={selectedUser.kyc_internal_note} rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-violet-500" /></label></div><div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => setSelectedUser(null)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">Cerrar</button><button type="submit" disabled={isPending} className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Guardar</button></div></form></div></div>}
      </div>
    </div>
  )
}
