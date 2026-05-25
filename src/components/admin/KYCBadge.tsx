const statusMap: any = {
  pending_review: {
    label: 'En revisión',
    className: 'bg-yellow-100 text-yellow-800',
  },
  docs_pending: {
    label: 'Documentación pendiente',
    className: 'bg-orange-100 text-orange-800',
  },
  approved: {
    label: 'Aprobado',
    className: 'bg-green-100 text-green-800',
  },
  rejected: {
    label: 'Rechazado',
    className: 'bg-red-100 text-red-800',
  },
  suspended: {
    label: 'Suspendido',
    className: 'bg-gray-200 text-gray-800',
  },
}

export default function KYCBadge({ status }: { status: keyof typeof statusMap }) {
  const item = statusMap[status]

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.className}`}>
      {item.label}
    </span>
  )
}
