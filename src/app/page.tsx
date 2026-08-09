// src/app/page.tsx — Landing page pública con animaciones Motion
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import LandingNavbar from '@/components/landing/LandingNavbar'
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

export default async function LandingPage() {
  // Cargar tasas desde server (no necesita auth del usuario)
  const supabase = createClient()
  const { data: tasasData } = await supabase
    .from('tasas')
    .select('id, moneda_origen, moneda_destino, valor, monto_minimo, monto_maximo')
    .eq('activo', true)
    .eq('moneda_origen', 'CLP')
    .is('deleted_at', null)

  const tasas = (tasasData ?? []) as { id: number; moneda_origen: string; moneda_destino: string; valor: number; monto_minimo: number; monto_maximo: number }[]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* NAV — Responsive con hamburger en móvil */}
      <LandingNavbar />

      {/* HERO */}
      <LandingHero />

      {/* CALCULADORA */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4">
                Simula tu envío en segundos
              </h2>
              <p className="text-gray-500 text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed max-w-md mx-auto lg:mx-0">
                Ingresa el monto que quieres enviar y ve cuánto recibirá tu destinatario.
                Tasas actualizadas en tiempo real.
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Tasas en vivo
                </span>
                <span className="hidden xs:inline">·</span>
                <span>Sin registro</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">Comisión transparente</span>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <LandingCalculator tasas={tasas} />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <LandingStats />

      {/* FEATURES */}
      <LandingFeatures />

      {/* STEPS */}
      <LandingSteps />

      {/* TRUST BANNER */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-2">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white mb-4 sm:mb-5 leading-tight">
            Tu familia está esperando.{' '}
            <span className="block sm:inline">Nosotros hacemos que llegue.</span>
          </h2>
          <p className="text-brand-200 mb-8 sm:mb-10 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Únete a miles de familias que confían en Trapping para enviar dinero al exterior.
            Cercano, seguro y sin vueltas.
          </p>
          <Link href="/register" className="inline-block bg-white text-brand-700 font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl hover:bg-brand-50 transition-all hover:scale-105 text-sm sm:text-base shadow-lg shadow-brand-900/20">
            Registrarme gratis →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <LandingFAQ />

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 sm:py-12 px-4 sm:px-6 bg-gray-50/50">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 sm:gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="font-bold text-gray-700">trapping</span>
          </div>
          <p className="text-xs text-gray-400 text-center">© 2025 Trapping. Plataforma chilena de remesas.</p>
          <div className="flex gap-6 text-xs text-gray-400">
            <Link href="/login" className="hover:text-brand-600 transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-brand-600 transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
