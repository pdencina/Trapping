// src/lib/rate-limit.ts
// Rate limiter in-memory basado en sliding window.
// Para producción con múltiples instancias, migrar a Redis (Upstash).

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type RateLimitEntry = {
  timestamps: number[]
}

// Store en memoria (se resetea con cada deploy/reinicio del server)
const store = new Map<string, RateLimitEntry>()

// Limpiar entradas viejas cada 5 minutos para evitar memory leak
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  for (const [key, entry] of store) {
    const validTimestamps = entry.timestamps.filter(t => now - t < windowMs)
    if (validTimestamps.length === 0) {
      store.delete(key)
    } else {
      entry.timestamps = validTimestamps
    }
  }
}

export interface RateLimitConfig {
  /** Número máximo de requests en la ventana */
  maxRequests: number
  /** Duración de la ventana en milisegundos */
  windowMs: number
}

/**
 * Configuraciones predefinidas de rate limiting.
 */
export const RATE_LIMITS = {
  /** Login: 5 intentos por minuto */
  login: { maxRequests: 5, windowMs: 60 * 1000 },
  /** Registro: 3 intentos por 5 minutos */
  register: { maxRequests: 3, windowMs: 5 * 60 * 1000 },
  /** Crear operación: 10 por hora */
  operacion: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  /** Upload KYC: 5 por 10 minutos */
  kyc: { maxRequests: 5, windowMs: 10 * 60 * 1000 },
  /** API genérica: 60 por minuto */
  api: { maxRequests: 60, windowMs: 60 * 1000 },
} as const

/**
 * Obtiene un identificador del cliente basado en IP o header.
 */
function getClientId(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
  return ip
}

/**
 * Verifica si el request está dentro del rate limit.
 * @returns null si está OK, o NextResponse con 429 si excede el límite.
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): NextResponse | null {
  const clientId = identifier ?? getClientId(req)
  const key = `${req.nextUrl.pathname}:${clientId}`
  const now = Date.now()

  cleanup(config.windowMs)

  const entry = store.get(key) ?? { timestamps: [] }

  // Filtrar timestamps dentro de la ventana
  entry.timestamps = entry.timestamps.filter(t => now - t < config.windowMs)

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0]
    const resetIn = Math.ceil((oldestInWindow + config.windowMs - now) / 1000)

    return NextResponse.json(
      {
        error: 'Demasiados intentos. Por favor espera antes de intentar de nuevo.',
        retryAfterSeconds: resetIn,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(resetIn),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil((oldestInWindow + config.windowMs) / 1000)),
        },
      }
    )
  }

  // Registrar el request
  entry.timestamps.push(now)
  store.set(key, entry)

  return null // OK, no limitado
}

/**
 * Helper para usar en API routes.
 * Retorna headers informativos de rate limit.
 */
export function getRateLimitHeaders(
  req: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): Record<string, string> {
  const clientId = identifier ?? getClientId(req)
  const key = `${req.nextUrl.pathname}:${clientId}`
  const now = Date.now()

  const entry = store.get(key)
  const count = entry?.timestamps.filter(t => now - t < config.windowMs).length ?? 0
  const remaining = Math.max(0, config.maxRequests - count)

  return {
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(remaining),
  }
}
