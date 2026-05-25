'use client'

import { useMemo, useState } from 'react'
import KYCBadge from '@/components/admin/KYCBadge'

type KycStatus =
  | 'pending_review'
  | 'docs_pending'
  | 'approved'
  | 'rejected'
  | 'suspended'

type AdminUser = {
  id: number
  name: string
  lastname?: string
  email: string
  rut?: string
  celular?: string
  status: KycStatus
  emailConfirmed: boolean
  operations: number
  profilePercent: number
  registered: string
  kycMessage?: string
  internalNote?: string
}

const initialUsers: AdminUser[] = [
  {
    id: 1,
    name: 'Pablo',
    lastname: 'Encina',
    email: 'pencina@armglobal.org',
    rut: '17.339.278-8',
    celular: '+56949616038',
    status: 'pending_review',
    emailConfirmed: false,
    operations: 0,
    profilePercent: 45,
    registered: '25 may 2026',
    kycMessage: '',
    internalNote: '',
  },
  {
    id: 2,
    name: 'Elkin',
    lastname: 'Traspalacio',
    email: 'elkin@email.com',
    rut: '26.474.736-8',
    celular: '931140862',
    status: 'docs_pending',
    emailConfirmed: false,
    operations: 0,
    profilePercent: 55,
    registered: '25 may 2026',
    kycMessage: 'Necesitamos una imagen más clara de tu documento.',
    internalNote: '',
  },
  {
    id: 3,
    name: 'Admin Trapping',
    lastname: '',
    email: 'admin@trapping.cl',
    rut: '',
    celular: '+56900000000',
    status: 'approved',
    emailConfirmed: true,
    operations: 0,
    profilePercent: 100,
    registered: '23 may 2026',
    kycMessage: '',
    internalNote: '',
  },
]

const statusOptions: { value: KycStatus; label: string }[] = [
  { value: 'pending_review', label: 'En revisión' },
  { value: 'docs_pending', label: 'Documentación pendiente' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'rejected', label: 'Rechazado' },
  { value: 'suspended', label: 'Suspendido' },
]

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | KycStatus>('all')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const text = `${user.name} ${user.lastname ?? ''} ${user.email} ${user.rut ?? ''}`
        .toLowerCase()
        .trim()

      const matchesQuery = text.includes(query.toLowerCase().trim())
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [users, query, statusFilter])

  const stats = [
    {
      label: 'Total',
      value: users.length,
      className: 'text-slate-950',
    },
    {
      label: 'En revisión',
      value: users.filter((u) => u.status === 'pending_review').length,
      className: 'text-yellow-600',
    },
    {
      label: 'Aprobados',
      value: users.filter((u) => u.status === 'approved').length,
      className: 'text-green-600',
    },
    {
      label: 'Docs pendientes',
      value: users.filter((u) => u.status === 'docs_pending').length,
      className: 'text-orange-600',
    },
  ]

  function updateUserStatus(userId: number, status: KycStatus) {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, status } : user)),
    )

    setSelectedUser((current) =>
      current?.id === userId ? { ...current, status } : current,
    )

    // TODO conectar con Supabase:
    // await updateUserKycStatus(userId, status)
  }

  function saveSelectedUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedUser) return

    const formData = new FormData(event.currentTarget)

    const updatedUser: AdminUser = {
      ...selectedUser,
      name: String(formData.get('name') ?? selectedUser.name),
      lastname: String(formData.get('lastname') ?? selectedUser.lastname ?? ''),
      rut: String(formData.get('rut') ?? selectedUser.rut ?? ''),
      celular: String(formData.get('celular') ?? selectedUser.celular ?? ''),
      status: String(formData.get('status') ?? selectedUser.status) as KycStatus,
      kycMessage: String(formData.get('kycMessage') ?? ''),
      internalNote: String(formData.get('internalNote') ?? ''),
    }

    setUsers((current) =>
      current.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    )

    setSelectedUser(updatedUser)

    // TODO conectar con Supabase:
    // await updateUserProfile(updatedUser)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Usuarios</h1>
          <p className="text-slate-500">
            Administra solicitudes KYC y validación de usuarios.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | KycStatus)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-purple-500"
          >
            <option value="all">Todos los estados</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar usuario, correo o RUT"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-purple-500 sm:w-72"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className={`mt-2 text-4xl font-bold ${item.className}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-950">Todos los usuarios</h2>
          <p className="text-sm text-slate-500">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-left font-semibold text-slate-600">Usuario</th>
                <th className="p-4 text-left font-semibold text-slate-600">RUT</th>
                <th className="p-4 text-left font-semibold text-slate-600">Email</th>
                <th className="p-4 text-left font-semibold text-slate-600">Email verificado</th>
                <th className="p-4 text-left font-semibold text-slate-600">Estado</th>
                <th className="p-4 text-left font-semibold text-slate-600">Operaciones</th>
                <th className="p-4 text-left font-semibold text-slate-600">% Perfil</th>
                <th className="p-4 text-left font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-950">
                          {user.name} {user.lastname}
                        </div>
                        <div className="text-slate-500">{user.celular || 'Sin teléfono'}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-700">{user.rut || '—'}</td>

                  <td className="p-4 text-purple-700">{user.email}</td>

                  <td className="p-4">
                    {user.emailConfirmed ? (
                      <span className="font-semibold text-green-600">✓ Confirmado</span>
                    ) : (
                      <span className="font-semibold text-red-600">✕ Por confirmar</span>
                    )}
                  </td>

                  <td className="p-4">
                    <KYCBadge status={user.status} />
                  </td>

                  <td className="p-4">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-purple-700 px-2 text-xs font-bold text-white">
                      {user.operations}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-purple-700"
                          style={{ width: `${user.profilePercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{user.profilePercent}%</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="rounded-lg bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100"
                      >
                        Ver / Editar
                      </button>

                      {user.status !== 'approved' && (
                        <button
                          onClick={() => updateUserStatus(user.id, 'approved')}
                          className="rounded-lg bg-green-100 px-3 py-1 text-green-700 hover:bg-green-200"
                        >
                          Aprobar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No se encontraron usuarios con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-purple-800">Ver / Editar Usuario</h3>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveSelectedUser} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-semibold text-purple-800">Nombres *</span>
                  <input
                    name="name"
                    defaultValue={selectedUser.name}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-purple-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-purple-800">Apellidos *</span>
                  <input
                    name="lastname"
                    defaultValue={selectedUser.lastname}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-purple-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-purple-800">Doc. Identidad *</span>
                  <input
                    name="rut"
                    defaultValue={selectedUser.rut}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-purple-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-purple-800">Teléfono *</span>
                  <input
                    name="celular"
                    defaultValue={selectedUser.celular}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-purple-500"
                  />
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-purple-800">Estado KYC *</span>
                  <select
                    name="status"
                    defaultValue={selectedUser.status}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-purple-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-purple-800">
                    Mensaje visible para el cliente
                  </span>
                  <textarea
                    name="kycMessage"
                    defaultValue={selectedUser.kycMessage}
                    rows={3}
                    placeholder="Ej: Necesitamos una foto más clara de tu documento."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-purple-500"
                  />
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-purple-800">
                    Nota interna
                  </span>
                  <textarea
                    name="internalNote"
                    defaultValue={selectedUser.internalNote}
                    rows={3}
                    placeholder="Nota visible solo para el equipo Trapping."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-purple-500"
                  />
                </label>
              </div>

              <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateUserStatus(selectedUser.id, 'approved')}
                    className="rounded-xl bg-green-100 px-4 py-2 text-sm font-semibold text-green-700"
                  >
                    Aprobar
                  </button>

                  <button
                    type="button"
                    onClick={() => updateUserStatus(selectedUser.id, 'docs_pending')}
                    className="rounded-xl bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700"
                  >
                    Solicitar documentación
                  </button>

                  <button
                    type="button"
                    onClick={() => updateUserStatus(selectedUser.id, 'rejected')}
                    className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700"
                  >
                    Rechazar
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Cerrar
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
