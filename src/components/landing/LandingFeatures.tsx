'use client'

import { AnimatedSection, AnimatedCard } from './AnimatedSection'
import { Shield, Zap, DollarSign, Globe, Smartphone, MessageCircle } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Seguro y regulado',
    desc: 'Operamos bajo la normativa chilena. Tus datos y tu dinero siempre protegidos.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'Transferencias rápidas',
    desc: 'La mayoría de las transferencias se acreditan en menos de 24 horas.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: DollarSign,
    title: 'Tasas competitivas',
    desc: 'Revisamos las tasas diariamente para que siempre obtengas el mejor valor.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Globe,
    title: 'Venezuela, Colombia y España',
    desc: 'Envía a los destinos que más necesitas. Transferencia bancaria o retiro en efectivo.',
    color: 'text-brand-600',
    bg: 'bg-brand-50',
  },
  {
    icon: Smartphone,
    title: 'Fácil desde el celular',
    desc: 'Proceso de 4 pasos optimizado para móvil. Sin papeleos ni filas.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: MessageCircle,
    title: 'Soporte por WhatsApp',
    desc: 'Un equipo real te atiende. Respuesta rápida y cercana, como debe ser.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
]

export default function LandingFeatures() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-10 sm:mb-16 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4">
            ¿Por qué elegir Trapping?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base sm:text-lg">
            Construida pensando en familias que necesitan enviar dinero de forma simple y confiable.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <AnimatedCard key={f.title} index={i} className="card p-5 sm:p-7 group cursor-default">
              <div className={`w-10 sm:w-12 h-10 sm:h-12 ${f.bg} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform`}>
                <f.icon size={20} className={f.color} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5 sm:mb-2 text-base sm:text-lg">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  )
}
