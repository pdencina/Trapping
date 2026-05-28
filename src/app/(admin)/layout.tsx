// src/app/(admin)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import type { Profile } from '@/types/database'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = data as Profile | null
  if (!profile || profile.role !== 'Admin') redirect('/dashboard')

  return (
    <div className="flex h-screen overflow-hidden bg-brand-50">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
