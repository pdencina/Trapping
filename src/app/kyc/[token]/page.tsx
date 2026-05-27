'use client'
// src/app/kyc/[token]/page.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, Camera, RotateCcw, Upload, ChevronRight, Shield } from 'lucide-react'

type Step = 'intro' | 'front_camera' | 'front_preview' | 'back_camera' | 'back_preview' | 'uploading' | 'done' | 'error'

export default function KYCMobilePage({ params }: { params: { token: string } }) {
  const { token } = params
  const [step, setStep] = useState<Step>('intro')
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  // Verificar que el token es válido via API
  useEffect(() => {
    const check = async () => {
      const res = await fetch(`/api/kyc/check?token=${token}`)
      if (!res.ok) { setStep('error'); setError('Sesión no encontrada o inválida'); return }
      const data = await res.json()
      if (data.expired) { setStep('error'); setError('Esta sesión ha expirado. Genera un nuevo QR desde tu computador.'); return }
      if (data.status === 'completed') { setStep('done'); return }
      setSessionData(data)
    }
    check()
  }, [token])

  const handleCapture = useCallback((side: 'front' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      if (side === 'front') {
        setFrontImage(result)
        setFrontFile(file)
        setStep('front_preview')
      } else {
        setBackImage(result)
        setBackFile(file)
        setStep('back_preview')
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const uploadFront = async () => {
    if (!frontFile || !sessionData) return
    setUploading(true)

    const fd = new FormData()
    fd.append('token', token)
    fd.append('side', 'front')
    fd.append('file', frontFile)

    const res = await fetch('/api/kyc/upload', { method: 'POST', body: fd })
    const json = await res.json()

    if (!res.ok) { setError(json.error ?? 'Error subiendo foto'); setUploading(false); return }

    setUploading(false)
    setStep('back_camera')
  }

  const uploadBack = async () => {
    if (!backFile || !sessionData) return
    setUploading(true)

    const fd = new FormData()
    fd.append('token', token)
    fd.append('side', 'back')
    fd.append('file', backFile)

    const res = await fetch('/api/kyc/upload', { method: 'POST', body: fd })
    const json = await res.json()

    if (!res.ok) { setError(json.error ?? 'Error subiendo foto'); setUploading(false); return }

    setUploading(false)
    setStep('done')
  }

  // ── INTRO ──────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-6 py-10">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-gray-900">Trapping</span>
        </div>

        <div className="flex-1">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-6">
            <Shield size={28} className="text-brand-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Verificación de identidad
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Necesitamos fotografiar tu documento de identidad para verificar tu cuenta. El proceso toma menos de 2 minutos.
          </p>

          <div className="space-y-4 mb-10">
            {[
              { n: '1', title: 'Foto del frente', desc: 'Fotografía la parte frontal de tu CI o pasaporte' },
              { n: '2', title: 'Foto del dorso', desc: 'Fotografía la parte trasera con el código de barras' },
              { n: '3', title: 'Listo', desc: 'Revisamos tu identidad y activamos tu cuenta' },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  {s.n}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{s.title}</p>
                  <p className="text-sm text-gray-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-8">
            <p className="text-xs text-amber-700 font-medium mb-1">📋 Ten a mano tu documento</p>
            <p className="text-xs text-amber-600">
              Asegúrate de tener buena iluminación y que el documento esté completo y sin reflejos.
            </p>
          </div>
        </div>

        <button
          onClick={() => setStep('front_camera')}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
        >
          Comenzar <ChevronRight size={18} />
        </button>
      </div>
    )
  }

  // ── FRONT CAMERA ──────────────────────────────────────────
  if (step === 'front_camera') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col px-6 py-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-white">Frente del documento</span>
        </div>

        {/* Marco guía */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-xs">
            <div className="aspect-[1.58/1] border-4 border-white/30 rounded-2xl flex items-center justify-center bg-gray-800/50 mb-6">
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                {/* Esquinas del marco */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-brand-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-brand-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-brand-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-brand-400 rounded-br-xl" />
              </div>
              <Camera size={40} className="text-white/30" />
            </div>
          </div>

          <p className="text-white/70 text-sm text-center mb-2">
            Coloca el <strong className="text-white">frente</strong> de tu documento dentro del marco
          </p>
          <p className="text-white/40 text-xs text-center mb-10">
            Asegúrate de que sea visible tu nombre y foto
          </p>
        </div>

        {/* Botón capturar */}
        <input
          ref={frontInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCapture('front')}
        />
        <button
          onClick={() => frontInputRef.current?.click()}
          className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 text-base"
        >
          <Camera size={22} />
          Tomar foto del frente
        </button>
      </div>
    )
  }

  // ── FRONT PREVIEW ─────────────────────────────────────────
  if (step === 'front_preview') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-6 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">¿Se ve bien?</h2>
        <p className="text-gray-500 text-sm mb-6">Verifica que el documento sea legible y esté completo.</p>

        {frontImage && (
          <img src={frontImage} alt="Frente CI" className="w-full rounded-2xl shadow-lg mb-6 border border-gray-100" />
        )}

        <div className="bg-gray-50 rounded-xl p-4 mb-8 space-y-2">
          {['El texto es legible', 'Se ven los 4 bordes del documento', 'Sin reflejos ni sombras'].map(t => (
            <div key={t} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              {t}
            </div>
          ))}
        </div>

        <div className="space-y-3 mt-auto">
          <button
            onClick={uploadFront}
            disabled={uploading}
            className="btn-primary w-full py-4 text-base"
          >
            {uploading ? 'Subiendo...' : 'Usar esta foto →'}
          </button>
          <button
            onClick={() => { setFrontImage(null); setStep('front_camera') }}
            className="w-full py-3 text-gray-500 flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw size={16} /> Tomar de nuevo
          </button>
        </div>
      </div>
    )
  }

  // ── BACK CAMERA ───────────────────────────────────────────
  if (step === 'back_camera') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col px-6 py-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-white">Dorso del documento</span>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-green-400 text-xs">Frente ✓</span>
          </div>
          <div className="flex-1 h-px bg-white/20" />
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            <span className="text-brand-300 text-xs">Dorso</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-xs">
            <div className="aspect-[1.58/1] border-4 border-white/30 rounded-2xl flex items-center justify-center bg-gray-800/50 mb-6">
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-brand-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-brand-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-brand-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-brand-400 rounded-br-xl" />
              </div>
              <div className="text-center">
                <Camera size={40} className="text-white/30 mx-auto mb-2" />
                <div className="w-16 h-1 bg-white/20 rounded mx-auto mb-1" />
                <div className="w-10 h-1 bg-white/20 rounded mx-auto" />
              </div>
            </div>
          </div>
          <p className="text-white/70 text-sm text-center mb-2">
            Ahora fotografía el <strong className="text-white">dorso</strong>
          </p>
          <p className="text-white/40 text-xs text-center mb-10">
            El código de barras debe ser visible
          </p>
        </div>

        <input
          ref={backInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCapture('back')}
        />
        <button
          onClick={() => backInputRef.current?.click()}
          className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 text-base"
        >
          <Camera size={22} />
          Tomar foto del dorso
        </button>
      </div>
    )
  }

  // ── BACK PREVIEW ──────────────────────────────────────────
  if (step === 'back_preview') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-6 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">¿Se ve el dorso?</h2>
        <p className="text-gray-500 text-sm mb-6">Verifica que el código de barras sea visible.</p>

        {backImage && (
          <img src={backImage} alt="Dorso CI" className="w-full rounded-2xl shadow-lg mb-6 border border-gray-100" />
        )}

        <div className="bg-gray-50 rounded-xl p-4 mb-8 space-y-2">
          {['Código de barras visible', 'Se ven los 4 bordes del documento', 'Sin reflejos en el código'].map(t => (
            <div key={t} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              {t}
            </div>
          ))}
        </div>

        <div className="space-y-3 mt-auto">
          <button
            onClick={uploadBack}
            disabled={uploading}
            className="btn-primary w-full py-4 text-base"
          >
            {uploading ? 'Enviando documentos...' : 'Enviar documentos ✓'}
          </button>
          <button
            onClick={() => { setBackImage(null); setStep('back_camera') }}
            className="w-full py-3 text-gray-500 flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw size={16} /> Tomar de nuevo
          </button>
        </div>
      </div>
    )
  }

  // ── DONE ──────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">¡Listo!</h1>
        <p className="text-gray-500 mb-2">
          Tus documentos fueron enviados correctamente.
        </p>
        <p className="text-gray-400 text-sm">
          Nuestro equipo revisará tu identidad y activará tu cuenta pronto. Puedes cerrar esta ventana.
        </p>

        <div className="mt-10 bg-brand-50 rounded-2xl p-5 w-full max-w-xs">
          <p className="text-xs text-brand-700 font-medium">¿Qué sigue?</p>
          <p className="text-xs text-brand-600 mt-1">
            Recibirás un email cuando tu cuenta sea activada. El proceso toma menos de 24 horas.
          </p>
        </div>
      </div>
    )
  }

  // ── ERROR ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Sesión inválida</h2>
      <p className="text-gray-500 text-sm">{error ?? 'Este enlace no es válido o ha expirado.'}</p>
      <p className="text-gray-400 text-xs mt-4">Genera un nuevo QR desde tu computador para continuar.</p>
    </div>
  )
}
