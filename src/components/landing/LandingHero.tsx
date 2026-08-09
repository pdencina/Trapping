'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import TypewriterText from './TypewriterText'

const ROTATING_PHRASES = [
  'rápido y seguro',
  'sin complicaciones',
  'a tu familia',
  'con mejor tasa',
  'en minutos',
]

export default function LandingHero() {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden min-h-[80vh] sm:min-h-[85vh] flex items-center">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white" />

      {/* Decorative orbs — hidden on very small screens for performance */}
      <motion.div
        className="hidden sm:block absolute top-20 left-[10%] w-72 h-72 bg-brand-200/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="hidden sm:block absolute top-40 right-[5%] w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-5xl mx-auto w-full text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-brand-700 text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-10 border border-brand-100 shadow-sm"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="hidden xs:inline">Plataforma activa —</span> Envíos desde Chile
        </motion.div>

        {/* Heading con typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-5 sm:mb-6"
        >
          {/* Línea 1: texto estático */}
          <h1 className="text-[1.75rem] xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Envía dinero al exterior
          </h1>

          {/* Línea 2: frase que rota con typewriter */}
          <div className="min-h-[1.3em] mt-2 sm:mt-3 text-[1.75rem] xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-600 leading-tight tracking-tight">
            <TypewriterText
              words={ROTATING_PHRASES}
              typeSpeed={80}
              deleteSpeed={40}
              pauseTime={2000}
            />
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-sm sm:text-base md:text-lg text-gray-500 max-w-md sm:max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2"
        >
          Conectamos a la comunidad inmigrante en Chile con sus seres queridos.
          Transferencias simples, seguras y con soporte humano.
        </motion.p>

        {/* Países donde operamos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 flex-wrap px-2"
        >
          <span className="text-[11px] sm:text-xs text-gray-400 font-medium">Destinos:</span>
          {[
            { flag: '🇻🇪', name: 'Venezuela' },
            { flag: '🇨🇴', name: 'Colombia' },
            { flag: '🇪🇸', name: 'España' },
          ].map(({ flag, name }) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-white border border-gray-200 text-gray-700 text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm"
            >
              <span className="text-sm">{flag}</span>
              <span className="hidden xs:inline">{name}</span>
              <span className="xs:hidden">{name.slice(0, 3)}</span>
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0"
        >
          <Link
            href="/register"
            className="group btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Empezar ahora — es gratis
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 w-full sm:w-auto text-center">
            Ya tengo cuenta
          </Link>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400"
        >
          {[
            { icon: Shield, text: '100% seguro' },
            { icon: Zap, text: 'Acreditación < 24h' },
            { icon: Globe, text: 'Sin costo de registro' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon size={14} className="text-brand-400" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
