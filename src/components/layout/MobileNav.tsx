'use client'
// src/components/layout/MobileNav.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowRightLeft, List, Wallet, User } from 'lucide-react'
import { cn } from '@/utils/format'

const items = [
  { href: '/dashboard',   label: 'Inicio',      icon: LayoutDashboard },
  { href: '/transferir',  label: 'Enviar',       icon: ArrowRightLeft },
  { href: '/operaciones', label: 'Historial',    icon: List },
  { href: '/billetera',   label: 'Billetera',    icon: Wallet },
  { href: '/perfil',      label: 'Perfil',       icon: User },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="bottom-nav lg:hidden" aria-label="Navegación principal">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link key={href} href={href}
            className={cn('bottom-nav-item', active && 'active')}>
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
