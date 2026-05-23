'use client'
// src/components/layout/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ArrowRightLeft, List, Users,
  Wallet, Calculator, User, Settings,
  ChevronRight, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/utils/format'
import type { Profile } from '@/types/database'

const userNav = [
  { href: '/dashboard',    label: 'Inicio',       icon: LayoutDashboard },
  { href: '/transferir',   label: 'Transferir',   icon: ArrowRightLeft },
  { href: '/operaciones',  label: 'Operaciones',  icon: List },
  { href: '/contactos',    label: 'Contactos',    icon: Users },
  { href: '/billetera',    label: 'Billetera',    icon: Wallet },
  { href: '/simulador',    label: 'Simulador',    icon: Calculator },
  { href: '/perfil',       label: 'Mi perfil',    icon: User },
]

const adminNav = [
  { href: '/admin/operaciones', label: 'Operaciones', icon: List },
  { href: '/admin/usuarios',    label: 'Usuarios',    icon: Users },
  { href: '/admin/tasas',       label: 'Tasas',       icon: Settings },
  { href: '/admin/bancos',      label: 'Bancos',      icon: Settings },
  { href: '/admin/cuentas',     label: 'Cuentas',     icon: Wallet },
]

interface SidebarProps { profile: Profile }

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = profile.role === 'Admin'

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-base">T</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">Trapping</span>
        </Link>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {userNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('w-4.5 h-4.5', active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600')} size={18} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto text-brand-400" />}
            </Link>
          )
        })}

        {/* Sección admin */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-1.5">
              <div className="flex items-center gap-1.5 px-3">
                <ShieldCheck size={12} className="text-brand-500" />
                <span className="text-[10px] font-semibold text-brand-500 uppercase tracking-widest">
                  Admin
                </span>
              </div>
            </div>
            {adminNav.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon size={18} className={cn(active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600')} />
                  {label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Footer: nombre usuario */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 text-xs font-semibold">
              {profile.name?.[0]?.toUpperCase()}{profile.lastname?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile.name} {profile.lastname}
            </p>
            <p className="text-xs text-gray-400 truncate">{profile.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
