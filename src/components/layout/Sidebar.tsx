'use client'
// src/components/layout/Sidebar.tsx — solo desktop
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ArrowRightLeft, List, Users,
  Wallet, Calculator, User, Settings, ShieldCheck,
  Building2, LogOut, ChevronRight,
} from 'lucide-react'
import { cn } from '@/utils/format'
import { logoutAction } from '@/lib/actions/auth'
import type { Profile } from '@/types/database'

const userNav = [
  { href: '/dashboard',   label: 'Inicio',           icon: LayoutDashboard },
  { href: '/transferir',  label: 'Transferir',        icon: ArrowRightLeft },
  { href: '/operaciones', label: 'Operaciones',       icon: List },
  { href: '/contactos',   label: 'Contactos',         icon: Users },
  { href: '/billetera',   label: 'Billetera',         icon: Wallet },
  { href: '/simulador',   label: 'Simulador',         icon: Calculator },
  { href: '/perfil',      label: 'Mi perfil',         icon: User },
]

const adminNav = [
  { href: '/admin/operaciones', label: 'Operaciones', icon: List },
  { href: '/admin/usuarios',    label: 'Usuarios',    icon: Users },
  { href: '/admin/tasas',       label: 'Tasas',       icon: Settings },
  { href: '/admin/bancos',      label: 'Bancos',      icon: Building2 },
  { href: '/admin/cuentas',     label: 'Cuentas',     icon: Wallet },
]

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const isAdmin = profile.role === 'Admin'

  return (
    <aside className="w-64 bg-brand-50 border-r border-brand-100 flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-brand-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">trapping</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {userNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors group',
                active ? 'bg-brand-100 text-brand-700 font-semibold'
                       : 'text-gray-500 hover:bg-white hover:text-gray-900'
              )}>
              <Icon size={17} className={active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'} />
              {label}
              {active && <ChevronRight size={13} className="ml-auto text-brand-400" />}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="flex items-center gap-1.5 px-3 pt-4 pb-1.5">
              <ShieldCheck size={11} className="text-brand-500" />
              <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Admin</span>
            </div>
            {adminNav.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link key={href} href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                    active ? 'bg-brand-100 text-brand-700 font-semibold'
                           : 'text-gray-500 hover:bg-white hover:text-gray-900'
                  )}>
                  <Icon size={17} className={active ? 'text-brand-600' : 'text-gray-400'} />
                  {label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-brand-100">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 text-xs font-bold">
              {profile.name?.[0]?.toUpperCase()}{profile.lastname?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile.name} {profile.lastname}</p>
            <p className="text-xs text-gray-400 truncate">{profile.role}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={14} /> Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
