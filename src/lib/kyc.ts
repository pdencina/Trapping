export type KYCStatus =
  | 'pending_review'
  | 'docs_pending'
  | 'approved'
  | 'rejected'
  | 'suspended'

export const KYC_STATUS_LABELS: Record<KYCStatus, string> = {
  pending_review: 'En revisión',
  docs_pending: 'Documentación pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  suspended: 'Suspendido',
}

export const KYC_STATUS_COLORS: Record<KYCStatus, string> = {
  pending_review: 'bg-yellow-100 text-yellow-800',
  docs_pending: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  suspended: 'bg-gray-200 text-gray-800',
}

export function canOperate(status?: string) {
  return status === 'approved'
}
