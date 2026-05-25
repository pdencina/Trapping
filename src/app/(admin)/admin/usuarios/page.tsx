export default function UsuariosPage() {
  const users = [
    {
      initials: "PE",
      name: "Pablo Encina",
      email: "pencina@armglobal.org",
      rut: "17.339.278-8",
      phone: "+56949616038",
      registered: "25 may 2026",
      time: "14:32",
      kyc: "En revisión",
      kycDetail: "Pendiente de revisión",
      emailStatus: "Verificado",
      profile: 60,
      operations: 0,
      avatar: "bg-violet-100 text-violet-700",
      dot: "bg-yellow-500",
    },
    {
      initials: "AT",
      name: "Admin Trapping",
      email: "admin@trapping.cl",
      rut: "21.419.516",
      phone: "+56900000000",
      registered: "23 may 2026",
      time: "10:15",
      kyc: "Aprobado",
      kycDetail: "Usuario verificado",
      emailStatus: "Verificado",
      profile: 100,
      operations: 0,
      avatar: "bg-purple-100 text-purple-700",
      dot: "bg-green-500",
    },
    {
      initials: "NC",
      name: "Nueva Cuenta",
      email: "nuevacuenta@gmail.com",
      rut: "24.342.444-4",
      phone: "+56911112222",
      registered: "20 may 2026",
      time: "09:45",
      kyc: "Documentación pendiente",
      kycDetail: "Faltan documentos",
      emailStatus: "No verificado",
      profile: 20,
      operations: 0,
      avatar: "bg-orange-100 text-orange-700",
      dot: "bg-orange-500",
    },
    {
      initials: "JP",
      name: "Juan Prueba",
      email: "juanprueba@gmail.com",
      rut: "42.434.344",
      phone: "+56933334444",
      registered: "18 may 2026",
      time: "16:20",
      kyc: "Rechazado",
      kycDetail: "Solicitud rechazada",
      emailStatus: "No verificado",
      profile: 40,
      operations: 1,
      avatar: "bg-red-100 text-red-700",
      dot: "bg-red-500",
    },
  ]

  const stats = [
    {
      label: "Total",
      value: 33,
      description: "Usuarios registrados",
      icon: "👥",
      iconBg: "bg-violet-100",
      iconText: "text-violet-700",
      valueColor: "text-slate-950",
    },
    {
      label: "En revisión",
      value: 12,
      description: "Pendientes de revisión",
      icon: "⏱",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      valueColor: "text-amber-500",
    },
    {
      label: "Aprobados",
      value: 18,
      description: "Usuarios verificados",
      icon: "✓",
      iconBg: "bg-green-100",
      iconText: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      label: "Suspendidos",
      value: 3,
      description: "Usuarios suspendidos",
      icon: "⊖",
      iconBg: "bg-slate-100",
      iconText: "text-slate-600",
      valueColor: "text-slate-600",
    },
  ]

  function kycBadgeClass(status: string) {
    if (status === "Aprobado") return "bg-green-100 text-green-700"
    if (status === "Documentación pendiente") return "bg-orange-100 text-orange-700"
    if (status === "Rechazado") return "bg-red-100 text-red-700"
    if (status === "Suspendido") return "bg-slate-200 text-slate-700"
    return "bg-amber-100 text-amber-700"
  }

  function emailBadgeClass(status: string) {
    return status === "Verificado"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Administra solicitudes KYC y validación de usuarios.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className={`mt-3 text-4xl font-extrabold ${item.valueColor}`}>
                  {item.value}
                </p>
                <p className="mt-3 text-sm text-slate-500">{item.description}</p>
              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${item.iconBg} ${item.iconText}`}
              >
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_260px_160px]">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>
            <input
              placeholder="Buscar usuario por nombre, email o celular..."
              className="h-13 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <select className="h-13 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100">
            <option>Todos los estados</option>
            <option>En revisión</option>
            <option>Documentación pendiente</option>
            <option>Aprobado</option>
            <option>Rechazado</option>
            <option>Suspendido</option>
          </select>

          <button className="h-13 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Más filtros
          </button>
        </div>

        <button className="h-13 rounded-xl border border-violet-300 bg-white px-6 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50">
          ↓ Exportar
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                <th className="px-5 py-4 font-bold text-slate-700">Usuario</th>
                <th className="px-5 py-4 font-bold text-slate-700">Contacto</th>
                <th className="px-5 py-4 font-bold text-slate-700">Registrado</th>
                <th className="px-5 py-4 font-bold text-slate-700">Estado KYC</th>
                <th className="px-5 py-4 font-bold text-slate-700">Email verificado</th>
                <th className="px-5 py-4 font-bold text-slate-700">% Perfil</th>
                <th className="px-5 py-4 font-bold text-slate-700">Operaciones</th>
                <th className="px-5 py-4 font-bold text-slate-700">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.email}
                  className="border-b border-slate-100 transition hover:bg-slate-50/70"
                >
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold ${user.avatar}`}
                        >
                          {user.initials}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${user.dot}`}
                        />
                      </div>

                      <div>
                        <p className="font-extrabold text-slate-950">{user.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                        <span className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                          ID: {user.rut}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-5 text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">☎</span>
                      <span>{user.phone}</span>
                    </div>
                  </td>

                  <td className="px-5 py-5 text-slate-700">
                    <p>{user.registered}</p>
                    <p className="mt-1 text-slate-500">{user.time}</p>
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${kycBadgeClass(
                        user.kyc,
                      )}`}
                    >
                      {user.kyc}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">{user.kycDetail}</p>
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${emailBadgeClass(
                        user.emailStatus,
                      )}`}
                    >
                      {user.emailStatus}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">
                      {user.emailStatus === "Verificado" ? user.registered : "—"}
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-violet-600 bg-white text-xs font-extrabold text-slate-800">
                      {user.profile}%
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex flex-col items-center w-20">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-violet-100 px-2 text-sm font-extrabold text-violet-700">
                        {user.operations}
                      </span>
                      <span className="mt-1 text-xs text-slate-500">operaciones</span>
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <button className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-100">
                        Aprobar
                      </button>

                      <button className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100">
                        Solicitar docs
                      </button>

                      <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">
                        Rechazar
                      </button>

                      <button className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
                        Suspender
                      </button>

                      <button className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100">
                        Ver / Editar
                      </button>

                      <button className="rounded-lg px-2 py-2 text-lg font-bold text-slate-500 hover:bg-slate-100">
                        ⋮
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Mostrando <strong>1 a 4</strong> de <strong>33</strong> usuarios
          </p>

          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-500">
              ‹
            </button>
            <button className="rounded-lg bg-violet-700 px-3 py-2 font-bold text-white">
              1
            </button>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600">
              2
            </button>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600">
              3
            </button>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-slate-500">
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-extrabold text-slate-950">Estados KYC</p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-5">
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

        <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-5 shadow-sm">
          <p className="font-extrabold text-violet-800">¿Necesitas ayuda?</p>
          <p className="mt-2 text-sm text-slate-600">
            Revisa nuestra guía de verificación KYC y criterios de aprobación.
          </p>
        </div>
      </div>
    </div>
  )
}
