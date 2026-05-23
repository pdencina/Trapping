'use server'
// src/lib/actions/auth.ts
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const RegisterSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  lastname: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  rut: z.string().min(7, 'RUT inválido'),
  celular: z.string().min(8, 'Teléfono inválido'),
  tipo_documento_id: z.coerce.number().min(1),
  terms: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los términos' }) }),
})

export type ActionResult = {
  error?: string
  success?: boolean
  fieldErrors?: Record<string, string[]>
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    if (error.message.includes('Invalid login')) {
      return { error: 'Credenciales incorrectas. Verifica tu email y contraseña.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Debes verificar tu email antes de ingresar.' }
    }
    return { error: error.message }
  }

  // Actualizar last_login
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('profiles')
      .update({
        last_login: new Date().toISOString(),
        total_login: (await supabase.from('profiles').select('total_login').eq('id', user.id).single()).data?.total_login ?? 0 + 1
      })
      .eq('id', user.id)
  }

  redirect('/dashboard')
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get('name'),
    lastname: formData.get('lastname'),
    email: formData.get('email'),
    password: formData.get('password'),
    rut: formData.get('rut'),
    celular: formData.get('celular'),
    tipo_documento_id: formData.get('tipo_documento_id'),
    terms: formData.get('terms') === 'on' ? true : formData.get('terms'),
  }

  const parsed = RegisterSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const supabase = createClient()

  // 1. Crear usuario en auth
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { name: parsed.data.name },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este email ya está registrado.' }
    }
    return { error: error.message }
  }

  if (!data.user) return { error: 'Error al crear el usuario.' }

  // 2. Actualizar profile con datos adicionales (el trigger ya lo creó)
  await supabase.from('profiles').update({
    name: parsed.data.name,
    lastname: parsed.data.lastname,
    rut: parsed.data.rut,
    celular: parsed.data.celular,
    tipo_documento_id: parsed.data.tipo_documento_id,
    terms: true,
    validado: 0,
    role: 'User',
  }).eq('id', data.user.id)

  redirect('/verify-email')
}

export async function logoutAction(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
