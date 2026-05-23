'use client'
// src/components/layout/Header.tsx
import { logoutAction } from '@/lib/actions/auth'
import { LogOut, Bell } from 'lucide-react'
import type { Profile } from '@/types/database'
import type { User } from '@supabase/supabase-js'

interface HeaderProps { profile: Profile; user: User }

export default function Header({ profile, user }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1">
        {/* Breadcrumb o título puede ir aquí */}
      </div>

      <div className="flex items-center gap-3">
        {/* Notificaciones placeholder */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={18} />
        </button>

        {/* Email del usuario */}
        <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>

        {/* Logout */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline font-medium">Salir</span>
          </button>
        </form>
      </div>
    </header>
  )
}
