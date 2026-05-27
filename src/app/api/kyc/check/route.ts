// src/app/api/kyc/check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

  const service = createServiceClient()
  const { data, error } = await service
    .from('kyc_sessions')
    .select('status, user_id, expires_at')
    .eq('token', token)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Token inválido' }, { status: 404 })

  return NextResponse.json({
    status: data.status,
    user_id: data.user_id,
    expires_at: data.expires_at,
    expired: new Date(data.expires_at) < new Date(),
  })
}
