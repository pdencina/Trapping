import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verifica tu correo | Trapping',
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[#F6F2FF] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl border border-purple-100 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-700 text-white text-3xl font-bold">
          ✓
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-700">
          Registro exitoso
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Revisa tu correo
        </h1>

        <p className="mt-4 text-slate-600 leading-relaxed">
          Tus datos fueron registrados correctamente. Te enviamos un correo de confirmación
          para activar tu cuenta en Trapping.
        </p>

        <div className="mt-6 rounded-2xl bg-purple-50 border border-purple-100 p-4 text-left">
          <p className="text-sm font-medium text-slate-900">
            Próximo paso:
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Abre tu correo, presiona el botón <strong>Confirmar mi cuenta</strong> y luego inicia sesión.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-800 transition"
          >
            Ir al login
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Registrar otra cuenta
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Si no ves el correo, revisa Spam, Promociones o No deseados.
        </p>
      </section>
    </main>
  )
}
