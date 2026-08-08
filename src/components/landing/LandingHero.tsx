'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'

export default function LandingHero() {
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">
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

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-brand-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-brand-100 shadow-sm"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Plataforma activa — Envíos a Venezuela, Colombia y España
        </motion.div>

        {/* Heading con animación word-by-word */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-gray-900 mb-6">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block"
          >
            Envía dinero{' '}
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-block"
          >
            a tu{' '}
          </motion.span>

          <motion.span
            className="text-brand-600 inline-block"
            initial={{ opacity: 0, scale: 0.8, rotateX: 40 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.7, delay: 0.6, type: 'spring', stiffness: 100 }}
          >
            familia
          </motion.span>

          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
            className="inline-block"
          >
            ,
          </motion.span>

          <br className="hidden sm:block" />

          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="inline-block"
          >
            {' '}sin{' '}
          </motion.span>

          <motion.span
            className="text-brand-600 inline-block"
            initial={{ opacity: 0, scale: 0.8, rotateX: 40 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.7, delay: 1.2, type: 'spring', stiffness: 100 }}
          >
            complicaciones
          </motion.span>

          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
            className="inline-block"
          >
            .
          </motion.span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Conectamos a la comunidad inmigrante en Chile con sus seres queridos.
          Transferencias rápidas, tasas justas y soporte cercano.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.9 }}
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
          transition={{ delay: 2.2, duration: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
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
