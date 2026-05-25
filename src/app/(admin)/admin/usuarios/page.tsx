export default function UsuariosPage() {
  const users = [
    {
      name: "Pablo",
      email: "pencina@armglobal.org",
      phone: "+56949616038",
      status: "En revisión",
      registered: "25 may 2026",
    },
    {
      name: "Admin Trapping",
      email: "admin@trapping.cl",
      phone: "+56900000000",
      status: "Aprobado",
      registered: "23 may 2026",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Usuarios</h1>
        <p className="text-slate-500 mt-1">
          Administra solicitudes KYC y validación de usuarios.
        </p>
      </div>

      {/* Cards horizontales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border p-6">
          <p className="text-slate-500 text-sm">Total</p>
          <h2 className="text-5xl font-bold mt-2">2</h2>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <p className="text-slate-500 text-sm">En revisión</p>
          <h2 className="text-5xl font-bold mt-2 text-amber-500">1</h2>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <p className="text-slate-500 text-sm">Aprobados</p>
          <h2 className="text-5xl font-bold mt-2 text-green-500">1</h2>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <p className="text-slate-500 text-sm">Suspendidos</p>
          <h2 className="text-5xl font-bold mt-2 text-slate-500">0</h2>
        </div>
      </div>

      {/* Barra superior */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <input
          placeholder="Buscar usuario..."
          className="border rounded-xl px-4 py-3 w-full md:w-80"
        />

        <select className="border rounded-xl px-4 py-3 w-full md:w-60">
          <option>Todos</option>
          <option>En revisión</option>
          <option>Aprobados</option>
          <option>Rechazados</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="p-4">Usuario</th>
              <th className="p-4">Celular</th>
              <th className="p-4">Registrado</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, index) => (
              <tr key={index} className="border-t">
                <td className="p-4">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </td>

                <td className="p-4">{user.phone}</td>

                <td className="p-4">{user.registered}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.status === "Aprobado"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
                      Aprobar
                    </button>

                    <button className="bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm">
                      Solicitar documentación
                    </button>

                    <button className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
                      Rechazar
                    </button>

                    <button className="bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm">
                      Suspender
                    </button>

                    <button className="bg-violet-100 text-violet-700 px-3 py-2 rounded-lg text-sm">
                      Ver / Editar
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
