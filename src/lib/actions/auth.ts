'use server'

import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const RegisterSchema = z
  .object({
    name: z.string().min(2),
    lastname: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    password_confirm: z.string().min(8),
    rut: z.string().min(7),
    celular: z.string().min(8),
    tipo_documento_id: z.coerce.number().min(1),
    terms: z.literal(true),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  })

function getRegisterMessage(errorMessage: string): string {
  const message = errorMessage.toLowerCase()

  if (message.includes('already registered')) {
    return 'Este email ya está registrado'
  }

  if (message.includes('duplicate key') && message.includes('rut')) {
    return 'Este RUT ya está registrado'
  }

  return errorMessage || 'Error al crear cuenta'
}

export async function registerAction(formData: FormData): Promise<void> {
  try {
    const raw = {
      name: formData.get('name'),
      lastname: formData.get('lastname'),
      email: formData.get('email'),
      password: formData.get('password'),
      password_confirm: formData.get('password_confirm'),
      rut: formData.get('rut'),
      celular: formData.get('celular'),
      tipo_documento_id: formData.get('tipo_documento_id'),
      terms: formData.get('terms') === 'on' ? true : false,
    }

    const parsed = RegisterSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError =
        parsed.error.flatten().formErrors[0] ??
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        'Completa todos los campos correctamente'

      redirect('/register?error=' + encodeURIComponent(firstError))
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          name: parsed.data.name,
        },
      },
    })

    if (error) {
      console.error('Error auth signup:', error)
      redirect('/register?error=' + encodeURIComponent(getRegisterMessage(error.message)))
    }

    if (!data.user) {
      redirect('/register?error=' + encodeURIComponent('No se pudo crear el usuario'))
    }

    const service = createServiceClient()

    const { error: profileError } = await service
      .from('profiles')
      .update({
        name: parsed.data.name,
        lastname: parsed.data.lastname,
        rut: parsed.data.rut,
        celular: parsed.data.celular,
        tipo_documento_id: parsed.data.tipo_documento_id,
        terms: true,
        validado: 0,
        role: 'User',
      })
      .eq('id', data.user.id)

    if (profileError) {
      console.error('Error profile:', profileError)
      redirect('/register?error=' + encodeURIComponent(getRegisterMessage(profileError.message)))
    }

    redirect('/verify-email')

  } catch (error: any) {

    // IMPORTANTE: permitir redirects de Next.js
    if (isRedirectError(error)) {
      throw error
    }

    console.error('REGISTER ERROR:', error)

    redirect(
      '/register?error=' +
        encodeURIComponent(error?.message || 'Error inesperado al crear usuario')
    )
  }
}
