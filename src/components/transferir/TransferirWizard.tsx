'use client'
// src/components/transferir/TransferirWizard.tsx
import { useState } from 'react'
import { toast } from 'sonner'
import { useWizard } from '@/hooks/useWizard'
import { crearOperacionAction } from '@/lib/actions/operaciones'
import { formatMoneda, formatMonto } from '@/utils/format'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle2, ChevronRight, Copy, Upload, Star } from 'lucide-react'
import { cn } from '@/utils/format'
import type { Moneda, Tasa, Billetera, OperacionProposito } from '@/types/database'

interface Props {
  monedas: (Moneda & { paises: { nombre_pais: string } | null })[]
  tasas: Tasa[]
  destinatarios: any[]
  cuentasApp: any[]
  billeteras: Billetera[]
  propositos: OperacionProposito[]
}

const STEPS = ['Monto', 'Destino', 'Pago', 'Confirmación']

export default function TransferirWizard({ monedas, tasas, destinatarios, cuentasApp, billeteras, propositos }: Props) {
  const { state, setStep, setMonedaOrigen, setMonedaDestino, setMonto, aplicarDescuento, setDestinatario, setPago, reset } = useWizard()
  const [loading, setLoading] = useState(false)
  const [codigoInput, setCodigoInput] = useState('')
  const [boucherFile, setBoucherFile] = useState<File | null>(null)
  const [codigoOperacion, setCodigoOperacion] = useState<string | null>(null)

  const MAX_COMPROBANTE_MB = 10
  const COMPROBANTE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

  const cuentaSeleccionada = cuentasApp.find((c: any) => c.id === state.cuentaAppId)
  const billeteraSeleccionada = billeteras.find(b => b.id === state.billeteraId)

  const handleComprobanteChange = (file?: File) => {
    if (!file) {
      setBoucherFile(null)
      return
    }

    if (!COMPROBANTE_TYPES.includes(file.type)) {
      toast.error('El comprobante debe ser JPG, PNG o PDF')
      setBoucherFile(null)
      return
    }

    if (file.size > MAX_COMPROBANTE_MB * 1024 * 1024) {
      toast.error(`El comprobante no puede superar ${MAX_COMPROBANTE_MB}MB`)
      setBoucherFile(null)
      return
    }

    setBoucherFile(file)
  }

  const copiarCuenta = async (texto: string) => {
    await navigator.clipboard.writeText(texto)
    toast.success('Dato copiado')
  }

  // Helpers
  const getTasa = (from: string, to: string) =>
    tasas.find(t => t.moneda_origen === from && t.moneda_destino === to && t.activo)

  const tasa = getTasa(state.monedaOrigen, state.monedaDestino)

  const handleMontoChange = (v: string) => {
    const num = parseFloat(v.replace(/\./g, '').replace(',', '.'))
    if (!isNaN(num) && tasa) {
      setMonto(num, { id: tasa.id, valor: tasa.valor })
    }
  }

  const handleDescuento = () => {
    const ok = aplicarDescuento(codigoInput)
    if (ok) toast.success('¡Código aplicado! Comisión con descuento.')
    else toast.error('Código no válido')
  }

  const handleSubmit = async () => {
    if (!state.montoOrigen || !state.tasaId || !state.cuentaDestinatarioId || !state.propositoId) {
      toast.error('Completa todos los datos antes de confirmar')
      return
    }

    if (state.cuentaAppId && !boucherFile) {
      toast.error('Debes adjuntar el comprobante de pago')
      return
    }

    if (state.billeteraId && billeteraSeleccionada && billeteraSeleccionada.saldo < state.montoOrigen) {
      toast.error('Saldo insuficiente en tu billetera')
      return
    }

    setLoading(true)

    let boucherPath: string | undefined
    if (boucherFile && state.cuentaAppId) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Sesión no encontrada'); setLoading(false); return }
      const ext = boucherFile.name.split('.').pop()?.toLowerCase() ?? 'pdf'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('bouchers').upload(path, boucherFile, {
        contentType: boucherFile.type,
        upsert: false,
      })
      if (error) { toast.error('Error subiendo comprobante'); setLoading(false); return }
      boucherPath = path
    }

    const result = await crearOperacionAction({
      cuenta_destinatario_id: state.cuentaDestinatarioId,
      monto_origen: state.montoOrigen,
      moneda_origen: state.monedaOrigen,
      tasa_id: state.tasaId,
      monto_destino: state.montoDestino ?? 0,
      moneda_destino: state.monedaDestino,
      proposito_id: state.propositoId,
      cuenta_app_id: state.cuentaAppId,
      billetera_id: state.billeteraId,
      boucherPath,
    })

    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    setCodigoOperacion(result.codigo ?? null)
    setStep(4)
  }

  // ─── PASO 4: Éxito ────────────────────────────────────────────
  if (state.step === 4 && codigoOperacion) {
    return (
      <div className="card p-10 text-center fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">¡Operación creada!</h2>
        <p className="text-gray-500 mb-6">Tu transferencia está siendo procesada. Te notificaremos cuando sea confirmada.</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-400 mb-1">Código de operación</p>
          <p className="text-lg font-mono font-bold text-brand-700">{codigoOperacion}</p>
        </div>
        <button onClick={() => { reset(); setCodigoOperacion(null) }} className="btn-primary">
          Nueva transferencia
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="card p-4">
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => {
            const step = (i + 1) as 1 | 2 | 3 | 4
            const done = state.step > step
            const active = state.step === step
            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1',
                    done ? 'step-done' : active ? 'step-active' : 'step-pending'
                  )}>
                    {done ? <CheckCircle2 size={16} /> : step}
                  </div>
                  <span className={cn('text-xs', active ? 'text-brand-700 font-medium' : 'text-gray-400')}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('h-px w-full mx-1 mb-4', done ? 'bg-green-400' : 'bg-gray-200')} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── PASO 1: Monto ──────────────────────────────────── */}
      {state.step === 1 && (
        <div className="card p-6 fade-in space-y-5">
          <h3 className="font-semibold text-gray-900">¿Cuánto quieres enviar?</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Moneda origen</label>
              <select className="input-field" value={state.monedaOrigen}
                onChange={e => { setMonedaOrigen(e.target.value); setBoucherFile(null) }}>
                {monedas.filter(m => m.bank_origen).map(m => (
                  <option key={m.acronimo} value={m.acronimo}>{m.acronimo} — {m.moneda}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Moneda destino</label>
              <select className="input-field" value={state.monedaDestino}
                onChange={e => { setMonedaDestino(e.target.value); setBoucherFile(null) }}>
                {monedas.filter(m => m.bank_destino && m.acronimo !== state.monedaOrigen).map(m => (
                  <option key={m.acronimo} value={m.acronimo}>{m.acronimo} — {m.moneda}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Monto a enviar</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                {state.monedaOrigen}
              </span>
              <input type="text" className="input-field pl-12" placeholder="0"
                onChange={e => handleMontoChange(e.target.value)} />
            </div>
            {tasa && (
              <p className="text-xs text-gray-400 mt-1.5">
                Tasa: 1 {tasa.moneda_origen} = {tasa.valor.toFixed(6)} {tasa.moneda_destino}
                {tasa.monto_minimo > 0 && ` · Mínimo: ${formatMonto(tasa.monto_minimo)} ${tasa.moneda_origen}`}
              </p>
            )}
            {!tasa && (
              <p className="text-xs text-red-500 mt-1.5">No hay tasa disponible para esta combinación</p>
            )}
          </div>

          {/* Resumen */}
          {state.montoOrigen && tasa && (
            <div className="bg-brand-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monto origen</span>
                <span className="font-medium">{formatMoneda(state.montoOrigen, state.monedaOrigen)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Comisión (4%)</span>
                <span className="font-medium text-gray-500">- {formatMoneda(state.comision, state.monedaOrigen)}</span>
              </div>
              {state.descuentoAplicado && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">🎉 Descuento aplicado</span>
                  <span className="font-medium text-green-600">- {formatMoneda(state.comision, state.monedaOrigen)}</span>
                </div>
              )}
              <div className="border-t border-brand-200 pt-2 flex justify-between">
                <span className="font-semibold text-brand-800">El destinatario recibe</span>
                <span className="font-bold text-brand-700 text-lg">
                  {formatMoneda(state.montoDestino ?? 0, state.monedaDestino)}
                </span>
              </div>
            </div>
          )}

          {/* Código de descuento */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Código de descuento (opcional)</label>
            <div className="flex gap-2">
              <input type="text" className="input-field flex-1" placeholder="TRAPPING10"
                value={codigoInput} onChange={e => setCodigoInput(e.target.value.toUpperCase())} />
              <button onClick={handleDescuento} className="btn-secondary px-3 text-sm">Aplicar</button>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!state.montoOrigen || !tasa || !state.tasaId}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Continuar <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ─── PASO 2: Destinatario ────────────────────────────── */}
      {state.step === 2 && (
        <div className="card p-6 fade-in space-y-4">
          <h3 className="font-semibold text-gray-900">¿A quién le envías?</h3>

          {destinatarios.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">No tienes contactos aún</p>
              <a href="/contactos/nuevo" className="btn-primary text-sm">Agregar contacto</a>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {destinatarios.map(d => (
                <div key={d.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium pt-1">
                    <span>{d.name} {d.lastname}</span>
                    {d.favorito && <Star size={12} className="text-amber-400 fill-amber-400" />}
                    <span className="text-gray-300">·</span>
                    <span>{d.paises?.nombre_pais}</span>
                  </div>
                  {d.cuentas_destinatarios?.map((c: any) => (
                    <button key={c.id}
                      onClick={() => setDestinatario(c.id, d.paises?.siglas ?? '')}
                      className={cn(
                        'w-full text-left p-3.5 rounded-xl border text-sm transition-all',
                        state.cuentaDestinatarioId === c.id
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                      )}
                    >
                      <p className="font-medium text-gray-900">{c.bancos?.nombre_banco}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {c.tipos_cuentas?.nombre_tipo} · {c.numero_cuenta}
                      </p>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Atrás</button>
            <button onClick={() => setStep(3)} disabled={!state.cuentaDestinatarioId} className="btn-primary flex-1">
              Continuar <ChevronRight size={16} className="inline ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* ─── PASO 3: Pago ────────────────────────────────────── */}
      {state.step === 3 && (
        <div className="card p-6 fade-in space-y-5">
          <h3 className="font-semibold text-gray-900">Método de pago</h3>

          {/* Propósito */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Propósito del envío</label>
            <select className="input-field"
              value={state.propositoId ?? ''}
              onChange={e => setPago({ propositoId: Number(e.target.value), cuentaAppId: state.cuentaAppId, billeteraId: state.billeteraId, boucher: boucherFile })}>
              <option value="">Seleccionar...</option>
              {propositos.map(p => <option key={p.id} value={p.id}>{p.nombre_proposito}</option>)}
            </select>
          </div>

          {/* Billetera */}
          {billeteras.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Pagar desde billetera</p>
              <div className="space-y-2">
                {billeteras.map(b => (
                  <button key={b.id}
                    onClick={() => setPago({ billeteraId: b.id, cuentaAppId: null, propositoId: state.propositoId ?? 0 })}
                    disabled={!!state.montoOrigen && b.saldo < state.montoOrigen}
                    className={cn(
                      'w-full text-left p-3.5 rounded-xl border text-sm transition-all',
                      state.billeteraId === b.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-brand-300'
                    )}
                  >
                    <span className="font-medium">{b.moneda}</span>
                    <span className="text-gray-500 ml-2">Saldo: {formatMoneda(b.saldo, b.moneda)}</span>
                    {state.montoOrigen && b.saldo < state.montoOrigen && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> Saldo insuficiente
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cuentas Trapping */}
          {cuentasApp.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Transferir a cuenta Trapping</p>
              <div className="space-y-2">
                {cuentasApp.map((c: any) => (
                  <button key={c.id}
                    onClick={() => setPago({ cuentaAppId: c.id, billeteraId: null, propositoId: state.propositoId ?? 0 })}
                    className={cn(
                      'w-full text-left p-3.5 rounded-xl border text-sm transition-all',
                      state.cuentaAppId === c.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-brand-300'
                    )}
                  >
                    <p className="font-medium">{c.bancos?.nombre_banco}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.tipos_cuentas?.nombre_tipo} · {c.numero_cuenta}</p>
                    {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                  </button>
                ))}
              </div>

              {/* Datos de cuenta Trapping + comprobante si seleccionó cuenta */}
              {state.cuentaAppId && cuentaSeleccionada && (
                <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-900">Datos para transferir</p>
                      <p className="mt-1 text-gray-700">{cuentaSeleccionada.razon_social || `${cuentaSeleccionada.name ?? ''} ${cuentaSeleccionada.lastname ?? ''}`.trim() || 'Trapping SPA'}</p>
                      <p className="text-gray-600">RUT: {cuentaSeleccionada.rut ?? 'No informado'}</p>
                      <p className="text-gray-600">Banco: {cuentaSeleccionada.bancos?.nombre_banco}</p>
                      <p className="text-gray-600">Tipo: {cuentaSeleccionada.tipos_cuentas?.nombre_tipo}</p>
                      <p className="text-gray-600">N° cuenta: {cuentaSeleccionada.numero_cuenta}</p>
                      {cuentaSeleccionada.email && <p className="text-gray-600">Email: {cuentaSeleccionada.email}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => copiarCuenta(cuentaSeleccionada.numero_cuenta)}
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-medium text-brand-700 border border-brand-100 hover:bg-brand-100"
                    >
                      <Copy size={14} /> Copiar cuenta
                    </button>
                  </div>
                </div>
              )}

              {state.cuentaAppId && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Adjuntar comprobante de pago <span className="text-red-500">*</span>
                  </label>
                  <label className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                    boucherFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-brand-300'
                  )}>
                    <Upload size={20} className={boucherFile ? 'text-green-600' : 'text-gray-400'} />
                    <span className="text-sm text-gray-600">
                      {boucherFile ? boucherFile.name : 'JPG, PNG o PDF · máx 10MB'}
                    </span>
                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"
                      onChange={e => handleComprobanteChange(e.target.files?.[0])} />
                  </label>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">Atrás</button>
            <button
              onClick={() => setStep(4)}
              disabled={!state.propositoId || (!state.cuentaAppId && !state.billeteraId) || (!!state.cuentaAppId && !boucherFile)}
              className="btn-primary flex-1"
            >
              Revisar <ChevronRight size={16} className="inline ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* ─── PASO 4: Confirmación ────────────────────────────── */}
      {state.step === 4 && !codigoOperacion && (
        <div className="card p-6 fade-in space-y-5">
          <h3 className="font-semibold text-gray-900">Confirmar transferencia</h3>

          <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
            {[
              ['Enviás', formatMoneda(state.montoOrigen ?? 0, state.monedaOrigen)],
              ['Recibe', formatMoneda(state.montoDestino ?? 0, state.monedaDestino)],
              ['Comisión', formatMoneda(state.comision, state.monedaOrigen)],
              ['Pago', state.billeteraId ? `Billetera ${state.monedaOrigen}` : 'Transferencia bancaria con comprobante'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-900">{v}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center">
            Al confirmar aceptas nuestros términos de servicio y política de envíos.
          </p>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1" disabled={loading}>Atrás</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Procesando...' : '✓ Confirmar transferencia'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
