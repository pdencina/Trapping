'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, Camera, Check, CheckCircle2, FileImage, RotateCcw, ShieldCheck, Upload } from 'lucide-react'

type CaptureStep = 'front' | 'back' | 'selfie' | 'review'
type Captures = Record<'front' | 'back' | 'selfie', File | null>

const steps: { key: Exclude<CaptureStep, 'review'>; title: string; description: string; capture: 'environment' | 'user' }[] = [
  {
    key: 'front',
    title: 'Documento frontal',
    description: 'Ubica el frente del documento dentro del marco, con buena luz y sin reflejos.',
    capture: 'environment',
  },
  {
    key: 'back',
    title: 'Documento reverso',
    description: 'Da vuelta el documento y captura el reverso completo, nítido y sin cortes.',
    capture: 'environment',
  },
  {
    key: 'selfie',
    title: 'Selfie del rostro',
    description: 'Mira de frente a la cámara, sin lentes oscuros y con el rostro iluminado.',
    capture: 'user',
  },
]

function Preview({ file }: { file: File | null }) {
  const src = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  if (!src) {
    return (
      <div className="flex h-72 items-center justify-center rounded-[2rem] border-2 border-dashed border-violet-200 bg-violet-50/70 text-center text-slate-500">
        <div>
          <Camera className="mx-auto h-12 w-12 text-violet-500" />
          <p className="mt-3 text-sm font-bold">La cámara se abrirá en tu celular</p>
          <p className="mt-1 text-xs">Toma una foto clara para continuar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <img src={src} alt="Vista previa" className="h-72 w-full object-cover" />
    </div>
  )
}

export default function MobileKycPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [captures, setCaptures] = useState<Captures>({ front: null, back: null, selfie: null })
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const current = steps[currentIndex]
  const currentFile = captures[current.key]
  const completedCount = Object.values(captures).filter(Boolean).length
  const readyToSubmit = completedCount === 3

  const handleFile = (file?: File) => {
    if (!file) return
    setCaptures((prev) => ({ ...prev, [current.key]: file }))
  }

  const goNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.12),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-5 py-8 text-slate-700">
        <section className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
            <CheckCircle2 size={54} />
          </div>
          <h1 className="mt-7 text-3xl font-extrabold tracking-tight text-slate-700">Documentos enviados</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Recibimos tus fotos para revisión KYC. Puedes volver al registro para finalizar el proceso.
          </p>
          <Link href="/register" className="mt-8 flex h-13 w-full items-center justify-center rounded-2xl bg-violet-600 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-violet-200">
            Volver al registro
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.12),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-5 py-6 text-slate-700">
      <section className="mx-auto max-w-md">
        <header className="flex items-center justify-between">
          <Link href="/register" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-violet-700 shadow-sm ring-1 ring-violet-100">
            <ShieldCheck size={14} /> KYC seguro
          </div>
        </header>

        <div className="mt-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-violet-600">Paso {currentIndex + 1} de 3</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-700">{current.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{current.description}</p>
        </div>

        <div className="mt-6 flex gap-2">
          {steps.map((step, index) => (
            <div key={step.key} className={`h-2 flex-1 rounded-full ${index <= currentIndex ? 'bg-violet-600' : 'bg-slate-200'}`} />
          ))}
        </div>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
          <Preview file={currentFile} />

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture={current.capture}
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-400 text-sm font-extrabold text-white shadow-lg shadow-violet-200"
          >
            {currentFile ? <RotateCcw size={18} /> : <Camera size={18} />}
            {currentFile ? 'Repetir foto' : 'Abrir cámara'}
          </button>

          <label className="mt-3 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-xs font-extrabold text-slate-500">
            <Upload size={15} /> Subir imagen como respaldo
            <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
          </label>
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FileImage className="h-5 w-5 text-violet-600" />
            <p className="text-sm font-extrabold text-slate-700">Checklist de captura</p>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {steps.map((step) => {
              const completed = Boolean(captures[step.key])
              return (
                <div key={step.key} className="flex items-center gap-3 text-slate-600">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Check size={14} />
                  </div>
                  <span className={completed ? 'font-bold text-slate-700' : ''}>{step.title}</span>
                </div>
              )
            })}
          </div>
        </section>

        <button
          type="button"
          disabled={!currentFile}
          onClick={goNext}
          className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-violet-600 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition disabled:cursor-not-allowed disabled:opacity-45"
        >
          {currentIndex === steps.length - 1 ? (readyToSubmit ? 'Enviar a revisión' : 'Completar fotos') : 'Continuar'}
        </button>
      </section>
    </main>
  )
}
