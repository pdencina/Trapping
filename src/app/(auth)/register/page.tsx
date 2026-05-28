'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  ArrowRight, BadgeCheck, Check, CheckCircle2, ChevronDown,
  CreditCard, Eye, EyeOff, Lock, Mail, MonitorCheck,
  Phone, QrCode, RefreshCw, ShieldCheck, User,
} from 'lucide-react'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'

type FormState = {
  firstName: string; lastName: string; documentType: string
  documentNumber: string; phone: string; email: string
  password: string; confirmPassword: string; terms: boolean
}

const initialForm: FormState = {
  firstName: '', lastName: '', documentType: '', documentNumber: '',
  phone: '+56', email: '', password: '', confirmPassword: '', terms: false,
}

const inputBase = 'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100'

function Stepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = [
    { number: 1, title: 'Datos personales', subtitle: 'Completa tu información' },
    { number: 2, title: 'Identidad', subtitle: 'Documento y selfie' },
    { number: 3, title: 'Revisión', subtitle: 'Validación final' },
  ]
  return (
    <div className="mx-auto mt-8 flex max-w-3xl items-center justify-center gap-5 text-sm max-md:flex-col max-md:items-stretch">
      {steps.map((step, index) => {
        const active = step.number === currentStep
        const done = step.number < currentStep
        return (
          <div key={step.number} className="flex items-center gap-5 max-md:w-full">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold shadow-sm transition ${done ? 'border-green-500 bg-green-500 text-white' : active ? 'border-violet-600 bg-violet-600 text-white shadow-violet-200' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                {done ? <Check size={18} /> : step.number}
              </div>
              <div>
                <p className="font-extrabold text-slate-700">{step.title}</p>
                <p className={active ? 'text-xs font-semibold text-violet-600' : 'text-xs text-slate-500'}>{step.subtitle}</p>
              </div>
            </div>
            {index < steps.length - 1 ? <div className="h-px w-20 bg-slate-200 max-md:hidden" /> : null}
          </div>
        )
      })}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm font-extrabold text-slate-700">{children}</label>
}

function IconInput({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <>{children}</>
}

function SecuritySidebar() {
  return (
    <aside className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <ShieldCheck size={25} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold leading-tight text-slate-700">Tu seguridad es nuestra prioridad</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">Utilizamos tecnología de encriptación y validación de identidad para mantener tu cuenta protegida.</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Lock, title: 'Encriptación', desc: '256-bit' },
            { icon: BadgeCheck, title: 'Verificación', desc: 'de identidad' },
            { icon: MonitorCheck, title: 'Monitoreo', desc: 'antifraude' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl bg-violet-50 px-3 py-4 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm"><Icon size={17} /></div>
              <p className="mt-3 text-xs font-extrabold leading-tight text-slate-700">{title}</p>
              <p className="text-xs font-bold leading-tight text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <h3 className="text-lg font-extrabold text-slate-700">¿Por qué validamos tu identidad?</h3>
        <div className="mt-5 space-y-4 text-sm text-slate-600">
          {['Cumplimos con regulaciones financieras', 'Protegemos tu cuenta y tus transacciones', 'Prevenimos fraudes y suplantación de identidad', 'Te permite operar con límites más altos'].map(text => (
            <div key={text} className="flex gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-5">
          <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-3xl border-2 border-violet-200 bg-white text-slate-600">
            <QrCode size={54} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-700">Proceso 100% digital</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Al validar tu identidad, continuarás desde el celular con cámara guiada.</p>
          </div>
        </div>
      </section>
    </aside>
  )
}

// ── PASO 2: Instrucciones para confirmar email ──────────────────────
function Step2KYC({ phone, onBack, onDone }: { phone: string; onBack: () => void; onDone: () => void }) {
  return (
    <>
      <h2 className="text-2xl font-extrabold text-slate-700">Confirma tu correo para continuar</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Antes de verificar tu identidad, necesitas confirmar tu email.
      </p>

      <div className="mt-8 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600 mb-5">
          <Mail size={40} />
        </div>
        <h3 className="text-xl font-extrabold text-slate-700 mb-3">Revisa tu bandeja de entrada</h3>
        <p className="text-sm text-slate-500 leading-6 max-w-sm mx-auto">
          Te enviamos un correo de confirmación. Al hacer clic en el enlace, serás redirigido automáticamente para fotografiar tu documento de identidad.
        </p>

        <div className="mt-6 space-y-3 text-sm text-left max-w-sm mx-auto">
          {[
            '1. Abre el correo de Trapping en tu bandeja',
            '2. Haz clic en "Confirmar email"',
            '3. Serás redirigido al paso de verificación de identidad',
            '4. Fotografía tu CI desde tu celular',
          ].map(step => (
            <div key={step} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-violet-100">
              <span className="text-violet-600 font-bold flex-shrink-0">→</span>
              <span className="text-slate-600">{step}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-slate-400">
          ¿No llegó el correo? Revisa tu carpeta de spam.
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onBack}
          className="h-13 flex-1 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">
          Volver
        </button>
      </div>
    </>
  )
}

// ── COMPONENTE PRINCIPAL ────────────────────────────────────────────
export default function RegisterPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tiposDoc, setTiposDoc] = useState<{id: number; nombre_documento: string}[]>([])

  // Cargar tipos de documento
  useEffect(() => {
    const load = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase.from('tipos_documentos').select('id, nombre_documento').is('deleted_at', null).order('nombre_documento')
      setTiposDoc(data ?? [])
    }
    load()
  }, [])

  const canContinue = form.firstName && form.lastName && form.documentType &&
    form.documentNumber && form.phone && form.email &&
    form.password.length >= 8 && form.password === form.confirmPassword && form.terms

  const update = (key: keyof FormState, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }))

  // Submit paso 1 → crear usuario via API Route
  const handleContinue = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.firstName,
          lastname: form.lastName,
          email: form.email,
          password: form.password,
          rut: form.documentNumber,
          celular: form.phone,
          tipo_documento_id: form.documentType,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error al crear la cuenta')
        setSubmitting(false)
        return
      }

      // Si necesita confirmar email → mostrar pantalla de confirmación
      if (json.needsEmailConfirm) {
        setStep('email_sent' as any)
      } else {
        // Email ya confirmado (raro) → ir directo a KYC
        setStep(2)
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    }
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-slate-700">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-extrabold text-white shadow-sm">T</div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-800">Trapping</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="max-sm:hidden">¿Ya tienes cuenta?</span>
            <Link href="/login" className="rounded-xl border border-violet-200 bg-white px-4 py-2 font-extrabold text-violet-700 transition hover:bg-violet-50">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-violet-700 shadow-sm ring-1 ring-violet-100">
            <ShieldCheck size={15} /> Validación segura
          </div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-700 max-sm:text-3xl">Crea tu cuenta gratuita</h1>
          <p className="mt-3 text-base text-slate-500">Protegemos tu identidad con validación segura y monitoreo antifraude.</p>
        </div>

        <Stepper currentStep={step} />

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)] gap-6 max-lg:grid-cols-1">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur max-sm:p-5">

            {/* ── PASO 1 ── */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-extrabold text-slate-700">Datos de cuenta</h2>
                <p className="mt-2 text-sm text-slate-500">Completa tus datos personales para comenzar.</p>

                {error && (
                  <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                <div className="mt-8 grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                  <div>
                    <FieldLabel>Nombres *</FieldLabel>
                    <IconInput icon={<User size={16} />}>
                      <input className={`${inputBase}`} placeholder="Ingresa tu nombre(s)"
                        value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                    </IconInput>
                  </div>
                  <div>
                    <FieldLabel>Apellidos *</FieldLabel>
                    <IconInput icon={<User size={16} />}>
                      <input className={`${inputBase}`} placeholder="Ingresa tus apellidos"
                        value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                    </IconInput>
                  </div>
                  <div>
                    <FieldLabel>Tipo de documento *</FieldLabel>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select className={`${inputBase} appearance-none`}
                        value={form.documentType} onChange={e => update('documentType', e.target.value)}>
                        <option value="">Selecciona tu documento</option>
                        {tiposDoc.map(t => <option key={t.id} value={String(t.id)}>{t.nombre_documento}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Número de documento *</FieldLabel>
                    <IconInput icon={<CreditCard size={16} />}>
                      <input className={`${inputBase}`} placeholder="Ej: 12.345.678-9"
                        value={form.documentNumber} onChange={e => update('documentNumber', e.target.value)} />
                    </IconInput>
                  </div>
                </div>

                <div className="mt-5">
                  <FieldLabel>Teléfono celular *</FieldLabel>
                  <PhoneInput defaultCountry="cl" value={form.phone}
                    onChange={value => update('phone', value)}
                    inputClassName="!h-12 !w-full !rounded-xl !border-slate-200 !text-sm !text-slate-700 !outline-none"
                    countrySelectorStyleProps={{
                      buttonClassName: '!h-12 !rounded-l-xl !border-slate-200 !bg-white !px-3 !text-sm hover:!bg-slate-50',
                    }} />
                </div>

                <div className="mt-5">
                  <FieldLabel>Email *</FieldLabel>
                  <IconInput icon={<Mail size={16} />}>
                    <input type="email" className={`${inputBase}`} placeholder="ejemplo@correo.com"
                      value={form.email} onChange={e => update('email', e.target.value)} />
                  </IconInput>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                  <div>
                    <FieldLabel>Contraseña *</FieldLabel>
                    <IconInput icon={<Lock size={16} />}>
                      <input type={showPassword ? 'text' : 'password'} className={`${inputBase} pr-12`}
                        placeholder="Mínimo 8 caracteres" value={form.password}
                        onChange={e => update('password', e.target.value)} />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </IconInput>
                  </div>
                  <div>
                    <FieldLabel>Confirmar contraseña *</FieldLabel>
                    <IconInput icon={<Lock size={16} />}>
                      <input type={showConfirmPassword ? 'text' : 'password'} className={`${inputBase} pr-12`}
                        placeholder="Repite tu contraseña" value={form.confirmPassword}
                        onChange={e => update('confirmPassword', e.target.value)} />
                      <button type="button" onClick={() => setShowConfirmPassword(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </IconInput>
                  </div>
                </div>

                <label className="mt-6 flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={form.terms} onChange={e => update('terms', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                  <span>
                    Acepto los <span className="font-extrabold text-violet-700">términos y condiciones</span> y la{' '}
                    <span className="font-extrabold text-violet-700">política de privacidad</span>. Entiendo que mi cuenta debe ser validada antes de poder operar.
                  </span>
                </label>

                <button type="button" disabled={!canContinue || submitting} onClick={handleContinue}
                  className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-400 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100">
                  {submitting ? 'Creando cuenta...' : <> Continuar <ArrowRight size={17} /> </>}
                </button>
              </>
            )}

            {/* ── PASO INTERMEDIO: Confirmar email ── */}
            {(step as any) === 'email_sent' && (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <Mail size={44} />
                </div>
                <h2 className="mt-6 text-2xl font-extrabold text-slate-700">Revisa tu correo</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                  Te enviamos un enlace de confirmación a <strong className="text-slate-700">{form.email}</strong>.
                  Haz clic en el enlace para continuar con la verificación de tu identidad.
                </p>
                <div className="mt-6 rounded-2xl bg-violet-50 border border-violet-200 p-5 text-sm text-violet-700 max-w-sm mx-auto">
                  <p className="font-extrabold mb-1">¿Qué pasa después?</p>
                  <p className="leading-6">Al hacer clic en el enlace del correo, te llevaremos directamente a fotografiar tu documento de identidad.</p>
                </div>
                <p className="mt-6 text-xs text-slate-400">
                  ¿No llegó el correo? Revisa tu carpeta de spam.
                </p>
              </div>
            )}

            {/* ── PASO 2: KYC con QR real ── */}
            {step === 2 && (
              <Step2KYC
                phone={form.phone}
                onBack={() => setStep(1)}
                onDone={() => setStep(3)}
              />
            )}

            {/* ── PASO 3: Confirmación ── */}
            {step === 3 && (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 size={44} />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-slate-700">Tu cuenta quedó en revisión</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                  Revisaremos tu información y documentos. Te avisaremos cuando la cuenta esté habilitada para operar.
                </p>
                <Link href="/login"
                  className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-violet-600 px-8 text-sm font-extrabold text-white transition hover:bg-violet-700">
                  Ir a iniciar sesión
                </Link>
              </div>
            )}
          </section>

          <SecuritySidebar />
        </div>
      </section>
    </main>
  )
}
