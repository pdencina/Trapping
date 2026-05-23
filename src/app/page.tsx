// src/app/page.tsx — Landing page pública
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trapping | Envía dinero al exterior fácil y seguro',
  description: 'Plataforma chilena de envío de remesas a Venezuela, Colombia y más. Rápido, seguro y con las mejores tasas.',
}

const stats = [
  { value: '+5.000', label: 'transacciones exitosas' },
  { value: '99.8%', label: 'tasa de éxito' },
  { value: '< 24h', label: 'tiempo de acreditación' },
  { value: '3', label: 'países destino' },
]

const features = [
  {
    icon: '🔒',
    title: 'Seguro y regulado',
    desc: 'Operamos bajo la normativa chilena. Tus datos y tu dinero siempre protegidos.',
  },
  {
    icon: '⚡',
    title: 'Transferencias rápidas',
    desc: 'La mayoría de las transferencias se acreditan en menos de 24 horas.',
  },
  {
    icon: '💰',
    title: 'Tasas competitivas',
    desc: 'Revisamos las tasas diariamente para que siempre obtengas el mejor valor.',
  },
  {
    icon: '🌎',
    title: 'Varios destinos',
    desc: 'Envía a Venezuela, Colombia, Perú y más países de América Latina.',
  },
  {
    icon: '📱',
    title: 'Fácil de usar',
    desc: 'Proceso de 4 pasos. Sin papeleos innecesarios ni filas.',
  },
  {
    icon: '🤝',
    title: 'Soporte humano',
    desc: 'Un equipo real te atiende por WhatsApp ante cualquier consulta.',
  },
]

const steps = [
  { n: '1', title: 'Crea tu cuenta', desc: 'Regístrate en minutos con tu RUT y correo.' },
  { n: '2', title: 'Valida tu identidad', desc: 'Sube tu documento. Solo la primera vez.' },
  { n: '3', title: 'Elige destinatario', desc: 'Agrega la cuenta bancaria de quien recibirá.' },
  { n: '4', title: 'Confirma y listo', desc: 'Deposita y sube tu comprobante. Nosotros hacemos el resto.' },
]

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
    a: 'Te notificamos por email y en tu panel cuando la operación se marca como completada.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Trapping</span>
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

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span>
                Plataforma chilena de remesas
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Envía dinero al exterior{' '}
                <span className="text-brand-600">rápido y seguro</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Conectamos a la comunidad inmigrante en Chile con sus familias en Venezuela, Colombia y más países. Sin complicaciones, con las mejores tasas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="btn-primary text-center text-base px-8 py-3">
                  Empezar ahora — es gratis
                </Link>
                <Link href="/login" className="btn-secondary text-center text-base px-8 py-3">
                  Ya tengo cuenta
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                ✓ Sin costo de registro &nbsp;·&nbsp; ✓ Sin permanencia &nbsp;·&nbsp; ✓ 100% online
              </p>
            </div>

            {/* Calculadora decorativa */}
            <div className="card p-6 shadow-lg max-w-sm mx-auto lg:mx-0 w-full">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Simulador de envío</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tú envías desde Chile</label>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-2xl">🇨🇱</span>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-gray-900">$ 100.000</p>
                      <p className="text-xs text-gray-400">CLP</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm">→</div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Destinatario recibe en Venezuela</label>
                  <div className="flex items-center gap-2 bg-brand-50 rounded-xl px-4 py-3">
                    <span className="text-2xl">🇻🇪</span>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-brand-700">Bs. 3.587</p>
                      <p className="text-xs text-brand-400">VES</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 pt-1">
                  <span>Tasa: 1 CLP = 0.0359 VES</span>
                  <span>Comisión: 4%</span>
                </div>
              </div>
              <Link href="/register" className="btn-primary w-full text-center mt-5 block text-sm">
                Crear mi cuenta gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 bg-brand-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-brand-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">¿Por qué elegir Trapping?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Somos una plataforma chilena construida pensando en la comunidad inmigrante.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Cómo funciona</h2>
            <p className="text-gray-500">En 4 simples pasos, tu dinero llega a donde lo necesitas.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="card p-6 text-center">
                  <div className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {s.n}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 text-gray-300 text-xl z-10">→</div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register" className="btn-primary text-base px-10 py-3">
              Comenzar ahora
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BANNER */}
      <section className="py-16 px-4 sm:px-6 bg-brand-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Tu familia está esperando. Nosotros hacemos que llegue.
          </h2>
          <p className="text-brand-200 mb-8 text-lg">
            Únete a miles de familias que confían en Trapping para enviar dinero al exterior.
          </p>
          <Link href="/register" className="inline-block bg-white text-brand-700 font-semibold px-10 py-3 rounded-lg hover:bg-brand-50 transition-colors text-base">
            Registrarme gratis →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map(f => (
              <div key={f.q} className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="font-semibold text-gray-700">Trapping</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 Trapping. Plataforma chilena de remesas.</p>
          <div className="flex gap-6 text-xs text-gray-400">
            <Link href="/login" className="hover:text-gray-600">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-gray-600">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
