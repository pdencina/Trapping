'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  FileText,
  Lock,
  Mail,
  QrCode,
  ShieldCheck,
  Smartphone,
  Upload,
  User,
} from 'lucide-react'

type Step = 1 | 2 | 3

type FormState = {
  nombres: string
  apellidos: string
  tipoDocumento: string
  numeroDocumento: string
  telefono: string
  email: string
  password: string
  confirmPassword: string
  terms: boolean
  documentoFrontal?: File | null
  documentoReverso?: File | null
  selfie?: File | null
}

const initialForm: FormState = {
  nombres: '',
  apellidos: '',
  tipoDocumento: '',
  numeroDocumento: '',
  telefono: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
  documentoFrontal: null,
  documentoReverso: null,
  selfie: null,
}

const steps = [
  { id: 1, title: 'Cuenta', description: 'Datos personales' },
  { id: 2, title: 'Identidad', description: 'Documento y selfie' },
  { id: 3, title: 'Revisión', description: 'Validación final' },
]

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-bold text-slate-800">{children}</label>
}

function TextInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 ${className}`}
    />
  )
}

function SelectInput({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
    >
      {children}
    </select>
  )
}

function UploadCard({
  icon: Icon,
  title,
  description,
  file,
  onChange,
}: {
  icon: React.ElementType
  title: string
  description: string
  file?: File | null
  onChange: (file: File | null) => void
}) {
  return (
    <label className="group flex cursor-pointer items-start gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5 transition hover:border-violet-300 hover:bg-violet-50/40">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-extrabold text-violet-700">
          <Upload size={14} />
          {file ? file.name : 'Seleccionar archivo'}
        </div>
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </div>
    </label>
  )
}

function Stepper({ currentStep }: { currentStep: Step }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {steps.map((step) => {
        const active = step.id === currentStep
        const done = step.id < currentStep
        return (
          <div
            key={step.id}
            className={`rounded-2xl border p-4 ${
              active
                ? 'border-violet-300 bg-violet-50'
                : done
                  ? 'border-green-200 bg-green-50'
                  : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${
                  done
                    ? 'bg-green-600 text-white'
                    : active
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {done ? <Check size={18} /> : step.id}
              </div>
              <div>
                <p className="font-extrabold text-slate-950">{step.title}</p>
                <p className="text-xs text-slate-500">{step.description}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const canContinueAccount = useMemo(() => {
    return (
      form.nombres.trim() &&
      form.apellidos.trim() &&
      form.tipoDocumento &&
      form.numeroDocumento.trim() &&
      form.telefono.trim() &&
      form.email.trim() &&
      form.password.length >= 8 &&
      form.password === form.confirmPassword &&
      form.terms
    )
  }, [form])

  const canContinueIdentity = Boolean(form.documentoFrontal && form.documentoReverso && form.selfie)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    setSubmitted(true)
    setStep(3)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-700 text-xl font-extrabold text-white shadow-sm">
              T
            </div>
            <span className="text-3xl font-extrabold tracking-tight">Trapping</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Crea tu cuenta gratuita</h1>
          <p className="mt-2 text-slate-500">Registro seguro con validación de identidad tipo fintech.</p>
        </header>

        <Stepper currentStep={step} />

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            {step === 1 ? (
              <div className="space-y-7">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-700">Paso 1</p>
                  <h2 className="mt-2 text-2xl font-extrabold">Datos de cuenta</h2>
                  <p className="mt-1 text-sm text-slate-500">Ingresa tus datos personales y crea tu acceso.</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <FieldLabel>Nombres *</FieldLabel>
                    <TextInput placeholder="Tu nombre" value={form.nombres} onChange={(e) => update('nombres', e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>Apellidos *</FieldLabel>
                    <TextInput placeholder="Tu apellido" value={form.apellidos} onChange={(e) => update('apellidos', e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>Tipo de documento *</FieldLabel>
                    <SelectInput value={form.tipoDocumento} onChange={(e) => update('tipoDocumento', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="rut">Cédula de identidad / RUT</option>
                      <option value="passport">Pasaporte</option>
                      <option value="foreign_id">Documento extranjero</option>
                    </SelectInput>
                  </div>
                  <div>
                    <FieldLabel>Número de documento *</FieldLabel>
                    <TextInput placeholder="Ej: 12345678-9" value={form.numeroDocumento} onChange={(e) => update('numeroDocumento', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel>Teléfono celular *</FieldLabel>
                    <TextInput placeholder="+56 9 1234 5678" value={form.telefono} onChange={(e) => update('telefono', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel>Email *</FieldLabel>
                    <TextInput type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>Contraseña *</FieldLabel>
                    <TextInput type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => update('password', e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>Confirmar contraseña *</FieldLabel>
                    <TextInput type="password" placeholder="Repite tu contraseña" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => update('terms', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-700 focus:ring-violet-500"
                  />
                  <span>
                    Acepto los <strong className="text-violet-700">términos y condiciones</strong> y la{' '}
                    <strong className="text-violet-700">política de privacidad</strong>. Entiendo que mi cuenta debe ser validada antes de operar.
                  </span>
                </label>

                <button
                  type="button"
                  disabled={!canContinueAccount}
                  onClick={() => setStep(2)}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-violet-700 px-5 py-4 font-extrabold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Continuar validación
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-7">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-700">Paso 2</p>
                  <h2 className="mt-2 text-2xl font-extrabold">Verifica tu identidad</h2>
                  <p className="mt-1 text-sm text-slate-500">Sube fotos claras de tu documento y una selfie para revisión KYC.</p>
                </div>

                <div className="grid gap-4">
                  <UploadCard
                    icon={FileText}
                    title="Documento frontal"
                    description="Foto frontal de tu cédula o documento de identidad. Máx. 4MB."
                    file={form.documentoFrontal}
                    onChange={(file) => update('documentoFrontal', file)}
                  />
                  <UploadCard
                    icon={FileText}
                    title="Documento reverso"
                    description="Foto reverso de tu cédula o documento de identidad. Máx. 4MB."
                    file={form.documentoReverso}
                    onChange={(file) => update('documentoReverso', file)}
                  />
                  <UploadCard
                    icon={Camera}
                    title="Selfie del rostro"
                    description="Foto actual de tu rostro, con buena luz y sin lentes oscuros."
                    file={form.selfie}
                    onChange={(file) => update('selfie', file)}
                  />
                </div>

                <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-700">
                        <Smartphone size={21} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-950">¿Quieres sacar las fotos desde tu celular?</p>
                        <p className="mt-1 text-sm text-slate-500">Escanea el QR o envía un link seguro a tu teléfono para continuar.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.alert('Aquí conectaremos QR / link móvil seguro')}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-300 bg-white px-4 py-3 text-sm font-extrabold text-violet-700 transition hover:bg-violet-100"
                    >
                      <QrCode size={17} />
                      Seguir en mi teléfono
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white font-extrabold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ArrowLeft size={18} />
                    Volver
                  </button>
                  <button
                    type="button"
                    disabled={!canContinueIdentity}
                    onClick={handleSubmit}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-700 font-extrabold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Enviar a revisión
                    <ShieldCheck size={18} />
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 size={42} />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold">Tu cuenta quedó en revisión</h2>
                <p className="mt-3 max-w-xl text-slate-500">
                  Recibimos tus datos y documentos. Un administrador validará tu identidad antes de habilitar tus operaciones en Trapping.
                </p>
                <div className="mt-8 w-full max-w-md rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left">
                  <p className="font-extrabold text-slate-950">Resumen</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p><strong>Usuario:</strong> {form.nombres || '—'} {form.apellidos || ''}</p>
                    <p><strong>Email:</strong> {form.email || '—'}</p>
                    <p><strong>Estado:</strong> Pendiente de revisión KYC</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForm(initialForm)
                    setSubmitted(false)
                    setStep(1)
                  }}
                  className="mt-6 rounded-2xl bg-violet-700 px-6 py-3 font-extrabold text-white transition hover:bg-violet-800"
                >
                  Crear otra cuenta
                </button>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <Lock size={23} />
              </div>
              <h3 className="mt-4 text-lg font-extrabold">Registro seguro</h3>
              <p className="mt-2 text-sm text-slate-500">Tus documentos son usados solo para validar identidad y prevenir fraude.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-extrabold">Checklist KYC</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-3"><CheckCircle2 size={17} className={step > 1 ? 'text-green-600' : 'text-slate-300'} /> Datos personales</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={17} className={form.documentoFrontal ? 'text-green-600' : 'text-slate-300'} /> Documento frontal</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={17} className={form.documentoReverso ? 'text-green-600' : 'text-slate-300'} /> Documento reverso</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={17} className={form.selfie ? 'text-green-600' : 'text-slate-300'} /> Selfie rostro</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={17} className={submitted ? 'text-green-600' : 'text-slate-300'} /> Enviado a revisión</div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-violet-300" />
                <p className="font-extrabold">¿Ya tienes cuenta?</p>
              </div>
              <a href="/login" className="mt-4 inline-flex text-sm font-extrabold text-violet-200 hover:text-white">
                Iniciar sesión
              </a>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
