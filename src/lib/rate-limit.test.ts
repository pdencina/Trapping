import { describe, it, expect, beforeEach } from 'vitest'

// Mock NextRequest para testing
function createMockRequest(pathname: string, ip = '127.0.0.1') {
  return {
    nextUrl: { pathname },
    headers: {
      get: (name: string) => {
        if (name === 'x-forwarded-for') return ip
        return null
      },
    },
  } as any
}

// Importar después del mock setup
import { checkRateLimit, RATE_LIMITS } from './rate-limit'

describe('rate-limit', () => {
  it('permite requests dentro del límite', () => {
    const req = createMockRequest('/api/test', '10.0.0.1')
    const config = { maxRequests: 3, windowMs: 60000 }

    const r1 = checkRateLimit(req, config)
    const r2 = checkRateLimit(req, config)
    const r3 = checkRateLimit(req, config)

    expect(r1).toBeNull()
    expect(r2).toBeNull()
    expect(r3).toBeNull()
  })

  it('bloquea requests que exceden el límite', () => {
    const req = createMockRequest('/api/blocked-test', '10.0.0.2')
    const config = { maxRequests: 2, windowMs: 60000 }

    checkRateLimit(req, config)
    checkRateLimit(req, config)
    const blocked = checkRateLimit(req, config)

    expect(blocked).not.toBeNull()
    expect(blocked?.status).toBe(429)
  })

  it('IPs diferentes tienen contadores separados', () => {
    const config = { maxRequests: 1, windowMs: 60000 }

    const req1 = createMockRequest('/api/ip-test', '10.0.0.10')
    const req2 = createMockRequest('/api/ip-test', '10.0.0.11')

    const r1 = checkRateLimit(req1, config)
    const r2 = checkRateLimit(req2, config)

    expect(r1).toBeNull()
    expect(r2).toBeNull()
  })

  it('rutas diferentes tienen contadores separados', () => {
    const config = { maxRequests: 1, windowMs: 60000 }

    const req1 = createMockRequest('/api/route-a', '10.0.0.20')
    const req2 = createMockRequest('/api/route-b', '10.0.0.20')

    const r1 = checkRateLimit(req1, config)
    const r2 = checkRateLimit(req2, config)

    expect(r1).toBeNull()
    expect(r2).toBeNull()
  })

  it('RATE_LIMITS tiene configuraciones predefinidas', () => {
    expect(RATE_LIMITS.login.maxRequests).toBe(5)
    expect(RATE_LIMITS.register.maxRequests).toBe(3)
    expect(RATE_LIMITS.operacion.maxRequests).toBe(10)
    expect(RATE_LIMITS.kyc.maxRequests).toBe(5)
    expect(RATE_LIMITS.api.maxRequests).toBe(60)
  })
})
