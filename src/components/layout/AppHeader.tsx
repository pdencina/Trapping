// src/components/layout/AppHeader.tsx
import HamburgerMenu from './HamburgerMenu'
import type { Profile } from '@/types/database'

interface Props {
  profile: Profile
  email?: string
  title?: string
  subtitle?: string
  children?: React.ReactNode
}

export default function AppHeader({ profile, email, title, subtitle, children }: Props) {
  return (
    <header className="page-header">
      {/* Círculo decorativo */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-bold text-xl tracking-tight">trapping</span>
          <HamburgerMenu profile={profile} email={email} />
        </div>

        {title && (
          <div>
            <p className="text-brand-200 text-sm mb-0.5">{subtitle}</p>
            <h1 className="text-white font-bold text-2xl">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </header>
  )
}
