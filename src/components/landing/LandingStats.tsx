'use client'

import { AnimatedCounter } from './AnimatedSection'

const stats = [
  { value: '+5.000', label: 'transacciones exitosas' },
  { value: '99.8%', label: 'tasa de éxito' },
  { value: '< 24h', label: 'tiempo de acreditación' },
  { value: '3', label: 'países destino' },
]

export default function LandingStats() {
  return (
    <section className="py-10 sm:py-14 bg-brand-600 relative overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
          {stats.map((s) => (
            <AnimatedCounter key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  )
}
