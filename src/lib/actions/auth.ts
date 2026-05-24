'use server'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const RegisterSchema = z.object({
  name: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  rut: z.string().min(1),         // mínimo 1 — el RUT puede venir en distintos formatos
  celular: z.string().min(1),     // mínimo 1 — validar largo real es front
  tipo_documento_id: z.coerce.number().min(1),
  terms: z.union([z.literal(true), z.literal('on')]).transform(() => true as const),
})

export type ActionResult = {
  error?: string
  success?: boolean
  fieldErrors?: Record<string, string[]>
}

export async function loginAction(formData: FormData): Promise<void> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    redirect('/login?error=' + encodeURIComponent('Email o contraseña inválidos'))
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    const msg = error.message.includes('Invalid login')
      ? 'Credenciales incorrectas'
      : error.message.includes('Email not confirmed')
      ? 'Debes verificar tu email primero'
      : 'Error al ingresar'
    redirect('/login?error=' + encodeURIComponent(msg))
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles').select('total_login').eq('id', user.id).single()
    await service.from('profiles').update({
      last_login: new Date().toISOString(),
      total_login: ((profile as any)?.total_login ?? 0) + 1,
    }).eq('id', user.id)
  }

  redirect('/dashboard')
}

export async function registerAction(formData: FormData): Promise<void> {
  const raw = {
    name: formData.get('name'),
    lastname: formData.get('lastname'),
    email: formData.get('email'),
    password: formData.get('password'),
    rut: formData.get('rut'),
    celular: formData.get('celular'),
    tipo_documento_id: formData.get('tipo_documento_id'),
    terms: formData.get('terms'),
  }

  const parsed = RegisterSchema.safeParse(raw)
  if (!parsed.success) {
    // Redirigir con el error específico de validación para debuggear
    const firstError = parsed.error.errors[0]
    const msg = `${firstError.path.join('.')}: ${firstError.message}`
    redirect('/register?error=' + encodeURIComponent(msg))
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { name: parsed.data.name },
    },
  })

  if (error) {
    const msg = error.message.includes('already registered')
      ? 'Este email ya está registrado'
      : `Auth error: ${error.message}`
    redirect('/register?error=' + encodeURIComponent(msg))
  }

  if (!data.user) {
    redirect('/register?error=' + encodeURIComponent('No se obtuvo usuario de auth.signUp'))
  }

  // Usar service client para bypassear RLS
  const service = createServiceClient()
  const { error: profileError } = await service.from('profiles').update({
    name: parsed.data.name,
    lastname: parsed.data.lastname,
    rut: parsed.data.rut,
    celular: parsed.data.celular,
    tipo_documento_id: parsed.data.tipo_documento_id,
    terms: true,
    validado: 0,
    role: 'User',
  }).eq('id', data.user.id)

  if (profileError) {
    redirect('/register?error=' + encodeURIComponent(`Profile error: ${profileError.message}`))
  }

  redirect('/verify-email')
}

export async function logoutAction(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
