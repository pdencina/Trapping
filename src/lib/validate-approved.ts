import { redirect } from 'next/navigation'
import { canOperate } from '@/lib/kyc'

export function validateApprovedUser(profile: any) {
  if (!canOperate(profile?.kyc_status)) {
    redirect('/pending')
  }
}
