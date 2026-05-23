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
  password_confirm: z.string().min(8),
  rut: z.string().min(7),
  celular: z.string().min(8),
  tipo_documento_id: z.coerce.number().min(1),
  terms: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los términos' }) }),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirm'],
})

function normalizeDocument(value: string) {
  return value.replace(/\./g, '').replace(/-/g, '').trim().toLowerCase()
}

function getRegisterErrorMessage(message: string) {
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes('already registered') ||
    lowerMessage.includes('already been registered') ||
    lowerMessage.includes('user already registered')
  ) {
    return 'Este email ya está registrado'
  }

  if (
    lowerMessage.includes('duplicate key') ||
    lowerMessage.includes('unique constraint') ||
    lowerMessage.includes('profiles_rut') ||
    lowerMessage.includes('rut')
  ) {
    return 'Este RUT/documento ya está registrado. Si eliminaste el usuario, revisa que no siga existiendo en profiles o auth.users.'
  }

  return message || 'Error inesperado al crear cuenta'
}

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
    password_confirm: formData.get('password_confirm'),
    rut: formData.get('rut'),
    celular: formData.get('celular'),
    tipo_documento_id: formData.get('tipo_documento_id'),
    terms: formData.get('terms') === 'on' ? true : formData.get('terms'),
  }

  const parsed = RegisterSchema.safeParse(raw)
  if (!parsed.success) {
    redirect('/register?error=' + encodeURIComponent('Completa todos los campos correctamente'))
  }

  const supabase = createClient()
  const service = createServiceClient()
  const normalizedRut = normalizeDocument(parsed.data.rut)

  // Validación previa para evitar crear un usuario en Auth si el documento ya existe en profiles.
  // Se revisa de forma exacta y también normalizada para evitar diferencias por puntos/guion.
  const { data: existingProfiles, error: existingProfileError } = await service
    .from('profiles')
    .select('id, rut')
    .not('rut', 'is', null)

  if (existingProfileError) {
    redirect('/register?error=' + encodeURIComponent(getRegisterErrorMessage(existingProfileError.message)))
  }

  const duplicatedRut = existingProfiles?.some((profile: { rut?: string | null }) => {
    return profile.rut ? normalizeDocument(profile.rut) === normalizedRut : false
  })

  if (duplicatedRut) {
    redirect('/register?error=' + encodeURIComponent('Este RUT/documento ya está registrado'))
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { name: parsed.data.name },
    },
  })

  if (error) {
    redirect('/register?error=' + encodeURIComponent(getRegisterErrorMessage(error.message)))
  }

  if (!data.user) redirect('/register?error=' + encodeURIComponent('Error inesperado'))

  // Usar service client para bypassear RLS — el usuario recién creado no tiene sesión aún.
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
    // Si el perfil falla después de crear Auth, limpiamos el usuario Auth para no dejarlo huérfano.
    await service.auth.admin.deleteUser(data.user.id)
    redirect('/register?error=' + encodeURIComponent(getRegisterErrorMessage(profileError.message)))
  }

  redirect('/verify-email')
}

export async function logoutAction(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
