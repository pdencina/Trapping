export default function UsuariosPage() {
  const stats = [
    { title: "Total", value: "33", desc: "Usuarios registrados" },
    { title: "En revisión", value: "12", desc: "Pendientes de revisión" },
    { title: "Aprobados", value: "18", desc: "Usuarios verificados" },
    { title: "Suspendidos", value: "3", desc: "Usuarios suspendidos" },
  ]

  const users = [
    {
      name: "Maikelly Eunice",
      email: "maikelly@gmail.com",
      phone: "+56912345678",
      status: "En revisión",
      verified: "Verificado",
      percent: "60%",
    },
    {
      name: "Elkin Traspalacio",
      email: "elkin@gmail.com",
      phone: "+56987654321",
      status: "Aprobado",
      verified: "Verificado",
      percent: "100%",
    },
  ]

  return (
    <div className="p-6 space-y-6 bg-[#f7f8fc] min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Usuarios</h1>
        <p className="text-slate-500 mt-1">
          Administra solicitudes KYC y validación de usuarios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <p className="text-slate-500 text-sm">{item.title}</p>
            <h2 className="text-5xl font-bold mt-3 text-slate-900">
              {item.value}
            </h2>
            <p className="text-slate-400 text-sm mt-2">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-3 justify-between">
        <input
          placeholder="Buscar usuario por nombre, email o celular..."
          className="w-full lg:w-[420px] border border-slate-200 rounded-xl px-4 py-3"
        />

        <div className="flex gap-3">
          <select className="border border-slate-200 rounded-xl px-4 py-3">
            <option>Todos los estados</option>
          </select>

          <button className="border border-slate-200 rounded-xl px-5 py-3">
            Más filtros
          </button>

          <button className="bg-violet-600 text-white rounded-xl px-5 py-3">
            Exportar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-slate-600 text-sm">
              <th className="p-5">Usuario</th>
              <th className="p-5">Contacto</th>
              <th className="p-5">Estado KYC</th>
              <th className="p-5">Email verificado</th>
              <th className="p-5">% Perfil</th>
              <th className="p-5">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.email}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="p-5">
                  <div className="font-semibold text-slate-900">
                    {user.name}
                  </div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </td>

                <td className="p-5 text-slate-700">{user.phone}</td>

                <td className="p-5">
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                    {user.status}
                  </span>
                </td>

                <td className="p-5">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {user.verified}
                  </span>
                </td>

                <td className="p-5 font-bold text-violet-700">
                  {user.percent}
                </td>

                <td className="p-5">
                  <div className="flex gap-2 flex-wrap">
                    <button className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
                      Aprobar
                    </button>

                    <button className="bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm">
                      Solicitar docs
                    </button>

                    <button className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
                      Rechazar
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
