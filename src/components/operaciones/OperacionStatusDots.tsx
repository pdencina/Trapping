/**
 * Mini indicador visual de progreso de operación.
 * Muestra 4 puntos que representan los estados: Generada → Revisión → Procesando → Completada
 * Útil para vistas compactas (dashboard, listados móvil).
 */

interface Props {
  estatusId: number
  size?: 'sm' | 'md'
}

export default function OperacionStatusDots({ estatusId, size = 'sm' }: Props) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
  const gap = size === 'sm' ? 'gap-1' : 'gap-1.5'

  // Mapear estatus a pasos completados
  const stepsCompleted = estatusId === 4 ? 4 : estatusId === 3 ? -1 : estatusId // -1 = rechazado

  return (
    <div className={`flex items-center ${gap}`} title={getTitle(estatusId)}>
      {[1, 2, 3, 4].map(step => {
        let color = 'bg-gray-200'
        if (stepsCompleted === -1) {
          // Rechazada: rojo hasta el paso actual
          color = step <= 2 ? 'bg-red-400' : 'bg-gray-200'
        } else if (step <= stepsCompleted) {
          color = 'bg-green-500'
        } else if (step === stepsCompleted + 1) {
          color = 'bg-brand-500 animate-pulse'
        }

        return <div key={step} className={`${dotSize} rounded-full ${color}`} />
      })}
    </div>
  )
}

function getTitle(estatusId: number): string {
  switch (estatusId) {
    case 1: return 'Generada — esperando revisión'
    case 2: return 'En revisión'
    case 3: return 'Rechazada'
    case 4: return 'Completada'
    default: return 'Desconocido'
  }
}
