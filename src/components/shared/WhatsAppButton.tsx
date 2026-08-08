'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { WHATSAPP_SOPORTE } from '@/lib/constants'

const MENSAJE_DEFAULT = 'Hola! Necesito ayuda con mi cuenta en Trapping.'

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false)

  const whatsappUrl = `https://wa.me/${WHATSAPP_SOPORTE.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(MENSAJE_DEFAULT)}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 lg:bottom-8 lg:right-8">
      {/* Tooltip / Mensaje */}
      {showTooltip && (
        <div className="animate-fade-up bg-white rounded-2xl shadow-lg border border-gray-100 p-4 max-w-[260px]">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-semibold text-gray-900">¿Necesitas ayuda?</p>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Nuestro equipo te atiende por WhatsApp. Respuesta rápida en horario laboral.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <MessageCircle size={16} />
            Escribir por WhatsApp
          </a>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="group relative w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={24} className="text-white" fill="white" strokeWidth={0} />

        {/* Ping animation */}
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full animate-ping opacity-75" />
      </button>
    </div>
  )
}
