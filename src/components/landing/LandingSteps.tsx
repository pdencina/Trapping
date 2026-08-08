'use client'

import { AnimatedSection, AnimatedCard } from './AnimatedSection'
import { motion } from 'motion/react'
import { useRef } from 'react'
import { useInView } from 'motion/react'
import Link from 'next/link'
import { UserPlus, ScanFace, Users, Send } from 'lucide-react'

const steps = [
  { icon: UserPlus, title: 'Crea tu cuenta', desc: 'Regístrate en minutos con tu RUT y correo.', color: 'bg-brand-600' },
  { icon: ScanFace, title: 'Valida tu identidad', desc: 'Sube tu documento desde el celular. Solo una vez.', color: 'bg-purple-600' },
  { icon: Users, title: 'Elige destinatario', desc: 'Agrega la cuenta bancaria de quien recibirá.', color: 'bg-blue-600' },
  { icon: Send, title: 'Confirma y listo', desc: 'Deposita y nosotros hacemos el resto. Te notificamos.', color: 'bg-green-600' },
]

export default function LandingSteps() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-24 px-4 sm:px-6 bg-gray-50/50" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Cómo funciona
          </h2>
          <p className="text-gray-500 text-lg">
            En 4 simples pasos, tu dinero llega a donde lo necesitas.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              <div className="card p-6 text-center h-full">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ delay: i * 0.15 + 0.3, type: 'spring', stiffness: 200 }}
                  className={`w-12 h-12 ${s.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  <s.icon size={22} />
                </motion.div>
                <div className="text-xs font-bold text-brand-600 mb-2">PASO {i + 1}</div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>

              {/* Connector arrow */}
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: i * 0.15 + 0.5 }}
                  className="hidden lg:block absolute top-1/2 -right-3 text-brand-300 text-xl z-10"
                >
                  →
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <AnimatedSection delay={0.8} className="text-center mt-12">
          <Link href="/register" className="btn-primary text-base px-10 py-3.5">
            Comenzar ahora
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}
