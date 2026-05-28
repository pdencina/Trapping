'use client'
// src/app/kyc/[token]/page.tsx
import { useState, useRef, useEffect } from 'react'
import { CheckCircle2, Camera, RotateCcw, ChevronRight, Shield, User } from 'lucide-react'

type Step =
  | 'loading'
  | 'intro'
  | 'front_camera' | 'front_preview'
  | 'back_camera'  | 'back_preview'
  | 'selfie_camera'| 'selfie_preview'
  | 'uploading'
  | 'done'
  | 'error'

const STEPS_INFO = [
  { key: 'front', label: 'Frente CI',  icon: '🪪', desc: 'Parte frontal de tu documento' },
  { key: 'back',  label: 'Dorso CI',   icon: '🔲', desc: 'Parte trasera con código de barras' },
  { key: 'selfie',label: 'Selfie',     icon: '🤳', desc: 'Una foto tuya para validar identidad' },
]

export default function KYCMobilePage({ params }: { params: { token: string } }) {
  const { token } = params
  const [step, setStep] = useState<Step>('loading')
  const [frontImage, setFrontImage]   = useState<string | null>(null)
  const [backImage, setBackImage]     = useState<string | null>(null)
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const [frontFile, setFrontFile]     = useState<File | null>(null)
  const [backFile, setBackFile]       = useState<File | null>(null)
  const [selfieFile, setSelfieFile]   = useState<File | null>(null)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError]             = useState<string | null>(null)
  const [uploading, setUploading]     = useState(false)

  const frontInputRef  = useRef<HTMLInputElement>(null)
  const backInputRef   = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)

  // Verificar token
  useEffect(() => {
    const check = async () => {
      const res = await fetch(`/api/kyc/check?token=${token}`)
      if (!res.ok) { setStep('error'); setError('Sesión no encontrada o inválida'); return }
      const data = await res.json()
      if (data.expired) { setStep('error'); setError('Esta sesión ha expirado. Genera un nuevo QR desde tu computador.'); return }
      if (data.status === 'completed') { setStep('done'); return }
      setSessionData(data)
      setStep('intro')
    }
    check()
  }, [token])

  // Captura de foto
  const handleCapture = (side: 'front' | 'back' | 'selfie') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      if (side === 'front')  { setFrontImage(result);  setFrontFile(file);  setStep('front_preview') }
      if (side === 'back')   { setBackImage(result);   setBackFile(file);   setStep('back_preview') }
      if (side === 'selfie') { setSelfieImage(result); setSelfieFile(file); setStep('selfie_preview') }
    }
    reader.readAsDataURL(file)
  }

  // Upload genérico
  const upload = async (side: 'front' | 'back' | 'selfie', file: File, nextStep: Step) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('token', token)
    fd.append('side', side)
    fd.append('file', file)

    const res = await fetch('/api/kyc/upload', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)

    if (!res.ok) { setError(json.error ?? 'Error subiendo foto'); return }
    if (side === 'selfie') setStep('done')
    else setStep(nextStep)
  }

  // ── LOADING ────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // ── DONE ───────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">¡Verificación completada!</h1>
        <p className="text-gray-500 text-sm mb-6 max-w-xs leading-relaxed">
          Tus documentos y selfie fueron enviados correctamente. Nuestro equipo revisará tu identidad pronto.
        </p>
        <div className="bg-violet-50 rounded-2xl p-5 w-full max-w-xs text-left space-y-2">
          {STEPS_INFO.map(s => (
            <div key={s.key} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={14} className="text-white" />
              </div>
              <span className="text-sm text-gray-700">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-8">Puedes cerrar esta ventana.</p>
      </div>
    )
  }

  // ── ERROR ──────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sesión inválida</h2>
        <p className="text-gray-500 text-sm">{error ?? 'Este enlace no es válido o ha expirado.'}</p>
        <p className="text-gray-400 text-xs mt-4">Genera un nuevo QR desde tu computador.</p>
      </div>
    )
  }

  // ── INTRO ──────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-6 py-10">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-gray-900">Trapping · Verificación</span>
        </div>

        <div className="flex-1">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
            <Shield size={28} className="text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Verifica tu identidad</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Para activar tu cuenta necesitamos fotografiar tu documento y tomar una selfie. El proceso toma menos de 2 minutos.
          </p>

          <div className="space-y-4 mb-10">
            {STEPS_INFO.map((s, i) => (
              <div key={s.key} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
                <div className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.label}</p>
                  <p className="text-xs text-gray-400">{s.desc}</p>
                </div>
                <span className="text-2xl ml-auto">{s.icon}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-8">
            <p className="text-xs text-amber-700 font-semibold mb-1">📋 Antes de comenzar</p>
            <p className="text-xs text-amber-600">Ten tu documento a mano. Busca un lugar con buena iluminación para la selfie.</p>
          </div>
        </div>

        <button onClick={() => setStep('front_camera')}
          className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base">
          Comenzar verificación <ChevronRight size={18} />
        </button>
      </div>
    )
  }

  // ── PROGRESO (helper) ──────────────────────────────────────
  const Progress = ({ current }: { current: 1 | 2 | 3 }) => (
    <div className="flex items-center gap-2 mb-6">
      {STEPS_INFO.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2 flex-1">
          <div className={`flex items-center gap-1.5 ${i + 1 < current ? 'text-green-500' : i + 1 === current ? 'text-violet-600' : 'text-gray-300'}`}>
            <div className={`w-2 h-2 rounded-full ${i + 1 < current ? 'bg-green-500' : i + 1 === current ? 'bg-violet-600' : 'bg-gray-200'}`} />
            <span className="text-xs font-bold">{s.label}</span>
          </div>
          {i < STEPS_INFO.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
        </div>
      ))}
    </div>
  )

  // ── CÁMARA helper ──────────────────────────────────────────
  const CameraScreen = ({
    title, subtitle, stepNum, isSelfie, onCapture, inputRef
  }: {
    title: string; subtitle: string; stepNum: 1|2|3
    isSelfie?: boolean; onCapture: (e: React.ChangeEvent<HTMLInputElement>) => void
    inputRef: React.RefObject<HTMLInputElement>
  }) => (
    <div className="min-h-screen bg-gray-900 flex flex-col px-6 py-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">T</span>
        </div>
        <span className="font-bold text-white text-sm">{title}</span>
      </div>

      <Progress current={stepNum} />

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Marco guía */}
        <div className={`relative w-full max-w-xs ${isSelfie ? 'aspect-square' : 'aspect-[1.58/1]'} mb-6`}>
          <div className="absolute inset-0 border-4 border-white/20 rounded-3xl" />
          {/* Esquinas */}
          {['top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl',
            'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl',
            'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl',
            'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl',
          ].map((cls, i) => (
            <div key={i} className={`absolute w-8 h-8 border-violet-400 ${cls}`} />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            {isSelfie
              ? <User size={48} className="text-white/20" />
              : <Camera size={48} className="text-white/20" />
            }
          </div>
        </div>

        <p className="text-white/70 text-sm text-center mb-2">{subtitle}</p>
        {isSelfie && (
          <p className="text-white/40 text-xs text-center mb-2">
            Mira directo a la cámara con buena luz
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={isSelfie ? 'user' : 'environment'}
        className="hidden"
        onChange={onCapture}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 text-base"
      >
        <Camera size={22} />
        {isSelfie ? 'Tomar selfie' : `Fotografiar ${title.toLowerCase()}`}
      </button>
    </div>
  )

  // ── PREVIEW helper ─────────────────────────────────────────
  const PreviewScreen = ({
    image, title, checks, stepNum, uploading: up, isSelfie,
    onUse, onRetake,
  }: {
    image: string; title: string; checks: string[]; stepNum: 1|2|3
    uploading: boolean; isSelfie?: boolean
    onUse: () => void; onRetake: () => void
  }) => (
    <div className="min-h-screen bg-white flex flex-col px-6 py-8">
      <div className="mb-4">
        <Progress current={stepNum} />
        <h2 className="text-xl font-bold text-gray-900">¿Se ve bien?</h2>
        <p className="text-gray-500 text-sm">{title}</p>
      </div>

      <img src={image} alt="Preview"
        className={`w-full rounded-2xl shadow-lg mb-5 border border-gray-100 ${isSelfie ? 'aspect-square object-cover' : ''}`} />

      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
        {checks.map(t => (
          <div key={t} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
            {t}
          </div>
        ))}
      </div>

      <div className="space-y-3 mt-auto">
        <button onClick={onUse} disabled={up}
          className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl text-base disabled:opacity-60">
          {up ? 'Subiendo...' : 'Usar esta foto →'}
        </button>
        <button onClick={onRetake}
          className="w-full py-3 text-gray-500 flex items-center justify-center gap-2 text-sm">
          <RotateCcw size={15} /> Tomar de nuevo
        </button>
      </div>
    </div>
  )

  // ── FRONT ──────────────────────────────────────────────────
  if (step === 'front_camera') return (
    <CameraScreen
      title="Frente CI" subtitle='Coloca el frente de tu documento dentro del marco'
      stepNum={1} inputRef={frontInputRef} onCapture={handleCapture('front')}
    />
  )

  if (step === 'front_preview' && frontImage) return (
    <PreviewScreen
      image={frontImage} title="Verifica que el documento sea legible"
      stepNum={1} uploading={uploading}
      checks={['El texto es legible', 'Se ven los 4 bordes', 'Sin reflejos ni sombras']}
      onUse={() => upload('front', frontFile!, 'back_camera')}
      onRetake={() => { setFrontImage(null); setStep('front_camera') }}
    />
  )

  // ── BACK ───────────────────────────────────────────────────
  if (step === 'back_camera') return (
    <CameraScreen
      title="Dorso CI" subtitle='Fotografía la parte trasera con el código de barras visible'
      stepNum={2} inputRef={backInputRef} onCapture={handleCapture('back')}
    />
  )

  if (step === 'back_preview' && backImage) return (
    <PreviewScreen
      image={backImage} title="Verifica que el código de barras sea visible"
      stepNum={2} uploading={uploading}
      checks={['Código de barras visible', 'Se ven los 4 bordes', 'Sin reflejos en el código']}
      onUse={() => upload('back', backFile!, 'selfie_camera')}
      onRetake={() => { setBackImage(null); setStep('back_camera') }}
    />
  )

  // ── SELFIE ─────────────────────────────────────────────────
  if (step === 'selfie_camera') return (
    <CameraScreen
      title="Selfie" subtitle='Mira directo a la cámara frontal. Tu cara debe estar clara y centrada'
      stepNum={3} isSelfie inputRef={selfieInputRef} onCapture={handleCapture('selfie')}
    />
  )

  if (step === 'selfie_preview' && selfieImage) return (
    <PreviewScreen
      image={selfieImage} title="Verifica que tu cara sea visible"
      stepNum={3} uploading={uploading} isSelfie
      checks={['Tu cara está centrada y completa', 'Buena iluminación, sin sombras', 'Ojos abiertos mirando a la cámara']}
      onUse={() => upload('selfie', selfieFile!, 'done')}
      onRetake={() => { setSelfieImage(null); setStep('selfie_camera') }}
    />
  )

  return null
}
