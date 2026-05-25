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

export default function UsuariosAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-slate-500">
          Administra solicitudes KYC y validación de usuarios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-500">Total</div>
          <div className="text-4xl font-bold mt-2">2</div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-500">En revisión</div>
          <div className="text-4xl font-bold mt-2 text-yellow-600">1</div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-500">Aprobados</div>
          <div className="text-4xl font-bold mt-2 text-green-600">1</div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-500">Suspendidos</div>
          <div className="text-4xl font-bold mt-2 text-gray-600">0</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4">Usuario</th>
              <th className="text-left p-4">Celular</th>
              <th className="text-left p-4">Registrado</th>
              <th className="text-left p-4">Estado</th>
              <th className="text-left p-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-4">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-slate-500">{user.email}</div>
                </td>

                <td className="p-4">{user.celular}</td>

                <td className="p-4">{user.registered}</td>

                <td className="p-4">
                  <KYCBadge status={user.status as any} />
                </td>

                <td className="p-4">
                  <div className="flex gap-2 flex-wrap">
                    <button className="rounded-lg bg-green-100 text-green-700 px-3 py-1">
                      Aprobar
                    </button>

                    <button className="rounded-lg bg-orange-100 text-orange-700 px-3 py-1">
                      Solicitar documentación
                    </button>

                    <button className="rounded-lg bg-red-100 text-red-700 px-3 py-1">
                      Rechazar
                    </button>

                    <button className="rounded-lg bg-gray-200 text-gray-700 px-3 py-1">
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
