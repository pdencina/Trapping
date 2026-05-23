// src/utils/format.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea montos con separadores chilenos: 1.234.567
export function formatMonto(value: number, decimals = 0): string {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// Formatea con símbolo de moneda
export function formatMoneda(value: number, moneda: string): string {
  const simbolos: Record<string, string> = {
    CLP: '$', USD: 'US$', VES: 'Bs.', COP: 'COL$', ARS: 'AR$', PEN: 'S/', PAB: 'B/.'
  }
  const simbolo = simbolos[moneda] ?? moneda
  return `${simbolo} ${formatMonto(value, moneda === 'CLP' ? 0 : 2)}`
}

// Genera código de operación único
export function generarCodigoOperacion(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TRP-${ts}-${rand}`
}

// Valida RUT chileno
export function validarRut(rut: string): boolean {
  if (!rut) return false
  const clean = rut.replace(/\./g, '').replace(/-/g, '')
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1).toUpperCase()
  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const res = 11 - (sum % 11)
  const dvCalc = res === 11 ? '0' : res === 10 ? 'K' : res.toString()
  return dvCalc === dv
}

// Formatea RUT: 12.345.678-9
export function formatRut(rut: string): string {
  const clean = rut.replace(/\./g, '').replace(/-/g, '').trim()
  if (clean.length < 2) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

// Calcula comisión (4% estándar)
export function calcularComision(montoOrigen: number, commissionPercent = 4): {
  comision: number
  impuesto: number
  neto: number
  total: number
} {
  const rate = 1 + commissionPercent / 100
  const comision = Math.round(montoOrigen - montoOrigen / rate)
  const impuesto = Math.round(comision * (19 / 119)) // IVA incluido en comisión
  const neto = montoOrigen - comision
  return { comision, impuesto, neto, total: montoOrigen }
}

// Calcula monto destino según tasa
export function calcularMontoDestino(montoOrigen: number, tasaValor: number, comision: number): number {
  const neto = montoOrigen - comision
  return Math.round(neto * tasaValor)
}

// Estado de validado en texto
export function getValidadoLabel(validado: number): { label: string; color: string } {
  const map: Record<number, { label: string; color: string }> = {
    0: { label: 'Pendiente',         color: 'text-amber-600 bg-amber-50' },
    1: { label: 'Aprobado',          color: 'text-green-600 bg-green-50' },
    2: { label: 'Rechazado',         color: 'text-red-600 bg-red-50' },
    4: { label: 'En revisión',       color: 'text-blue-600 bg-blue-50' },
  }
  return map[validado] ?? { label: 'Desconocido', color: 'text-gray-600 bg-gray-50' }
}

// Estado de operación en texto
export function getEstatusLabel(estatusId: number): { label: string; color: string } {
  const map: Record<number, { label: string; color: string }> = {
    1: { label: 'Generada',    color: 'text-gray-600 bg-gray-100' },
    2: { label: 'En revisión', color: 'text-amber-600 bg-amber-50' },
    3: { label: 'Rechazada',   color: 'text-red-600 bg-red-50' },
    4: { label: 'Completada',  color: 'text-green-600 bg-green-50' },
  }
  return map[estatusId] ?? { label: 'Desconocido', color: 'text-gray-600 bg-gray-50' }
}
