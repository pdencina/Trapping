// src/app/api/kyc/check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  // Rate limit: 60 requests por minuto
  const rateLimited = checkRateLimit(req, RATE_LIMITS.api)
  if (rateLimited) return rateLimited

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
