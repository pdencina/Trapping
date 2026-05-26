'use client'
// src/app/(auth)/register/kyc/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { crearSesionKYC } from '@/lib/actions/kyc'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Smartphone, RefreshCw, Shield } from 'lucide-react'
import Image from 'next/image'

export default function KYCPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'waiting' | 'front_done' | 'back_done' | 'completed' | 'error'>('loading')
  const [isMobile, setIsMobile] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1800) // 30 min en segundos

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  // Iniciar sesión KYC
  useEffect(() => {
    const init = async () => {
      const result = await crearSesionKYC()
      if ('error' in result) { setStatus('error'); return }

      setToken(result.token)

      // Generar QR como data URL
      const QRCode = (await import('qrcode')).default
      const kycUrl = `${window.location.origin}/kyc/${result.token}`
      const qr = await QRCode.toDataURL(kycUrl, {
        width: 280,
        margin: 2,
        color: { dark: '#4c1d95', light: '#ffffff' },
      })
      setQrUrl(qr)
      setStatus('waiting')

      // Si estamos en móvil, redirigir directo al flujo
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        router.push(`/kyc/${result.token}`)
      }
    }
    init()
  }, [router])

  // Polling para detectar cuando el móvil completó las fotos
  const poll = useCallback(async () => {
    if (!token) return
    const supabase = createClient()
    const { data } = await supabase
      .from('kyc_sessions')
      .select('status')
      .eq('token', token)
      .single()

    if (data?.status === 'completed') {
      setStatus('completed')
      setTimeout(() => router.push('/verify-email'), 2000)
    } else if (data?.status === 'back_done') {
      setStatus('back_done')
    } else if (data?.status === 'front_done') {
      setStatus('front_done')
    }
  }, [token, router])

  useEffect(() => {
    if (!token || status === 'completed' || status === 'loading') return
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [token, status, poll])

  // Countdown
  useEffect(() => {
    if (status !== 'waiting' && status !== 'front_done' && status !== 'back_done') return
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(interval)
  }, [status])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  const stepStatusMap: Record<string, {front: string; back: string}> = {
    waiting: { front: 'pending', back: 'pending' },
    front_done: { front: 'done', back: 'pending' },
    back_done: { front: 'done', back: 'done' },
    completed: { front: 'done', back: 'done' },
  }
  const stepStatus = stepStatusMap[status] ?? { front: 'pending', back: 'pending' }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Generando tu sesión segura...</p>
        </div>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Documentos enviados!</h2>
          <p className="text-gray-500 text-sm">Nuestro equipo revisará tu identidad. Te notificaremos pronto.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Trapping</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verificación de identidad</h1>
          <p className="text-gray-500 text-sm mt-1">Paso 2 de 3 — Documentos de identidad</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* QR / Instrucciones */}
          <div className="card p-8 text-center">
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone size={24} className="text-brand-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-lg mb-2">Continúa desde tu celular</h2>
            <p className="text-sm text-gray-500 mb-6">
              Escanea el QR con la cámara de tu celular para tomar las fotos de tu documento de identidad.
            </p>

            {qrUrl ? (
              <div className="inline-block p-4 bg-white rounded-2xl shadow-md border border-gray-100 mb-4">
                <img src={qrUrl} alt="QR KYC" className="w-52 h-52" />
              </div>
            ) : (
              <div className="w-52 h-52 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <RefreshCw size={24} className="text-gray-400 animate-spin" />
              </div>
            )}

            <p className="text-xs text-gray-400">
              Expira en <span className="font-mono font-semibold text-brand-600">
                {mins}:{secs.toString().padStart(2, '0')}
              </span>
            </p>

            {/* Link directo para móvil */}
            {token && (
              <a href={`/kyc/${token}`}
                className="text-xs text-brand-600 hover:text-brand-700 mt-3 block underline">
                ¿Ya estás en tu celular? Toca aquí
              </a>
            )}
          </div>

          {/* Estado del proceso */}
          <div className="space-y-4">
            {/* Progress */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Progreso de verificación</h3>
              <div className="space-y-4">
                {[
                  { key: 'front', label: 'Frente del documento', desc: 'Foto clara del frente de tu CI o pasaporte' },
                  { key: 'back',  label: 'Dorso del documento',  desc: 'Foto clara del dorso con el código de barras' },
                ].map(step => (
                  <div key={step.key} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      stepStatus[step.key as 'front' | 'back'] === 'done'
                        ? 'bg-green-500'
                        : status === 'waiting' && step.key === 'front'
                        ? 'bg-brand-600 animate-pulse'
                        : status === 'front_done' && step.key === 'back'
                        ? 'bg-brand-600 animate-pulse'
                        : 'bg-gray-200'
                    }`}>
                      {stepStatus[step.key as 'front' | 'back'] === 'done'
                        ? <CheckCircle2 size={20} className="text-white" />
                        : <span className="text-white text-sm font-bold">{step.key === 'front' ? '1' : '2'}</span>
                      }
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${stepStatus[step.key as 'front' | 'back'] === 'done' ? 'text-green-700' : 'text-gray-700'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Estado actual */}
              <div className={`mt-5 rounded-xl p-3 text-sm text-center font-medium ${
                (status as string) === 'completed' ? 'bg-green-50 text-green-700' :
                status === 'back_done' ? 'bg-blue-50 text-blue-700' :
                status === 'front_done' ? 'bg-amber-50 text-amber-700' :
                'bg-gray-50 text-gray-500'
              }`}>
                {status === 'waiting' && '⏳ Esperando que escanees el QR...'}
                {status === 'front_done' && '✓ Frente capturado — ahora toma el dorso'}
                {status === 'back_done' && '✓ Ambas fotos listas — confirmando...'}
                {(status as string) === 'completed' && '✅ ¡Verificación completada!'}
              </div>
            </div>

            {/* Tips */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-brand-600" />
                <h3 className="font-semibold text-gray-900 text-sm">Consejos para mejores fotos</h3>
              </div>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                  Buena iluminación, sin reflejos ni sombras
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                  Documento completo visible, sin cortes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                  Imagen nítida, sin desenfoque
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold flex-shrink-0">✗</span>
                  No uses fotocopias ni imágenes de pantalla
                </li>
              </ul>
            </div>

            {/* Saltar por ahora */}
            <div className="text-center">
              <a href="/verify-email" className="text-xs text-gray-400 hover:text-gray-600 underline">
                Completar más tarde
              </a>
              <p className="text-xs text-gray-300 mt-1">Podrás enviarlo desde tu perfil</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
