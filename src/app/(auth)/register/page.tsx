'use client'

import { useMemo, useState } from 'react'
import type { ElementType, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  MonitorCheck,
  Phone,
  QrCode,
  ShieldCheck,
  Smartphone,
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
  documentoFrontal: File | null
  documentoReverso: File | null
  selfie: File | null
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
  { id: 1 as Step, title: 'Datos personales', description: 'Completa tu información' },
  { id: 2 as Step, title: 'Identidad', description: 'Documento y selfie' },
  { id: 3 as Step, title: 'Revisión', description: 'Validación final' },
]

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function Label({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-sm font-extrabold text-slate-950">{children}</label>
}

function InputWithIcon({ icon: Icon, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { icon: ElementType }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        {...props}
        className={cx(
          'h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100',
          className,
        )}
      />
    </div>
  )
}

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />
      <button
        type="button"
        onClick={() => setShow((current) => !current)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700"
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}

function SelectWithIcon({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <CreditCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <select
        {...props}
        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  )
}

function Stepper({ currentStep }: { currentStep: Step }) {
  return (
    <div className="mx-auto mt-8 flex max-w-[880px] items-center justify-center gap-5">
      {steps.map((step, index) => {
        const active = step.id === currentStep
        const done = step.id < currentStep

        return (
          <div key={step.id} className="flex flex-1 items-center gap-5">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cx(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-extrabold transition',
                  done && 'border-green-600 bg-green-600 text-white',
                  active && 'border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-200',
                  !active && !done && 'border-slate-300 bg-slate-100 text-slate-600',
                )}
              >
                {done ? <Check size={18} /> : step.id}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-slate-950">{step.title}</p>
                <p className={cx('truncate text-xs', active ? 'text-violet-700' : 'text-slate-500')}>{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 ? <div className={cx('hidden h-px flex-1 md:block', step.id < currentStep ? 'bg-green-300' : 'bg-slate-300')} /> : null}
          </div>
        )
      })}
    </div>
  )
}

function SecurityMiniCard({ icon: Icon, title }: { icon: ElementType; title: string }) {
  return (
    <div className="rounded-2xl bg-violet-50 px-4 py-4 text-center">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm">
        <Icon size={17} />
      </div>
      <p className="mt-2 text-xs font-extrabold leading-tight text-slate-800">{title}</p>
    </div>
  )
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-700">
      <Check className="h-4 w-4 shrink-0 text-violet-600" />
      <span>{children}</span>
    </div>
  )
}

function UploadBox({ title, description, file, onChange }: { title: string; description: string; file: File | null; onChange: (file: File | null) => void }) {
  return (
    <label className="group block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white p-5 transition hover:border-violet-400 hover:bg-violet-50/40">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <IdCard size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-slate-950">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
          <p className="mt-3 inline-flex rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-extrabold text-violet-700">
            {file ? file.name : 'Seleccionar archivo'}
          </p>
        </div>
      </div>
      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </label>
  )
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const accountCompleted = useMemo(() => {
    return Boolean(
      form.nombres.trim() &&
        form.apellidos.trim() &&
        form.tipoDocumento &&
        form.numeroDocumento.trim() &&
        form.telefono.trim() &&
        form.email.trim() &&
        form.password.length >= 8 &&
        form.password === form.confirmPassword &&
        form.terms,
    )
  }, [form])

  const identityCompleted = Boolean(form.documentoFrontal && form.documentoReverso && form.selfie)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit() {
    setSubmitted(true)
    setStep(3)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfbff] text-slate-950">
      <div className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full bg-violet-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-24 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />

      <header className="relative z-10 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-700 text-sm font-black text-white shadow-sm">T</div>
            <span className="text-2xl font-black tracking-tight">Trapping</span>
          </div>
          <div className="hidden items-center gap-3 text-sm md:flex">
            <span className="text-slate-700">¿Ya tienes cuenta?</span>
            <a href="/login" className="rounded-xl border border-violet-200 bg-white px-4 py-2 font-extrabold text-violet-700 shadow-sm transition hover:bg-violet-50">
              Iniciar sesión
            </a>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-5 pb-12 pt-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-violet-700 shadow-sm ring-1 ring-violet-100">
            <ShieldCheck size={17} />
            Validación segura
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Crea tu cuenta gratuita</h1>
          <p className="mt-2 text-slate-500">Protegemos tu identidad con validación segura y monitoreo antifraude.</p>
        </div>

        <Stepper currentStep={step} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur md:p-8">
            {step === 1 ? (
              <div>
                <h2 className="text-2xl font-black">Datos de cuenta</h2>
                <p className="mt-1 text-sm text-slate-500">Completa tus datos personales para comenzar.</p>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <div>
                    <Label>Nombres *</Label>
                    <InputWithIcon icon={User} placeholder="Ingresa tu nombre(s)" value={form.nombres} onChange={(event) => update('nombres', event.target.value)} />
                  </div>
                  <div>
                    <Label>Apellidos *</Label>
                    <InputWithIcon icon={User} placeholder="Ingresa tus apellidos" value={form.apellidos} onChange={(event) => update('apellidos', event.target.value)} />
                  </div>
                  <div>
                    <Label>Tipo de documento *</Label>
                    <SelectWithIcon value={form.tipoDocumento} onChange={(event) => update('tipoDocumento', event.target.value)}>
                      <option value="">Selecciona tu documento</option>
                      <option value="rut">Cédula de identidad / RUT</option>
                      <option value="passport">Pasaporte</option>
                      <option value="foreign_id">Documento extranjero</option>
                    </SelectWithIcon>
                  </div>
                  <div>
                    <Label>Número de documento *</Label>
                    <InputWithIcon icon={IdCard} placeholder="Ej: 12.345.678-9" value={form.numeroDocumento} onChange={(event) => update('numeroDocumento', event.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Teléfono celular *</Label>
                    <div className="flex h-12 overflow-hidden rounded-xl border border-slate-200 bg-white transition-within focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
                      <div className="flex items-center gap-2 border-r border-slate-200 px-4 text-sm font-bold text-slate-700">
                        🇨🇱 <span>+56</span>
                      </div>
                      <div className="relative flex-1">
                        <Phone className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={form.telefono}
                          onChange={(event) => update('telefono', event.target.value)}
                          placeholder="9 1234 5678"
                          className="h-full w-full border-0 bg-white px-4 pr-11 text-sm outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Email *</Label>
                    <InputWithIcon icon={Mail} type="email" placeholder="ejemplo@correo.com" value={form.email} onChange={(event) => update('email', event.target.value)} />
                  </div>
                  <div>
                    <Label>Contraseña *</Label>
                    <PasswordInput value={form.password} onChange={(value) => update('password', value)} placeholder="Mínimo 8 caracteres" />
                  </div>
                  <div>
                    <Label>Confirmar contraseña *</Label>
                    <PasswordInput value={form.confirmPassword} onChange={(value) => update('confirmPassword', value)} placeholder="Repite tu contraseña" />
                  </div>
                </div>

                <label className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(event) => update('terms', event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-700 focus:ring-violet-500"
                  />
                  <span>
                    Acepto los <a href="/terminos" className="font-extrabold text-violet-700 underline-offset-2 hover:underline">términos y condiciones</a> y la{' '}
                    <a href="/privacidad" className="font-extrabold text-violet-700 underline-offset-2 hover:underline">política de privacidad</a>. Entiendo que mi cuenta debe ser validada antes de poder operar.
                  </span>
                </label>

                <button
                  type="button"
                  disabled={!accountCompleted}
                  onClick={() => setStep(2)}
                  className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 font-black text-white shadow-lg shadow-violet-200 transition hover:scale-[1.01] hover:shadow-violet-300 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                >
                  Continuar
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <h2 className="text-2xl font-black">Verifica tu identidad</h2>
                <p className="mt-1 text-sm text-slate-500">Sube fotos claras de tu documento y una selfie para revisión KYC.</p>

                <div className="mt-7 grid gap-4">
                  <UploadBox title="Documento frontal" description="Foto frontal clara de tu cédula o documento." file={form.documentoFrontal} onChange={(file) => update('documentoFrontal', file)} />
                  <UploadBox title="Documento reverso" description="Foto reverso clara de tu cédula o documento." file={form.documentoReverso} onChange={(file) => update('documentoReverso', file)} />
                  <UploadBox title="Selfie del rostro" description="Foto actual de tu rostro, con buena luz y sin lentes oscuros." file={form.selfie} onChange={(file) => update('selfie', file)} />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setStep(1)} className="h-[50px] rounded-xl border border-slate-200 bg-white font-black text-slate-700 transition hover:bg-slate-50">
                    Volver
                  </button>
                  <button
                    type="button"
                    disabled={!identityCompleted}
                    onClick={handleSubmit}
                    className="h-[50px] rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 font-black text-white shadow-lg shadow-violet-200 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                  >
                    Enviar a revisión
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 size={42} />
                </div>
                <h2 className="mt-6 text-3xl font-black">Tu cuenta quedó en revisión</h2>
                <p className="mt-3 max-w-xl text-slate-500">Recibimos tus datos y documentos. Un administrador validará tu identidad antes de habilitar tus operaciones.</p>
                <a href="/login" className="mt-8 rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-6 py-3 font-black text-white shadow-lg shadow-violet-200 transition hover:scale-[1.01]">
                  Ir a iniciar sesión
                </a>
              </div>
            ) : null}
          </section>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-xl shadow-slate-200/40 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <ShieldCheck size={25} />
                </div>
                <div>
                  <h3 className="text-lg font-black leading-tight">Tu seguridad es nuestra prioridad</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">Utilizamos tecnología de encriptación y validación de identidad para mantener tu cuenta protegida.</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <SecurityMiniCard icon={Lock} title="Encriptación 256-bit" />
                <SecurityMiniCard icon={BadgeCheck} title="Verificación de identidad" />
                <SecurityMiniCard icon={MonitorCheck} title="Monitoreo antifraude" />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-xl shadow-slate-200/40 backdrop-blur">
              <h3 className="text-lg font-black">¿Por qué validamos tu identidad?</h3>
              <div className="mt-5 space-y-4">
                <CheckItem>Cumplimos con regulaciones financieras</CheckItem>
                <CheckItem>Protegemos tu cuenta y tus transacciones</CheckItem>
                <CheckItem>Prevenimos fraudes y suplantación de identidad</CheckItem>
                <CheckItem>Te permite operar con límites más altos</CheckItem>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-xl shadow-slate-200/40 backdrop-blur">
              <div className="flex items-center gap-5">
                <div className="flex h-32 w-20 shrink-0 items-center justify-center rounded-[24px] border-2 border-violet-200 bg-white shadow-sm">
                  <QrCode className="h-14 w-14 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Proceso 100% digital</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">También puedes continuar desde tu celular escaneando el código QR.</p>
                  <button type="button" className="mt-4 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-black text-violet-700 transition hover:bg-violet-50">
                    Continuar en mi teléfono
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
