'use client'
// src/hooks/useWizard.ts
import { useState, useCallback } from 'react'
import type { WizardState } from '@/types/database'
import { calcularComision, calcularMontoDestino } from '@/utils/format'

const DESCUENTOS: Record<string, number> = {
  'HELLORIA': 100, // porcentaje de descuento en comisión
  'TRAPPING10': 10,
}

const initialState: WizardState = {
  step: 1,
  monedaOrigen: 'CLP',
  monedaDestino: 'VES',
  montoOrigen: null,
  montoDestino: null,
  tasaId: null,
  tasaValor: null,
  comision: 0,
  impuesto: 0,
  total: 0,
  codigoDescuento: '',
  descuentoAplicado: false,
  cuentaDestinatarioId: null,
  siglaPais: '',
  cuentaAppId: null,
  billeteraId: null,
  propositoId: null,
  boucher: null,
}

export function useWizard() {
  const [state, setState] = useState<WizardState>(initialState)

  const setStep = useCallback((step: WizardState['step']) => {
    setState(s => ({ ...s, step }))
  }, [])

  const setMonedaOrigen = useCallback((moneda: string) => {
    setState(s => ({
      ...s,
      monedaOrigen: moneda,
      montoOrigen: null,
      montoDestino: null,
      tasaId: null,
      tasaValor: null,
      comision: 0,
      impuesto: 0,
      total: 0,
      cuentaAppId: null,
      billeteraId: null,
    }))
  }, [])

  const setMonedaDestino = useCallback((moneda: string) => {
    setState(s => ({
      ...s,
      monedaDestino: moneda,
      montoDestino: null,
      tasaId: null,
      tasaValor: null,
    }))
  }, [])

  const setTasa = useCallback((tasa: { id: number; valor: number }) => {
    setState(s => ({ ...s, tasaId: tasa.id, tasaValor: tasa.valor }))
  }, [])

  const setMonto = useCallback((montoOrigen: number, tasa: { id: number; valor: number }) => {
    setState(s => {
      const descuento = s.descuentoAplicado ? 100 : 0
      const { comision, impuesto, neto } = calcularComision(montoOrigen, descuento === 100 ? 0 : 4)
      const montoDestino = calcularMontoDestino(montoOrigen, tasa.valor, comision)
      return {
        ...s,
        montoOrigen,
        montoDestino,
        tasaId: tasa.id,
        tasaValor: tasa.valor,
        comision,
        impuesto,
        total: montoOrigen,
      }
    })
  }, [])

  const aplicarDescuento = useCallback((codigo: string) => {
    const clean = codigo.trim().toUpperCase()
    const porcentaje = DESCUENTOS[clean]
    if (porcentaje !== undefined) {
      setState(s => {
        const { comision, impuesto } = calcularComision(s.montoOrigen ?? 0, porcentaje === 100 ? 0 : 4 * (1 - porcentaje / 100))
        const montoDestino = s.tasaValor
          ? calcularMontoDestino(s.montoOrigen ?? 0, s.tasaValor, comision)
          : s.montoDestino
        return {
          ...s,
          codigoDescuento: codigo,
          descuentoAplicado: true,
          comision,
          impuesto,
          montoDestino,
        }
      })
      return true
    }
    return false
  }, [])

  const setDestinatario = useCallback((cuentaId: number, siglaPais: string) => {
    setState(s => ({ ...s, cuentaDestinatarioId: cuentaId, siglaPais }))
  }, [])

  const setPago = useCallback((pago: {
    cuentaAppId?: number | null
    billeteraId?: number | null
    propositoId?: number | null
    boucher?: File | null
  }) => {
    setState(s => ({
      ...s,
      cuentaAppId: pago.cuentaAppId !== undefined ? pago.cuentaAppId : s.cuentaAppId,
      billeteraId: pago.billeteraId !== undefined ? pago.billeteraId : s.billeteraId,
      propositoId: pago.propositoId !== undefined ? pago.propositoId : s.propositoId,
      boucher: pago.boucher !== undefined ? pago.boucher : s.boucher,
    }))
  }, [])

  const reset = useCallback(() => setState(initialState), [])

  const canGoToStep2 = state.montoOrigen !== null && state.tasaId !== null
  const canGoToStep3 = canGoToStep2 && state.cuentaDestinatarioId !== null
  const canGoToStep4 = canGoToStep3 && state.propositoId !== null &&
    (state.cuentaAppId !== null || state.billeteraId !== null)

  return {
    state,
    setStep,
    setMonedaOrigen,
    setMonedaDestino,
    setTasa,
    setMonto,
    aplicarDescuento,
    setDestinatario,
    setPago,
    reset,
    canGoToStep2,
    canGoToStep3,
    canGoToStep4,
  }
}
