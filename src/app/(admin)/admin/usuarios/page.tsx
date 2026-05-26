'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, Check, Eye, EyeOff, FileText, Mail, Phone, QrCode, ShieldCheck, Smartphone, Upload, User } from 'lucide-react'

type Step = 1 | 2 | 3

const steps = [
  { id: 1, label: 'Cuenta' },
  { id: 2, label: 'Identidad' },
  { id: 3, label: 'Revisión' },
]

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [usePhoneFlow, setUsePhoneFlow] = useState(false)

  const progress = useMemo(() => `${(step / steps.length) * 100}%`, [step])

  const nextStep = () => setStep((current) => Math.min(current + 1, 3) as Step)
  const prevStep = () => setStep((current) => Math.max(current - 1, 1) as Step)

  return (
    <main className="min-h-screen bg-[#eef7f8] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden bg-gradient-to-br from-violet-800 via-violet-700 to-cyan-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-black backdrop-blur">
              T
            </div>
            <h1 className="mt-8 text-4xl font-black leading-tight">
              Crea tu cuenta de forma segura
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">
              Registro moderno con validación de identidad, documentos y revisión KYC para proteger cada operación.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl bg-white/10 p-6 backdrop-blur">
            <Feature icon={ShieldCheck} title="Validación segura" text="Documento y selfie para confirmar identidad." />
            <Feature icon={Smartphone} title="Continúa en tu teléfono" text="Escanea un QR y toma las fotos desde el celular." />
            <Feature icon={Check} title="Revisión rápida" text="Tu solicitud queda lista para revisión administrativa." />
          </div>
        </aside>

        <section className="p-6 sm:p-10">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-violet-700">Trapping</p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Regístrate</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Completa los pasos para activar tu cuenta.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                {steps.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs font-extrabold text-slate-500">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                        step >= item.id
                          ? 'border-violet-700 bg-violet-700 text-white'
                          : 'border-slate-200 bg-white text-slate-400'
                      }`}
                    >
                      {step > item.id ? <Check size={14} /> : item.id}
                    </span>
                    <span className={step >= item.id ? 'text-violet-700' : ''}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-violet-700 transition-all" style={{ width: progress }} />
              </div>
            </div>

            {step === 1 ? (
              <AccountStep
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                setShowPassword={setShowPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                onNext={nextStep}
              />
            ) : null}

            {step === 2 ? (
              <IdentityStep
                usePhoneFlow={usePhoneFlow}
                setUsePhoneFlow={setUsePhoneFlow}
                onBack={prevStep}
                onNext={nextStep}
              />
            ) : null}

            {step === 3 ? <ReviewStep onBack={prevStep} /> : null}
          </div>
        </section>
      </section>
    </main>
  )
}

function AccountStep({
  showPassword,
  showConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
  onNext,
}: {
  showPassword: boolean
  showConfirmPassword: boolean
  setShowPassword: (value: boolean) => void
  setShowConfirmPassword: (value: boolean) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nombres" placeholder="Ingresa tus nombres" icon={User} />
        <Input label="Apellidos" placeholder="Ingresa tus apellidos" icon={User} />
      </div>

      <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
        <Select label="Tipo documento" options={['Seleccione', 'Cédula de Ciudadanía', 'Cédula de Identidad', 'Pasaporte']} />
        <Input label="Nro. documento" placeholder="Número de documento" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Correo electrónico" placeholder="correo@ejemplo.com" icon={Mail} />
        <Input label="Teléfono" placeholder="+56 9 0000 0000" icon={Phone} />
      </div>

      <PasswordInput
        label="Contraseña"
        placeholder="Crea una contraseña segura"
        show={showPassword}
        onToggle={() => setShowPassword(!showPassword)}
      />
      <p className="-mt-3 text-xs text-slate-500">
        Te sugerimos no usar números consecutivos, repetidos o tu fecha de nacimiento.
      </p>

      <PasswordInput
        label="Confirma contraseña"
        placeholder="Confirma tu contraseña"
        show={showConfirmPassword}
        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-700" />
        <span>
          Al crear una cuenta, acepto los <b className="text-violet-700">Términos y condiciones</b> y la{' '}
          <b className="text-violet-700">Política de privacidad</b>.
        </span>
      </label>

      <button
        type="button"
        onClick={onNext}
        className="h-13 w-full rounded-2xl bg-violet-700 px-5 py-4 text-sm font-black text-white transition hover:bg-violet-800"
      >
        Continuar validación
      </button>

      <p className="text-center text-sm text-slate-500">
        ¿Ya tienes una cuenta? <span className="font-extrabold text-violet-700">Inicia sesión</span>
      </p>
    </div>
  )
}

function IdentityStep({
  usePhoneFlow,
  setUsePhoneFlow,
  onBack,
  onNext,
}: {
  usePhoneFlow: boolean
  setUsePhoneFlow: (value: boolean) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-violet-100 bg-violet-50 p-5">
        <h3 className="text-lg font-black text-violet-900">Verifica tu identidad</h3>
        <p className="mt-2 text-sm leading-6 text-violet-900/70">
          Puedes subir tus documentos desde este computador o continuar desde tu teléfono para tomar fotos con la cámara.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setUsePhoneFlow(false)}
          className={`rounded-3xl border p-5 text-left transition ${
            !usePhoneFlow ? 'border-violet-300 bg-violet-50 ring-4 ring-violet-100' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <Upload className="mb-4 text-violet-700" />
          <p className="font-black text-slate-950">Subir desde este dispositivo</p>
          <p className="mt-2 text-sm text-slate-500">Adjunta el documento y la selfie manualmente.</p>
        </button>

        <button
          type="button"
          onClick={() => setUsePhoneFlow(true)}
          className={`rounded-3xl border p-5 text-left transition ${
            usePhoneFlow ? 'border-violet-300 bg-violet-50 ring-4 ring-violet-100' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <Smartphone className="mb-4 text-violet-700" />
          <p className="font-black text-slate-950">Seguir en mi teléfono</p>
          <p className="mt-2 text-sm text-slate-500">Escanea un QR para tomar las fotos desde el celular.</p>
        </button>
      </div>

      {usePhoneFlow ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
          <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-3xl border border-dashed border-violet-300 bg-violet-50 text-violet-700">
            <QrCode size={96} />
          </div>
          <h4 className="mt-5 font-black text-slate-950">Escanea para continuar</h4>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Al abrir el link en tu teléfono podrás tomar foto del documento y selfie. Luego vuelve a esta pantalla para finalizar.
          </p>
          <button className="mt-5 rounded-2xl border border-violet-300 px-5 py-3 text-sm font-black text-violet-700 hover:bg-violet-50">
            Enviar link por correo
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <UploadCard title="Documento frontal" />
          <UploadCard title="Documento reverso" />
          <UploadCard title="Selfie del rostro" />
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">
          <ArrowLeft size={16} /> Volver
        </button>
        <button type="button" onClick={onNext} className="rounded-2xl bg-violet-700 px-6 py-3 text-sm font-black text-white hover:bg-violet-800">
          Finalizar registro
        </button>
      </div>
    </div>
  )
}

function ReviewStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
        <Check size={32} />
      </div>
      <h3 className="mt-5 text-2xl font-black text-slate-950">Tu solicitud quedó en revisión</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
        Revisaremos tus datos y documentos. Cuando tu cuenta sea validada, recibirás una notificación por correo.
      </p>
      <div className="mt-8 grid gap-3 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
        <p><b>Estado:</b> Pendiente de revisión KYC</p>
        <p><b>Documentos:</b> Recibidos / por validar</p>
        <p><b>Siguiente paso:</b> Esperar aprobación administrativa</p>
      </div>
      <button type="button" onClick={onBack} className="mt-6 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">
        Volver a identidad
      </button>
    </div>
  )
}

function Input({ label, placeholder, icon: Icon }: { label: string; placeholder: string; icon?: React.ElementType }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-violet-900">{label}</span>
      <div className="relative">
        {Icon ? <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : null}
        <input
          className={`h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 ${Icon ? 'pl-11' : ''}`}
          placeholder={placeholder}
        />
      </div>
    </label>
  )
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-violet-900">{label}</span>
      <select className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function PasswordInput({ label, placeholder, show, onToggle }: { label: string; placeholder: string; show: boolean; onToggle: () => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-violet-900">{label}</span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 pr-12 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
          placeholder={placeholder}
        />
        <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-700">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  )
}

function UploadCard({ title }: { title: string }) {
  return (
    <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-violet-300 hover:bg-violet-50">
      <FileText className="text-violet-700" />
      <p className="mt-3 text-sm font-black text-slate-950">{title}</p>
      <p className="mt-1 text-xs text-slate-500">JPG, PNG o PDF · Máx. 4MB</p>
      <input type="file" className="hidden" />
    </label>
  )
}

function Feature({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-1 text-sm text-white/70">{text}</p>
      </div>
    </div>
  )
}
