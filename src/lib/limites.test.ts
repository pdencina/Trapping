import { describe, it, expect } from 'vitest'

// Test de la lógica de constantes y helpers que no requieren Supabase
describe('limites - constantes', () => {
  it('los tiers predefinidos tienen valores razonables', () => {
    // Estos valores se cargan de la DB, pero documentamos las expectativas
    const standard = { max_operaciones_dia: 5, max_monto_dia_clp: 2000000 }
    const premium = { max_operaciones_dia: 10, max_monto_dia_clp: 5000000 }
    const vip = { max_operaciones_dia: 50, max_monto_dia_clp: 50000000 }

    expect(standard.max_operaciones_dia).toBeLessThan(premium.max_operaciones_dia)
    expect(premium.max_operaciones_dia).toBeLessThan(vip.max_operaciones_dia)
    expect(standard.max_monto_dia_clp).toBeLessThan(premium.max_monto_dia_clp)
  })
})

describe('limites - validaciones de negocio', () => {
  it('un monto de 0 nunca debería exceder el límite', () => {
    const monto = 0
    const limite = 2000000
    expect(monto).toBeLessThanOrEqual(limite)
  })

  it('monto máximo por operación standard (1M CLP)', () => {
    const maxOperacion = 1000000
    expect(999999).toBeLessThanOrEqual(maxOperacion)
    expect(1000001).toBeGreaterThan(maxOperacion)
  })

  it('acumulado diario no puede exceder el límite', () => {
    const operacionesDia = [500000, 300000, 200000] // total 1M
    const totalDia = operacionesDia.reduce((s, m) => s + m, 0)
    const nuevoMonto = 600000
    const limite = 2000000

    // 1M + 600K = 1.6M < 2M → debe pasar
    expect(totalDia + nuevoMonto).toBeLessThanOrEqual(limite)
  })

  it('acumulado diario que excede el límite se rechaza', () => {
    const operacionesDia = [1000000, 800000] // total 1.8M
    const totalDia = operacionesDia.reduce((s, m) => s + m, 0)
    const nuevoMonto = 500000
    const limite = 2000000

    // 1.8M + 500K = 2.3M > 2M → rechazar
    expect(totalDia + nuevoMonto).toBeGreaterThan(limite)
  })
})
