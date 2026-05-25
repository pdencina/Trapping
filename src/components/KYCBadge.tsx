import {
  KYCStatus,
  KYC_STATUS_COLORS,
  KYC_STATUS_LABELS,
} from '@/lib/kyc'

interface Props {
  status: KYCStatus
}

export default function KYCBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${KYC_STATUS_COLORS[status]}`}
    >
      {KYC_STATUS_LABELS[status]}
    </span>
  )
}
