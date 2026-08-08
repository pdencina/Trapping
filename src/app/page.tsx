// src/app/page.tsx — Landing page pública con animaciones Motion
import Link from 'next/link'
import type { Metadata } from 'next'
import LandingHero from '@/components/landing/LandingHero'
import LandingCalculator from '@/components/landing/LandingCalculator'
import LandingStats from '@/components/landing/LandingStats'
import LandingFeatures from '@/components/landing/LandingFeatures'
import LandingSteps from '@/components/landing/LandingSteps'
import LandingFAQ from '@/components/landing/LandingFAQ'

export const metadata: Metadata = {
  title: 'Trapping | Envía dinero al exterior fácil y seguro',
  description: 'Plataforma chilena de envío de remesas a Venezuela, Colombia, España y más. Rápido, seguro y con las mejores tasas.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-extrabold text-gray-900 text-lg tracking-tight">trapping</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
              Registrarme gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — Animaciones word-by-word con spring physics */}
      <LandingHero />

      {/* CALCULADORA */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
                Simula tu envío en segundos
              </h2>
              <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                Ingresa el monto que quieres enviar y ve cuánto recibirá tu destinatario.
                Tasas actualizadas en tiempo real.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Tasas en vivo
                </span>
                <span>·</span>
                <span>Sin registro previo</span>
                <span>·</span>
                <span>Comisión transparente</span>
              </div>
            </div>
            <LandingCalculator />
          </div>
        </div>
      </section>

      {/* STATS — Counters animados */}
      <LandingStats />

      {/* FEATURES — Cards con hover animation */}
      <LandingFeatures />

      {/* STEPS — Entrada secuencial con delay */}
      <LandingSteps />

      {/* TRUST BANNER */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
            Tu familia está esperando.<br className="hidden sm:block" />
            Nosotros hacemos que llegue.
          </h2>
          <p className="text-brand-200 mb-10 text-lg max-w-2xl mx-auto">
            Únete a miles de familias que confían en Trapping para enviar dinero al exterior.
            Cercano, seguro y sin vueltas.
          </p>
          <Link href="/register" className="inline-block bg-white text-brand-700 font-bold px-10 py-4 rounded-xl hover:bg-brand-50 transition-all hover:scale-105 text-base shadow-lg shadow-brand-900/20">
            Registrarme gratis →
          </Link>
        </div>
      </section>

      {/* FAQ — Accordion animado */}
      <LandingFAQ />

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-12 px-4 sm:px-6 bg-gray-50/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="font-bold text-gray-700">trapping</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 Trapping. Plataforma chilena de remesas internacionales.</p>
          <div className="flex gap-6 text-xs text-gray-400">
            <Link href="/login" className="hover:text-brand-600 transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-brand-600 transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
