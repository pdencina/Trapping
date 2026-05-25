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
      kycDetail: 'Pendiente de revisión',
      emailStatus: 'Verificado',
      emailDate: '25 may 2026',
      percent: 60,
      operations: 0,
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
      kycDetail: 'Verificado',
      emailStatus: 'Verificado',
      emailDate: '23 may 2026',
      percent: 100,
      operations: 0,
      avatarClass: 'bg-purple-100 text-purple-700',
      dotClass: 'bg-green-500',
    },
    {
      initials: 'NC',
      name: 'Nueva Cuenta',
      email: 'nuevacuenta@gmail.com',
      id: '24.342.444-4',
      phone: '+56911112222',
      date: '20 may 2026',
      time: '09:45',
      kyc: 'Documentación pendiente',
      kycDetail: 'Faltan documentos',
      emailStatus: 'No verificado',
      emailDate: '—',
      percent: 20,
      operations: 0,
      avatarClass: 'bg-orange-100 text-orange-700',
      dotClass: 'bg-orange-500',
    },
    {
      initials: 'JP',
      name: 'Juan Prueba',
      email: 'juanprueba@gmail.com',
      id: '42.434.344-2',
      phone: '+56933334444',
      date: '18 may 2026',
      time: '16:20',
      kyc: 'Rechazado',
      kycDetail: 'Solicitud rechazada',
      emailStatus: 'No verificado',
      emailDate: '—',
      percent: 40,
      operations: 1,
      avatarClass: 'bg-red-100 text-red-700',
      dotClass: 'bg-red-500',
    },
  ]

  function kycClass(status: string) {
    if (status === 'Aprobado') return 'bg-green-100 text-green-700'
    if (status === 'Documentación pendiente') return 'bg-orange-100 text-orange-700'
    if (status === 'Rechazado') return 'bg-red-100 text-red-700'
    if (status === 'Suspendido') return 'bg-slate-200 text-slate-700'
    return 'bg-amber-100 text-amber-700'
  }

  function emailClass(status: string) {
    return status === 'Verificado'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700'
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            Usuarios
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Administra solicitudes KYC y validación de usuarios.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className={`mt-3 text-4xl font-extrabold ${item.valueClass}`}>
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">{item.description}</p>
                </div>

                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${item.iconClass}`}
                >
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_240px_140px] xl:max-w-4xl">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                ⌕
              </span>
              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                placeholder="Buscar usuario por nombre, email o celular..."
              />
            </div>

            <select className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100">
              <option>Todos los estados</option>
              <option>En revisión</option>
              <option>Documentación pendiente</option>
              <option>Aprobado</option>
              <option>Rechazado</option>
              <option>Suspendido</option>
            </select>

            <button className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Más filtros
            </button>
          </div>

          <button className="h-12 rounded-xl border border-violet-300 bg-white px-6 text-sm font-extrabold text-violet-700 transition hover:bg-violet-50">
            ↓ Exportar
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1160px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-left">
                  <th className="px-5 py-4 font-extrabold text-slate-800">Usuario</th>
                  <th className="px-5 py-4 font-extrabold text-slate-800">Contacto</th>
                  <th className="px-5 py-4 font-extrabold text-slate-800">Registrado</th>
                  <th className="px-5 py-4 font-extrabold text-slate-800">Estado KYC</th>
                  <th className="px-5 py-4 font-extrabold text-slate-800">Email verificado</th>
                  <th className="px-5 py-4 font-extrabold text-slate-800">% Perfil</th>
                  <th className="px-5 py-4 font-extrabold text-slate-800">Operaciones</th>
                  <th className="px-5 py-4 font-extrabold text-slate-800">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.email}
                    className="border-b border-slate-100 transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold ${user.avatarClass}`}
                          >
                            {user.initials}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${user.dotClass}`}
                          />
                        </div>

                        <div>
                          <p className="font-extrabold text-slate-950">{user.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                          <span className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">☎</span>
                        <span>{user.phone}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      <p>{user.date}</p>
                      <p className="mt-1 text-slate-500">{user.time}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${kycClass(user.kyc)}`}
                      >
                        {user.kyc}
                      </span>
                      <p className="mt-2 text-xs text-slate-500">{user.kycDetail}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${emailClass(user.emailStatus)}`}
                      >
                        {user.emailStatus}
                      </span>
                      <p className="mt-2 text-xs text-slate-500">{user.emailDate}</p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-violet-600 bg-white text-xs font-extrabold text-slate-800">
                        {user.percent}%
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex w-20 flex-col items-center">
                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-violet-100 px-2 text-sm font-extrabold text-violet-700">
                          {user.operations}
                        </span>
                        <span className="mt-1 text-xs text-slate-500">operaciones</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-extrabold text-green-700 hover:bg-green-100">
                          Aprobar
                        </button>
                        <button className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-extrabold text-orange-700 hover:bg-orange-100">
                          Solicitar docs
                        </button>
                        <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100">
                          Rechazar
                        </button>
                        <button className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100">
                          Suspender
                        </button>
                        <button className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-700 hover:bg-violet-100">
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
              Mostrando <strong>1 a 10</strong> de <strong>33</strong> usuarios
            </p>

            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400">‹</button>
              <button className="rounded-lg bg-violet-700 px-3 py-2 font-extrabold text-white">1</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600">2</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600">3</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600">4</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-500">›</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-extrabold text-slate-950">Estados KYC</p>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div>
                  <p className="text-sm font-bold text-slate-700">En revisión</p>
                  <p className="text-xs text-slate-500">Pendiente de revisión</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
                <div>
                  <p className="text-sm font-bold text-slate-700">Documentación pendiente</p>
                  <p className="text-xs text-slate-500">Faltan documentos</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-bold text-slate-700">Aprobado</p>
                  <p className="text-xs text-slate-500">Usuario verificado</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                <div>
                  <p className="text-sm font-bold text-slate-700">Rechazado</p>
                  <p className="text-xs text-slate-500">Solicitud rechazada</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-500" />
                <div>
                  <p className="text-sm font-bold text-slate-700">Suspendido</p>
                  <p className="text-xs text-slate-500">Cuenta suspendida</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5 shadow-sm">
            <p className="font-extrabold text-violet-800">¿Necesitas ayuda?</p>
            <p className="mt-2 text-sm text-slate-600">
              Revisa nuestra guía de verificación KYC.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
