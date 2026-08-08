'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import TypewriterText from './TypewriterText'

const ROTATING_WORDS = [
  'VENEZUELA',
  'COLOMBIA',
  'ESPAÑA',
]

export default function LandingHero() {
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden min-h-[85vh] flex items-center">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white" />

      {/* Decorative orbs */}
      <motion.div
        className="absolute top-20 left-[10%] w-72 h-72 bg-brand-200/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-40 right-[5%] w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-5xl mx-auto w-full text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-brand-700 text-xs font-semibold px-4 py-2 rounded-full mb-10 border border-brand-100 shadow-sm"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Plataforma activa — Envíos desde Chile
        </motion.div>

        {/* Heading con typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          {/* Línea 1: texto estático */}
          <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            TU CUENTA PARA ENVIAR A
          </p>

          {/* Línea 2: palabra que rota con typewriter */}
          <div className="h-[1.3em] mt-2 text-5xl sm:text-6xl lg:text-7xl font-black text-brand-600 leading-none tracking-tight">
            <TypewriterText
              words={ROTATING_WORDS}
              typeSpeed={100}
              deleteSpeed={60}
              pauseTime={2500}
            />
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Mueve tu dinero por el mundo sin comisiones ocultas ni complicaciones.
          Rápido, seguro y cercano a tu familia.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/register"
            className="group btn-primary text-base px-8 py-3.5 flex items-center gap-2"
          >
            Empezar ahora — es gratis
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="btn-secondary text-base px-8 py-3.5">
            Ya tengo cuenta
          </Link>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
        >
          {[
            { icon: Shield, text: '100% seguro' },
            { icon: Zap, text: 'Acreditación < 24h' },
            { icon: Globe, text: '3 países destino' },
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
