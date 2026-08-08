'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatMoneda, calcularComision } from '@/utils/format'
import { BANDERAS, NOMBRES_MONEDA, PAISES_DESTINO } from '@/lib/constants'
import { ArrowDown, RefreshCw } from 'lucide-react'

type Tasa = {
  id: number
  moneda_origen: string
  moneda_destino: string
  valor: number
  monto_minimo: number
  monto_maximo: number
  impuesto_moneda_origen: number
}

export default function LandingCalculator() {
  const [tasas, setTasas] = useState<Tasa[]>([])
  const [loading, setLoading] = useState(true)
  const [monedaDestino, setMonedaDestino] = useState('VES')
  const [montoInput, setMontoInput] = useState('100000')

  // Cargar tasas activas
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('tasas')
      .select('id, moneda_origen, moneda_destino, valor, monto_minimo, monto_maximo, impuesto_moneda_origen')
      .eq('activo', true)
      .eq('moneda_origen', 'CLP')
      .is('deleted_at', null)
      .then(({ data }) => {
        setTasas(data ?? [])
        setLoading(false)
      })
  }, [])

  const monedasDestino = useMemo(() => {
    return [...new Set(tasas.map(t => t.moneda_destino))]
  }, [tasas])

  const tasaActual = useMemo(() => {
    return tasas.find(t => t.moneda_destino === monedaDestino)
  }, [tasas, monedaDestino])

  const montoNum = parseInt(montoInput.replace(/\./g, '')) || 0
  const { comision, neto } = calcularComision(montoNum, 4)
  const montoDestino = tasaActual ? Math.round(neto * tasaActual.valor) : 0

  const formatInput = (val: string) => {
    const num = val.replace(/\D/g, '')
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  if (loading) {
    return (
      <div className="card p-6 shadow-lg max-w-sm mx-auto lg:mx-0 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-14 bg-gray-100 rounded-xl" />
          <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto" />
          <div className="h-14 bg-brand-50 rounded-xl" />
          <div className="h-12 bg-brand-100 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6 shadow-lg max-w-sm mx-auto lg:mx-0 w-full">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Simulador de envío
      </p>

      <div className="space-y-3">
        {/* Monto origen */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Tú envías desde Chile</label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-2xl">{BANDERAS.CLP}</span>
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-900">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatInput(montoInput)}
                  onChange={e => setMontoInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none pl-5"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-gray-400">CLP</p>
            </div>
          </div>
        </div>

        {/* Separador con flecha */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white">
            <ArrowDown size={14} />
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Monto destino */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Destinatario recibe en {PAISES_DESTINO[monedaDestino] ?? monedaDestino}
          </label>
          <div className="flex items-center gap-2 bg-brand-50 rounded-xl px-4 py-3">
            <span className="text-2xl">{BANDERAS[monedaDestino] ?? '🌍'}</span>
            <div className="flex-1">
              <p className="text-2xl font-bold text-brand-700">
                {montoNum > 0 && tasaActual
                  ? formatMoneda(montoDestino, monedaDestino)
                  : `${NOMBRES_MONEDA[monedaDestino] ?? monedaDestino}`
                }
              </p>
              <p className="text-xs text-brand-400">{monedaDestino}</p>
            </div>
          </div>
        </div>

        {/* Selector de país destino */}
        {monedasDestino.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {monedasDestino.map(m => (
              <button
                key={m}
                onClick={() => setMonedaDestino(m)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  monedaDestino === m
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {BANDERAS[m]} {m}
              </button>
            ))}
          </div>
        )}

        {/* Detalles */}
        {tasaActual && montoNum > 0 && (
          <div className="flex flex-wrap justify-between text-xs text-gray-400 pt-1 gap-y-1">
            <span>Tasa: 1 CLP = {tasaActual.valor.toFixed(4)} {monedaDestino}</span>
            <span>Comisión: {formatMoneda(comision, 'CLP')}</span>
          </div>
        )}

        {!tasaActual && !loading && (
          <p className="text-xs text-gray-400 text-center py-2">
            No hay tasa disponible para este destino
          </p>
        )}
      </div>

      <Link href="/register" className="btn-primary w-full text-center mt-5 block text-sm">
        Crear mi cuenta gratis
      </Link>
    </div>
  )
}
