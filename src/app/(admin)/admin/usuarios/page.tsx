"use client";

import { useMemo, useState } from "react";

import { Ban, Check, Download, Search, Users, TimerReset } from "lucide-react";

type UserStatus = "pending_review" | "approved" | "suspended";

type UserRow = {
  id: number;
  initials: string;
  name: string;
  email: string;
  rut: string;
  contact: string;
  registeredDate: string;
  registeredTime: string;
  status: UserStatus;
  emailVerified: boolean;
  emailVerifiedDate: string;
  profilePercent: number;
};

const initialUsers: UserRow[] = [
  {
    id: 1,
    initials: "PE",
    name: "Pablo Encina",
    email: "pencina@armglobal.org",
    rut: "17.339.278-8",
    contact: "+56949616038",
    registeredDate: "25 may 2026",
    registeredTime: "14:32",
    status: "pending_review",
    emailVerified: true,
    emailVerifiedDate: "25 may 2026",
    profilePercent: 60,
  },
  {
    id: 2,
    initials: "AT",
    name: "Admin Trapping",
    email: "admin@trapping.cl",
    rut: "21.419.516-6",
    contact: "+56900000000",
    registeredDate: "23 may 2026",
    registeredTime: "10:15",
    status: "approved",
    emailVerified: true,
    emailVerifiedDate: "",
    profilePercent: 100,
  },
];

const totalUsers = 33;

const stats = [
  {
    label: "Total",
    value: totalUsers,
    description: "Usuarios registrados",
    valueClass: "text-slate-950",
    iconClass: "bg-violet-100 text-slate-900",
    icon: Users,
  },
  {
    label: "En revisión",
    value: 12,
    description: "Pendientes de revisión",
    valueClass: "text-orange-500",
    iconClass: "bg-orange-100 text-orange-500",
    icon: TimerReset,
  },
  {
    label: "Aprobados",
    value: 18,
    description: "Usuarios verificados",
    valueClass: "text-green-600",
    iconClass: "bg-green-100 text-green-600",
    icon: Check,
  },
  {
    label: "Suspendidos",
    value: 3,
    description: "Usuarios suspendidos",
    valueClass: "text-slate-600",
    iconClass: "bg-slate-100 text-slate-600",
    icon: Ban,
  },
];

function KycBadge({ status }: { status: UserStatus }) {
  const config: Record<UserStatus, { label: string; className: string }> = {
    pending_review: {
      label: "En revisión",
      className: "bg-orange-100 text-orange-700",
    },
    approved: {
      label: "Aprobado",
      className: "bg-green-100 text-green-700",
    },
    suspended: {
      label: "Suspendido",
      className: "bg-slate-100 text-slate-700",
    },
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${config[status].className}`}
    >
      {config[status].label}
    </span>
  );
}

function ProfileRing({ value }: { value: number }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-violet-600 bg-white text-xs font-extrabold text-slate-950">
      {value}%
    </div>
  );
}

function ActionButton({
  children,
  tone,
  onClick,
}: {
  children: React.ReactNode;
  tone: "green" | "orange" | "red" | "violet";
  onClick?: () => void;
}) {
  const tones = {
    green: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
    orange:
      "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
    red: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    violet:
      "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-extrabold transition ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        [user.name, user.email, user.rut, user.contact].some((field) =>
          field.toLowerCase().includes(term),
        );

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, users]);

  const updateUserStatus = (userId: number, status: UserStatus) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              status,
              profilePercent: status === "approved" ? 100 : user.profilePercent,
            }
          : user,
      ),
    );
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2800);
  };

  const requestDocs = (user: UserRow) => {
    showNotice(`Solicitud de documentos enviada a ${user.name}`);
  };

  const openEditor = (user: UserRow) => {
    setSelectedUser(user);
  };

  const exportUsers = () => {
    const headers = [
      "Usuario",
      "Email",
      "RUT",
      "Contacto",
      "Estado KYC",
      "Perfil",
    ];
    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.rut,
      user.contact,
      user.status,
      `${user.profilePercent}%`,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('\"', '\"\"')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "usuarios-trapping.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 px-6 py-8">
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Administra solicitudes KYC y validación de usuarios.
        </p>
      </section>

      <section className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
        {stats.map(
          ({
            label,
            value,
            description,
            valueClass,
            iconClass,
            icon: Icon,
          }) => (
            <article
              key={label}
              className="flex min-h-[140px] items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className={`mt-4 text-4xl font-extrabold ${valueClass}`}>
                  {value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{description}</p>
              </div>
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${iconClass}`}
              >
                <Icon size={26} strokeWidth={2.2} />
              </div>
            </article>
          ),
        )}
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid min-w-[1100px] grid-cols-[1fr_240px_160px_150px] gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              placeholder="Buscar usuario por nombre, email, RUT o celular..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | UserStatus)
            }
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
          >
            <option value="all">Todos los estados</option>
            <option value="pending_review">En revisión</option>
            <option value="approved">Aprobados</option>
            <option value="suspended">Suspendidos</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Más filtros
          </button>

          <button
            type="button"
            onClick={exportUsers}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-violet-300 bg-white px-4 text-sm font-extrabold text-violet-700 transition hover:bg-violet-50"
          >
            <Download size={15} />
            Exportar
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-left text-slate-950">
                <th className="px-6 py-5 font-extrabold">Usuario</th>
                <th className="px-6 py-5 font-extrabold">Contacto</th>
                <th className="px-6 py-5 font-extrabold">Registrado</th>
                <th className="px-6 py-5 font-extrabold">Estado KYC</th>
                <th className="px-6 py-5 font-extrabold">Email verificado</th>
                <th className="px-6 py-5 text-center font-extrabold">
                  % Perfil
                </th>
                <th className="px-6 py-5 font-extrabold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 align-middle last:border-b-0"
                >
                  <td className="px-6 py-7">
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-extrabold text-violet-700">
                        {user.initials}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${user.status === "approved" ? "bg-green-500" : "bg-orange-500"}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-950">
                          {user.name}
                        </p>
                        <p className="mt-1 text-slate-500">{user.email}</p>
                        <p className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                          ID: {user.rut}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-7 text-slate-700">{user.contact}</td>

                  <td className="px-6 py-7 text-slate-700">
                    <p>{user.registeredDate}</p>
                    <p className="mt-1">{user.registeredTime}</p>
                  </td>

                  <td className="px-6 py-7">
                    <KycBadge status={user.status} />
                  </td>

                  <td className="px-6 py-7">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-700">
                      Verificado
                    </span>
                    {user.emailVerifiedDate ? (
                      <p className="mt-2 text-xs text-slate-500">
                        {user.emailVerifiedDate}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-6 py-7">
                    <div className="flex justify-center">
                      <ProfileRing value={user.profilePercent} />
                    </div>
                  </td>

                  <td className="px-6 py-7">
                    <div className="flex flex-nowrap items-center gap-2">
                      <ActionButton
                        tone="green"
                        onClick={() => updateUserStatus(user.id, "approved")}
                      >
                        Aprobar
                      </ActionButton>
                      <ActionButton
                        tone="orange"
                        onClick={() => requestDocs(user)}
                      >
                        Solicitar docs
                      </ActionButton>
                      <ActionButton
                        tone="red"
                        onClick={() => updateUserStatus(user.id, "suspended")}
                      >
                        Rechazar
                      </ActionButton>
                      <ActionButton
                        tone="violet"
                        onClick={() => openEditor(user)}
                      >
                        Ver / Editar
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Mostrando {filteredUsers.length ? 1 : 0} a {filteredUsers.length} de{" "}
            {totalUsers} usuarios
          </p>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
              ‹
            </button>
            <button className="h-10 w-10 rounded-lg bg-violet-600 font-extrabold text-white">
              1
            </button>
            <button className="h-10 w-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
              2
            </button>
            <button className="h-10 w-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
              3
            </button>
            <button className="h-10 w-10 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
              ›
            </button>
          </div>
        </div>
      </section>

      {notice ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-xl">
          {notice}
        </div>
      ) : null}

      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  Ver / Editar usuario
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  {selectedUser.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Revisa la información antes de aprobar, rechazar o solicitar
                  documentos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Email
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {selectedUser.email}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Contacto
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {selectedUser.contact}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  RUT
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {selectedUser.rut}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Estado KYC
                </p>
                <div className="mt-2">
                  <KycBadge status={selectedUser.status} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  requestDocs(selectedUser);
                  setSelectedUser(null);
                }}
                className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-extrabold text-orange-700 transition hover:bg-orange-100"
              >
                Solicitar documentos
              </button>
              <button
                type="button"
                onClick={() => {
                  updateUserStatus(selectedUser.id, "suspended");
                  showNotice(`${selectedUser.name} fue rechazado/suspendido`);
                  setSelectedUser(null);
                }}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700 transition hover:bg-red-100"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => {
                  updateUserStatus(selectedUser.id, "approved");
                  showNotice(`${selectedUser.name} fue aprobado correctamente`);
                  setSelectedUser(null);
                }}
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-extrabold text-green-700 transition hover:bg-green-100"
              >
                Aprobar usuario
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
