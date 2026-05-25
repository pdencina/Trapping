'use server'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails/resend'
import { confirmAccountTemplate } from '@/lib/emails/templates/confirm-account'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const RegisterSchema = z
  .object({
    name: z.string().min(2, 'Ingresa tu nombre'),
    lastname: z.string().min(2, 'Ingresa tu apellido'),
    email: z.string().email('Ingresa un email válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    password_confirm: z.string().min(8, 'Confirma tu contraseña'),
    rut: z.string().min(1, 'Ingresa tu número de documento'),
    celular: z.string().min(1, 'Ingresa tu teléfono celular'),
    tipo_documento_id: z.coerce.number().min(1, 'Selecciona un tipo de documento'),
    terms: z.union([z.literal(true), z.literal('on')]).transform(() => true as const),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  })

export type ActionResult = {
  error?: string
  success?: boolean
  fieldErrors?: Record<string, string[]>
}

function getAuthMessage(errorMessage: string): string {
  const message = errorMessage.toLowerCase()

  if (
    message.includes('already registered') ||
    message.includes('already been registered') ||
    message.includes('user already registered') ||
    message.includes('user already exists')
  ) {
    return 'Este email ya está registrado'
  }

  if (message.includes('invalid login')) {
    return 'Credenciales incorrectas'
  }

  if (message.includes('email not confirmed')) {
    return 'Debes verificar tu email primero'
  }

  if (message.includes('duplicate key') && message.includes('rut')) {
    return 'Este RUT ya está registrado'
  }

  if (message.includes('duplicate key')) {
    return 'Ya existe un registro con estos datos'
  }

  if (message.includes('resend')) {
    return 'No pudimos enviar el correo de confirmación. Revisa la configuración de Resend.'
  }

  return errorMessage || 'Error inesperado'
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
    redirect('/login?error=' + encodeURIComponent(getAuthMessage(error.message)))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const service = createServiceClient()

    const { data: profile } = await service
      .from('profiles')
      .select('total_login')
      .eq('id', user.id)
      .single()

    await service
      .from('profiles')
      .update({
        last_login: new Date().toISOString(),
        total_login: ((profile as any)?.total_login ?? 0) + 1,
      })
      .eq('id', user.id)
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
    terms: formData.get('terms'),
  }

  const parsed = RegisterSchema.safeParse(raw)

  if (!parsed.success) {
    const firstError =
      parsed.error.flatten().formErrors[0] ||
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ||
      'Completa todos los campos correctamente'

    redirect('/register?error=' + encodeURIComponent(firstError))
  }

  const service = createServiceClient()

  /**
   * 100% Resend por código:
   * - NO usamos supabase.auth.signUp(), porque eso intenta enviar el correo desde Supabase.
   * - Usamos auth.admin.generateLink() para crear el usuario y generar el link.
   * - Enviamos el correo manualmente con Resend.
   */
  const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
    type: 'signup',
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        lastname: parsed.data.lastname,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (linkError) {
    console.error('Error generando link de confirmación:', linkError)
    redirect('/register?error=' + encodeURIComponent(getAuthMessage(linkError.message)))
  }

  const user = linkData.user
  const actionLink = linkData.properties?.action_link

  if (!user?.id || !actionLink) {
    console.error('Respuesta incompleta desde generateLink:', linkData)
    redirect('/register?error=' + encodeURIComponent('No se pudo generar el enlace de confirmación'))
  }

  const { error: profileError } = await service
    .from('profiles')
    .upsert(
      {
        id: user.id,
        name: parsed.data.name,
        lastname: parsed.data.lastname,
        rut: parsed.data.rut,
        celular: parsed.data.celular,
        tipo_documento_id: parsed.data.tipo_documento_id,
        terms: true,
        validado: 0,
        role: 'User',
        kyc_status: 'pending_review',
      },
      { onConflict: 'id' }
    )

  if (profileError) {
    console.error('Error creando/actualizando profile:', profileError)
    redirect('/register?error=' + encodeURIComponent(getAuthMessage(profileError.message)))
  }

  const html = confirmAccountTemplate({
    name: parsed.data.name,
    confirmationUrl: actionLink,
  })

  const emailResult = await sendEmail({
    to: parsed.data.email,
    subject: 'Confirma tu cuenta en TRAPPING',
    html,
  })

  if (!emailResult.ok) {
    console.error('Error enviando correo con Resend:', emailResult.error)
    redirect(
      '/register?error=' +
        encodeURIComponent(
          'Tu cuenta fue creada, pero no pudimos enviar el correo de confirmación. Contacta al equipo Trapping.'
        )
    )
  }

  redirect('/verify-email?registered=1')
}

export async function logoutAction(): Promise<void> {
  const supabase = createClient()

  await supabase.auth.signOut()

  redirect('/login')
}
