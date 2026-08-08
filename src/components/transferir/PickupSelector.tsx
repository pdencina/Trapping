'use client'

import { useState, useMemo } from 'react'
import { MapPin, Clock, Phone, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/format'
import type { PuntoRetiro } from '@/types/database'

interface Props {
  puntos: (PuntoRetiro & { paises?: { nombre_pais: string } })[]
  selectedId: number | null
  onSelect: (id: number) => void
  monedaDestino: string
}

export default function PickupSelector({ puntos, selectedId, onSelect, monedaDestino }: Props) {
  const [ciudadFiltro, setCiudadFiltro] = useState<string>('todas')

  // Filtrar puntos por moneda destino
  const puntosDisponibles = useMemo(() => {
    return puntos.filter(p => p.moneda === monedaDestino && p.activo)
  }, [puntos, monedaDestino])

  // Ciudades disponibles
  const ciudades = useMemo(() => {
    return Array.from(new Set(puntosDisponibles.map(p => p.ciudad))).sort()
  }, [puntosDisponibles])

  // Puntos filtrados por ciudad
  const puntosFiltrados = useMemo(() => {
    if (ciudadFiltro === 'todas') return puntosDisponibles
    return puntosDisponibles.filter(p => p.ciudad === ciudadFiltro)
  }, [puntosDisponibles, ciudadFiltro])

  if (puntosDisponibles.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <MapPin size={24} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No hay puntos de retiro disponibles para {monedaDestino}</p>
        <p className="text-xs text-gray-400 mt-1">Selecciona transferencia bancaria como método de envío</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Punto de retiro en efectivo</p>
        <span className="text-xs text-gray-400">{puntosDisponibles.length} puntos disponibles</span>
      </div>

      {/* Filtro por ciudad */}
      {ciudades.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCiudadFiltro('todas')}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-all',
              ciudadFiltro === 'todas'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'border-gray-200 text-gray-500 hover:border-brand-300'
            )}
          >
            Todas ({puntosDisponibles.length})
          </button>
          {ciudades.map(ciudad => (
            <button
              key={ciudad}
              onClick={() => setCiudadFiltro(ciudad)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-all',
                ciudadFiltro === ciudad
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-gray-200 text-gray-500 hover:border-brand-300'
              )}
            >
              {ciudad}
            </button>
          ))}
        </div>
      )}

      {/* Lista de puntos */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {puntosFiltrados.map(punto => {
          const selected = selectedId === punto.id
          return (
            <button
              key={punto.id}
              onClick={() => onSelect(punto.id)}
              className={cn(
                'w-full text-left p-4 rounded-xl border transition-all',
                selected
                  ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-200'
                  : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  selected ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
                )}>
                  <MapPin size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium',
                    selected ? 'text-brand-700' : 'text-gray-900'
                  )}>
                    {punto.nombre}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{punto.direccion}</p>
                  {punto.referencia && (
                    <p className="text-xs text-gray-400 mt-0.5 italic">{punto.referencia}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {punto.horario && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={10} /> {punto.horario}
                      </span>
                    )}
                    {punto.telefono && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone size={10} /> {punto.telefono}
                      </span>
                    )}
                  </div>
                </div>
                {/* Indicador de ciudad */}
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  {punto.ciudad}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
