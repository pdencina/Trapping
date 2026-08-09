'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

const faqs = [
  {
    q: '¿Cuánto demora en llegar el dinero?',
    a: 'La mayoría de las transferencias se procesan en menos de 24 horas hábiles una vez que confirmamos tu pago.',
  },
  {
    q: '¿Necesito cuenta bancaria en Chile?',
    a: 'Sí, necesitas una cuenta bancaria chilena para realizar la transferencia de pago a Trapping.',
  },
  {
    q: '¿Cuáles son los montos mínimos y máximos?',
    a: 'Los montos varían según el corredor. Puedes ver los límites exactos en nuestra calculadora antes de registrarte.',
  },
  {
    q: '¿Cómo sé que mi dinero llegó?',
    a: 'Te notificamos por email, WhatsApp y en tu panel cuando la operación se marca como completada.',
  },
  {
    q: '¿Es seguro usar Trapping?',
    a: 'Sí. Usamos encriptación de datos, validación de identidad KYC y monitoreo antifraude. Tu dinero siempre está protegido.',
  },
]

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-50/50 transition-colors"
      >
        <h3 className="font-semibold text-gray-900 pr-4 text-sm sm:text-base">{q}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={18} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-sm text-gray-500 leading-relaxed px-4 sm:px-6 pb-4 sm:pb-6">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <AnimatedSection className="text-center mb-10 sm:mb-14 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-gray-500 text-base sm:text-lg">Todo lo que necesitas saber antes de empezar.</p>
        </AnimatedSection>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FAQItem
              key={f.q}
              q={f.q}
              a={f.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
