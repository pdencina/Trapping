import { CheckCircle2, Circle, Clock, XCircle, Send, Eye, ArrowRightLeft } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type TimelineStep = {
  id: number
  label: string
  description: string
  icon: React.ElementType
  completedAt?: string | null
  status: 'completed' | 'active' | 'pending' | 'rejected'
}

interface Props {
  estatusId: number
  createdAt: string
  updatedAt?: string | null
}

/**
 * Mapea el estatus_id de la operación a los pasos del timeline.
 * 1 = Generada, 2 = En revisión, 3 = Rechazada, 4 = Completada
 */
function buildSteps(estatusId: number, createdAt: string, updatedAt?: string | null): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      id: 1,
      label: 'Operación creada',
      description: 'Tu transferencia fue registrada exitosamente',
      icon: Send,
      completedAt: createdAt,
      status: 'completed',
    },
    {
      id: 2,
      label: 'En revisión',
      description: 'Nuestro equipo está verificando tu comprobante',
      icon: Eye,
      completedAt: estatusId >= 2 ? updatedAt : null,
      status: estatusId === 2 ? 'active' : estatusId > 2 ? 'completed' : 'pending',
    },
    {
      id: 3,
      label: 'Procesando envío',
      description: 'El dinero está siendo enviado al destino',
      icon: ArrowRightLeft,
      completedAt: estatusId === 4 ? updatedAt : null,
      status: estatusId === 4 ? 'completed' : estatusId === 3 ? 'rejected' : 'pending',
    },
    {
      id: 4,
      label: 'Completada',
      description: 'El destinatario recibió el dinero',
      icon: CheckCircle2,
      completedAt: estatusId === 4 ? updatedAt : null,
      status: estatusId === 4 ? 'completed' : 'pending',
    },
  ]

  // Si fue rechazada, reemplazar el paso 3 con "Rechazada"
  if (estatusId === 3) {
    steps[2] = {
      id: 3,
      label: 'Rechazada',
      description: 'La operación fue rechazada por nuestro equipo',
      icon: XCircle,
      completedAt: updatedAt,
      status: 'rejected',
    }
    // Marcar paso 4 como irrelevante
    steps[3] = { ...steps[3], status: 'pending' }
  }

  return steps
}

const statusStyles = {
  completed: {
    dot: 'bg-green-500 text-white',
    line: 'bg-green-500',
    text: 'text-gray-900',
    desc: 'text-gray-500',
  },
  active: {
    dot: 'bg-brand-600 text-white animate-pulse',
    line: 'bg-gray-200',
    text: 'text-brand-700 font-semibold',
    desc: 'text-brand-500',
  },
  pending: {
    dot: 'bg-gray-200 text-gray-400',
    line: 'bg-gray-200',
    text: 'text-gray-400',
    desc: 'text-gray-300',
  },
  rejected: {
    dot: 'bg-red-500 text-white',
    line: 'bg-red-200',
    text: 'text-red-700',
    desc: 'text-red-400',
  },
}

export default function OperacionTimeline({ estatusId, createdAt, updatedAt }: Props) {
  const steps = buildSteps(estatusId, createdAt, updatedAt)

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const styles = statusStyles[step.status]
        const Icon = step.icon
        const isLast = index === steps.length - 1
        const showStep = step.status !== 'pending' || estatusId < 3 // Ocultar "Completada" si fue rechazada

        if (estatusId === 3 && step.id === 4) return null

        return (
          <div key={step.id} className="flex gap-4">
            {/* Línea vertical + punto */}
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${styles.dot}`}>
                <Icon size={16} />
              </div>
              {!isLast && !(estatusId === 3 && step.id === 3) && (
                <div className={`w-0.5 flex-1 min-h-[2rem] ${step.status === 'completed' ? styles.line : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Contenido */}
            <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
              <p className={`text-sm font-medium ${styles.text}`}>{step.label}</p>
              <p className={`text-xs mt-0.5 ${styles.desc}`}>{step.description}</p>
              {step.completedAt && step.status !== 'pending' && (
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(step.completedAt), "d MMM yyyy · HH:mm", { locale: es })}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
