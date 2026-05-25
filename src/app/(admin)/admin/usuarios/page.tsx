import KYCBadge from '@/components/admin/KYCBadge'

const users = [
  {
    id: 1,
    name: 'Pablo',
    email: 'pencina@armglobal.org',
    status: 'pending_review',
    celular: '+56949616038',
    registered: '25 may 2026',
  },
  {
    id: 2,
    name: 'Admin Trapping',
    email: 'admin@trapping.cl',
    status: 'approved',
    celular: '+56900000000',
    registered: '23 may 2026',
  },
]

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
    label: 'Suspendidos',
    value: users.filter((u) => u.status === 'suspended').length,
    className: 'text-slate-600',
  },
]

export default function UsuariosAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Usuarios</h1>
        <p className="text-slate-500">
          Administra solicitudes KYC y validación de usuarios.
        </p>
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

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4 font-semibold text-slate-600">Usuario</th>
              <th className="text-left p-4 font-semibold text-slate-600">Celular</th>
              <th className="text-left p-4 font-semibold text-slate-600">Registrado</th>
              <th className="text-left p-4 font-semibold text-slate-600">Estado</th>
              <th className="text-left p-4 font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="p-4">
                  <div className="font-semibold text-slate-950">{user.name}</div>
                  <div className="text-slate-500">{user.email}</div>
                </td>

                <td className="p-4 text-slate-700">{user.celular}</td>

                <td className="p-4 text-slate-700">{user.registered}</td>

                <td className="p-4">
                  <KYCBadge status={user.status as any} />
                </td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-lg bg-green-100 px-3 py-1 text-green-700">
                      Aprobar
                    </button>

                    <button className="rounded-lg bg-orange-100 px-3 py-1 text-orange-700">
                      Solicitar documentación
                    </button>

                    <button className="rounded-lg bg-red-100 px-3 py-1 text-red-700">
                      Rechazar
                    </button>

                    <button className="rounded-lg bg-gray-200 px-3 py-1 text-gray-700">
                      Suspender
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
