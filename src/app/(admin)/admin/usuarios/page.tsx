export default function UsuariosPage() {
  const stats = [
    {
      label: 'Total',
      value: 33,
      description: 'Usuarios registrados',
      icon: '👥',
      valueClass: 'text-slate-950',
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      label: 'En revisión',
      value: 12,
      description: 'Pendientes de revisión',
      icon: '⏱',
      valueClass: 'text-orange-500',
      iconClass: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Aprobados',
      value: 18,
      description: 'Usuarios verificados',
      icon: '✓',
      valueClass: 'text-green-600',
      iconClass: 'bg-green-100 text-green-600',
    },
    {
      label: 'Suspendidos',
      value: 3,
      description: 'Usuarios suspendidos',
      icon: '⊖',
      valueClass: 'text-slate-600',
      iconClass: 'bg-slate-100 text-slate-600',
    },
  ]

  const users = [
    {
      initials: 'PE',
      name: 'Pablo Encina',
      email: 'pencina@armglobal.org',
      id: '17.339.278-8',
      phone: '+56949616038',
      date: '25 may 2026',
      time: '14:32',
      kyc: 'En revisión',
      emailStatus: 'Verificado',
      percent: 60,
      avatarClass: 'bg-violet-100 text-violet-700',
      dotClass: 'bg-orange-500',
    },
    {
      initials: 'AT',
      name: 'Admin Trapping',
      email: 'admin@trapping.cl',
      id: '21.419.516-6',
      phone: '+56900000000',
      date: '23 may 2026',
      time: '10:15',
      kyc: 'Aprobado',
      emailStatus: 'Verificado',
      percent: 100,
      avatarClass: 'bg-purple-100 text-purple-700',
      dotClass: 'bg-green-500',
    },
  ]

  const kycColors = {
    'En revisión': 'bg-amber-100 text-amber-700',
    Aprobado: 'bg-green-100 text-green-700',
  }

  return (
    <div className="w-full bg-[#f8fafc]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Usuarios
          </h1>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Administra solicitudes KYC y validación de usuarios.
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>

                  <p className={`mt-3 text-4xl font-extrabold ${item.valueClass}`}>
                    {item.value}
                  </p>

                  <p className="mt-3 text-sm text-slate-500">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl ${item.iconClass}`}
                >
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar bien ordenada: horizontal en desktop, apilada solo en móvil */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div
            className="gap-3"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            <div
              className="gap-3"
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                flex: '1 1 auto',
                minWidth: 0,
              }}
            >
              <div
                className="relative"
                style={{
                  flex: '1 1 520px',
                  minWidth: 280,
                }}
              >
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Buscar usuario por nombre, email, RUT o celular..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <select
                className="h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                style={{
                  flex: '0 0 220px',
                }}
              >
                <option>Todos los estados</option>
                <option>En revisión</option>
                <option>Documentación pendiente</option>
                <option>Aprobado</option>
                <option>Rechazado</option>
                <option>Suspendido</option>
              </select>

              <button
                className="h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white"
                style={{
                  flex: '0 0 145px',
                }}
              >
                Más filtros
              </button>
            </div>

            <button
              className="h-12 rounded-xl border border-violet-300 bg-white px-6 text-sm font-extrabold text-violet-700 transition hover:bg-violet-50"
              style={{
                flex: '0 0 140px',
              }}
            >
              ↓ Exportar
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-5 py-4 text-sm font-extrabold text-slate-800">
                    Usuario
                  </th>
                  <th className="px-5 py-4 text-sm font-extrabold text-slate-800">
                    Contacto
                  </th>
                  <th className="px-5 py-4 text-sm font-extrabold text-slate-800">
                    Registrado
                  </th>
                  <th className="px-5 py-4 text-sm font-extrabold text-slate-800">
                    Estado KYC
                  </th>
                  <th className="px-5 py-4 text-sm font-extrabold text-slate-800">
                    Email verificado
                  </th>
                  <th className="px-5 py-4 text-sm font-extrabold text-slate-800">
                    % Perfil
                  </th>
                  <th className="px-5 py-4 text-sm font-extrabold text-slate-800">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.email}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold ${user.avatarClass}`}
                          >
                            {user.initials}
                          </div>

                          <span
                            className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${user.dotClass}`}
                          />
                        </div>

                        <div>
                          <p className="font-extrabold text-slate-900">
                            {user.name}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {user.email}
                          </p>

                          <span className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-700">
                      {user.phone}
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-700">
                      <p>{user.date}</p>
                      <p className="mt-1 text-slate-500">{user.time}</p>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                          kycColors[user.kyc as keyof typeof kycColors]
                        }`}
                      >
                        {user.kyc}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-700">
                        {user.emailStatus}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-violet-600 text-xs font-extrabold text-slate-800">
                        {user.percent}%
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                          Aprobar
                        </button>

                        <button className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
                          Solicitar docs
                        </button>

                        <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                          Rechazar
                        </button>

                        <button className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
                          Ver / Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Mostrando 1 a 10 de 33 usuarios
            </p>

            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-500">
                ‹
              </button>

              <button className="rounded-lg bg-violet-700 px-3 py-2 text-sm font-bold text-white">
                1
              </button>

              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                2
              </button>

              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                3
              </button>

              <button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-500">
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
