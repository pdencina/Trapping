'use client'
// src/components/layout/HamburgerMenu.tsx
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, LayoutDashboard, ArrowRightLeft, List,
  Users, Wallet, Calculator, User, LogOut,
  ShieldCheck, Settings, Building2,
} from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'
import { cn } from '@/utils/format'
import type { Profile } from '@/types/database'

const userNav = [
  { href: '/dashboard',   label: 'Inicio',           icon: LayoutDashboard },
  { href: '/transferir',  label: 'Transferir dinero', icon: ArrowRightLeft },
  { href: '/operaciones', label: 'Operaciones',       icon: List },
  { href: '/contactos',   label: 'Mis contactos',     icon: Users },
  { href: '/billetera',   label: 'Billetera',         icon: Wallet },
  { href: '/simulador',   label: 'Simulador',         icon: Calculator },
  { href: '/perfil',      label: 'Mi perfil',         icon: User },
]

const adminNav = [
  { href: '/admin/operaciones', label: 'Operaciones',  icon: List },
  { href: '/admin/usuarios',    label: 'Usuarios',     icon: Users },
  { href: '/admin/tasas',       label: 'Tasas',        icon: Settings },
  { href: '/admin/bancos',      label: 'Bancos',       icon: Building2 },
  { href: '/admin/cuentas',     label: 'Cuentas',      icon: Wallet },
]

interface Props {
  profile: Profile
  email?: string
}

export default function HamburgerMenu({ profile, email }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isAdmin = profile.role === 'Admin'

  const initials = `${profile.name?.[0] ?? ''}${profile.lastname?.[0] ?? ''}`.toUpperCase()

  return (
    <>
      {/* Botón hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl hover:bg-brand-50 text-white hover:text-brand-700 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {/* Overlay */}
      {open && (
        <div className="drawer-overlay fade-in" onClick={() => setOpen(false)} />
      )}

      {/* Drawer */}
      <div className={cn(
        'drawer',
        open ? 'slide-in' : '-translate-x-full'
      )}>
        {/* Header del drawer */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-5 pt-12 pb-6">
          <div className="flex items-start justify-between mb-4">
            <span className="text-white font-bold text-lg tracking-tight">trapping</span>
            <button onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {profile.name} {profile.lastname}
              </p>
              {email && <p className="text-brand-200 text-xs truncate mt-0.5">{email}</p>}
              <span className="inline-flex items-center gap-1 text-[10px] bg-white/15 text-white/90 px-2 py-0.5 rounded-full mt-1">
                ✓ Cuenta verificada
              </span>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-0.5">
            {userNav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                    active
                      ? 'bg-brand-100 text-brand-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}>
                  <Icon size={18} className={active ? 'text-brand-600' : 'text-gray-400'} />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="flex items-center gap-2 px-3 mt-5 mb-2">
                <ShieldCheck size={11} className="text-brand-500" />
                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Admin</span>
              </div>
              <div className="space-y-0.5">
                {adminNav.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href)
                  return (
                    <Link key={href} href={href} onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                        active
                          ? 'bg-brand-100 text-brand-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}>
                      <Icon size={18} className={active ? 'text-brand-600' : 'text-gray-400'} />
                      {label}
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-brand-100">
          <form action={logoutAction}>
            <button type="submit"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
