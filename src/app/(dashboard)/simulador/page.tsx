'use client'
// src/app/(dashboard)/simulador/page.tsx
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoneda, calcularComision } from '@/utils/format'

export default function SimuladorPage() {
  const [tasas, setTasas] = useState<any[]>([])
  const [monedaOrigen, setMonedaOrigen] = useState('CLP')
  const [monedaDestino, setMonedaDestino] = useState('VES')
  const [monto, setMonto] = useState('')
  const [codigo, setCodigo] = useState('')
  const [descuento, setDescuento] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('tasas').select('*').eq('activo', true).is('deleted_at', null)
      .then(({ data }) => { setTasas(data ?? []); setLoading(false) })
  }, [])

  const tasa = tasas.find(t => t.moneda_origen === monedaOrigen && t.moneda_destino === monedaDestino)
  const montoNum = parseFloat(monto.replace(/\./g, '').replace(',', '.')) || 0
  const { comision, impuesto, neto } = calcularComision(montoNum, descuento ? 0 : 4)
  const montoDestino = tasa ? Math.round(neto * tasa.valor) : 0

  const monedasOrigen = Array.from(new Set(tasas.map((t: any) => String(t.moneda_origen))))
  const monedasDestino = tasas.filter(t => t.moneda_origen === monedaOrigen).map(t => t.moneda_destino)

  const aplicarCodigo = () => {
    if (codigo.trim().toUpperCase() === 'HELLORIA') setDescuento(true)
    else alert('Código no válido')
  }

  const formatInput = (val: string) => {
    const num = val.replace(/\D/g, '')
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Simulador de envío</h1>
        <p className="text-gray-500 text-sm mt-0.5">Calcula cuánto recibirá tu destinatario</p>
      </div>

      <div className="card p-6 space-y-5">
        {/* Monedas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Moneda origen</label>
            <select className="input-field" value={monedaOrigen}
              onChange={e => { setMonedaOrigen(e.target.value); setMonedaDestino('') }}>
              {monedasOrigen.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Moneda destino</label>
            <select className="input-field" value={monedaDestino}
              onChange={e => setMonedaDestino(e.target.value)}>
              <option value="">Seleccionar...</option>
              {monedasDestino.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Monto */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Monto a enviar</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{monedaOrigen}</span>
            <input type="text" className="input-field pl-12"
              placeholder="0"
              value={monto}
              onChange={e => setMonto(formatInput(e.target.value))} />
          </div>
          {tasa && montoNum > 0 && montoNum < tasa.monto_minimo && (
            <p className="text-xs text-red-500 mt-1">
              Monto mínimo: {formatMoneda(tasa.monto_minimo, monedaOrigen)}
            </p>
          )}
          {tasa && montoNum > 0 && tasa.monto_maximo > 0 && montoNum > tasa.monto_maximo && (
            <p className="text-xs text-red-500 mt-1">
              Monto máximo: {formatMoneda(tasa.monto_maximo, monedaOrigen)}
            </p>
          )}
        </div>

        {/* Código descuento */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Código de descuento (opcional)</label>
          <div className="flex gap-2">
            <input type="text" className="input-field flex-1" placeholder="Ej: HELLORIA"
              value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())}
              disabled={descuento} />
            <button onClick={aplicarCodigo} disabled={descuento || !codigo}
              className="btn-secondary px-4 text-sm">
              {descuento ? '✓ Aplicado' : 'Aplicar'}
            </button>
          </div>
          {descuento && (
            <p className="text-xs text-green-600 mt-1 font-medium">🎉 Descuento aplicado — sin comisión</p>
          )}
        </div>

        {/* Resultado */}
        {tasa && montoNum > 0 ? (
          <div className="bg-brand-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monto enviado</span>
              <span className="font-medium">{formatMoneda(montoNum, monedaOrigen)}</span>
            </div>
            {!descuento && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Comisión (4%)</span>
                  <span className="text-gray-500">- {formatMoneda(comision, monedaOrigen)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 text-xs">IVA incluido en comisión</span>
                  <span className="text-gray-400 text-xs">{formatMoneda(impuesto, monedaOrigen)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monto a convertir</span>
              <span className="font-medium">{formatMoneda(neto, monedaOrigen)}</span>
            </div>
            <div className="border-t border-brand-200 pt-3 flex justify-between">
              <span className="font-bold text-brand-800 text-base">El destinatario recibe</span>
              <span className="font-bold text-brand-700 text-xl">{formatMoneda(montoDestino, monedaDestino)}</span>
            </div>
            <div className="text-xs text-gray-400 text-center pt-1">
              Tasa: 1 {monedaOrigen} = {tasa.valor.toFixed(6)} {monedaDestino}
            </div>
          </div>
        ) : tasa ? (
          <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-400">
            Ingresa un monto para calcular
          </div>
        ) : monedaDestino ? (
          <div className="bg-red-50 rounded-xl p-4 text-center text-sm text-red-500">
            No hay tasa disponible para {monedaOrigen} → {monedaDestino}
          </div>
        ) : null}

        <a href="/transferir" className="btn-primary w-full text-center block py-3">
          Hacer transferencia →
        </a>
      </div>

      {/* Info tasas */}
      {tasas.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Tasas disponibles hoy</h2>
          <div className="space-y-2">
            {tasas.map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{t.moneda_origen} → {t.moneda_destino}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">1 = {t.valor.toFixed(4)}</span>
                  {t.monto_minimo > 0 && (
                    <span className="text-xs text-gray-400 block">Mín: {formatMoneda(t.monto_minimo, t.moneda_origen)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
