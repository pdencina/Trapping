// src/app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Usuario no validado → pending
  if (profile.validado !== 1 && profile.role !== 'Admin') {
    redirect('/pending')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header profile={profile} user={user} />
        <main className="flex-1 overflow-y-auto p-6 fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
