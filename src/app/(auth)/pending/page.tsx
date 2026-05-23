// src/app/(auth)/pending/page.tsx
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/lib/actions/auth'
import { Clock, XCircle } from 'lucide-react'
import type { Metadata } from 'next'
import type { Profile } from '@/types/database'

export const metadata: Metadata = { title: 'Cuenta en revisión' }

const CONFIG = {
  0: {
    icon: Clock,
    title: 'Cuenta en revisión',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    msg: 'Tu solicitud está siendo revisada. Te notificaremos por email cuando sea aprobada.',
  },
  2: {
    icon: XCircle,
    title: 'Solicitud rechazada',
    color: 'text-red-500',
    bg: 'bg-red-50',
    msg: 'Lo sentimos, tu solicitud no fue aprobada.',
  },
  4: {
    icon: Clock,
    title: 'En revisión adicional',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    msg: 'Tu perfil está siendo revisado nuevamente.',
  },
} as const

export default async function PendingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('profiles')
    .select('validado, observaciones')
    .eq('id', user!.id)
    .single()

  const profile = data as Pick<Profile, 'validado' | 'observaciones'> | null
  const validado = (profile?.validado ?? 0) as 0 | 2 | 4
  const cfg = CONFIG[validado] ?? CONFIG[0]
  const Icon = cfg.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="card p-10 text-center">
          <div className={`w-16 h-16 ${cfg.bg} rounded-full flex items-center justify-center mx-auto mb-5`}>
            <Icon size={32} className={cfg.color} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{cfg.title}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{cfg.msg}</p>

          {profile?.observaciones && (
            <div className="mt-4 bg-red-50 rounded-xl p-4 text-left">
              <p className="text-xs font-medium text-red-700 mb-1">Motivo</p>
              <p className="text-sm text-red-600">{profile.observaciones}</p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <a href="/perfil" className="btn-secondary w-full block">Actualizar mis datos</a>
            <form action={logoutAction}>
              <button className="text-sm text-gray-400 hover:text-gray-600 w-full">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
