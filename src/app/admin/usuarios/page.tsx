import KYCBadge from '@/components/admin/KYCBadge'

const users = [
  {
    id: 1,
    name: 'elkin',
    status: 'pending_review',
    email: 'usuario@email.com',
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

      <div className="rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4">Usuario</th>
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
