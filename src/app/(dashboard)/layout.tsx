// src/app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MobileNav from '@/components/layout/MobileNav'
import Sidebar from '@/components/layout/Sidebar'
import type { Profile } from '@/types/database'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = data as Profile | null
  if (!profile) redirect('/login')

  if (profile.validado !== 1 && profile.role !== 'Admin') redirect('/pending')

  return (
    <div className="min-h-screen bg-brand-50">
      {/* Desktop: sidebar clásico */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        <Sidebar profile={profile} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile: page + bottom nav */}
      <div className="lg:hidden">
        <main className="page-with-nav fade-up">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
