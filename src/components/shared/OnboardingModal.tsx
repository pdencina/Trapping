'use client'

import { useState, useEffect } from 'react'
import { ArrowRightLeft, Users, Wallet, MessageCircle, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'trapping_onboarding_done'

const steps = [
  {
    icon: Sparkles,
    title: '¡Bienvenido a Trapping!',
    description: 'Tu plataforma para enviar dinero al exterior de forma rápida y segura. Te explicamos cómo funciona en 4 pasos.',
    color: 'bg-brand-100 text-brand-600',
  },
  {
    icon: ArrowRightLeft,
    title: 'Envía dinero fácilmente',
    description: 'Desde la sección "Transferir" puedes enviar dinero a Venezuela, Colombia y España. Solo elige el monto, destinatario y confirma.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Users,
    title: 'Gestiona tus contactos',
    description: 'Agrega destinatarios con su cuenta bancaria una sola vez. Después solo seleccionas y listo, sin repetir datos.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Wallet,
    title: 'Tu billetera Trapping',
    description: 'Recarga saldo en tu billetera para enviar más rápido sin tener que subir comprobante cada vez. Es como tener saldo prepago.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: MessageCircle,
    title: 'Soporte cercano',
    description: 'Si tienes dudas, escríbenos por WhatsApp. Nuestro equipo te atiende personalmente. El botón verde está siempre visible.',
    color: 'bg-emerald-100 text-emerald-600',
  },
]

export default function OnboardingModal() {
  const [show, setShow] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Solo mostrar si no se ha completado antes
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      // Pequeño delay para no competir con el render inicial
      const timer = setTimeout(() => setShow(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShow(false)
  }

  const next = () => {
    if (currentStep === steps.length - 1) {
      dismiss()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  if (!show) return null

  const step = steps[currentStep]
  const Icon = step.icon
  const isLast = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={dismiss} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Botón cerrar */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Contenido */}
        <div className="p-8 pt-6 text-center">
          {/* Indicador de progreso */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-6 bg-brand-600' : i < currentStep ? 'w-1.5 bg-brand-300' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Icono */}
          <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-5`}>
            <Icon size={28} />
          </div>

          {/* Texto */}
          <h2 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
        </div>

        {/* Footer con botones */}
        <div className="px-8 pb-8 flex items-center gap-3">
          {currentStep > 0 ? (
            <button
              onClick={prev}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2"
            >
              Omitir
            </button>
          )}

          <button
            onClick={next}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isLast ? '¡Empezar!' : 'Siguiente'}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
