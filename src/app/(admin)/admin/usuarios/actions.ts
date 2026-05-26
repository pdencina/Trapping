"use server"

import { revalidatePath } from "next/cache"
import { createServiceClient } from "@/lib/supabase/server"

export type KycStatus = "pending_review" | "docs_pending" | "approved" | "rejected" | "suspended"

export type AdminUserRow = {
  id: string
  name: string
  lastname: string
  email: string
  rut: string
  phone: string
  role: string
  created_at: string | null
  validado: number
  kyc_status: KycStatus
  kyc_message: string
  kyc_internal_note: string
  email_confirmed_at: string | null
  operations_count: number
}

const VALID_STATUSES: KycStatus[] = ["pending_review", "docs_pending", "approved", "rejected", "suspended"]

function normalizeStatus(status?: string | null): KycStatus {
  if (status && VALID_STATUSES.includes(status as KycStatus)) return status as KycStatus
  return "pending_review"
}

function validadoFromStatus(status: KycStatus) {
  return status === "approved" ? 1 : 0
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = createServiceClient()

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id,name,lastname,rut,celular,role,validado,created_at,kyc_status,kyc_message,kyc_internal_note")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo usuarios:", error)
    return []
  }

  const { data: operations } = await supabase.from("operaciones").select("user_id").is("deleted_at", null)
  const operationCountByUser = new Map<string, number>()

  for (const operation of operations ?? []) {
    const userId = String((operation as any).user_id ?? "")
    if (!userId) continue
    operationCountByUser.set(userId, (operationCountByUser.get(userId) ?? 0) + 1)
  }

  const { data: authUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const authById = new Map<string, any>()

  for (const authUser of authUsers?.users ?? []) {
    authById.set(authUser.id, authUser)
  }

  return (profiles ?? []).map((profile: any) => {
    const authUser = authById.get(profile.id)
    const status = normalizeStatus(profile.kyc_status)

    return {
      id: profile.id,
      name: profile.name ?? "",
      lastname: profile.lastname ?? "",
      email: authUser?.email ?? "",
      rut: profile.rut ?? "",
      phone: profile.celular ?? "",
      role: profile.role ?? "User",
      created_at: profile.created_at ?? null,
      validado: Number(profile.validado ?? 0),
      kyc_status: status,
      kyc_message: profile.kyc_message ?? "",
      kyc_internal_note: profile.kyc_internal_note ?? "",
      email_confirmed_at: authUser?.email_confirmed_at ?? null,
      operations_count: operationCountByUser.get(profile.id) ?? 0,
    }
  })
}

export async function updateUserKycStatusAction(userId: string, status: KycStatus, message?: string) {
  if (!VALID_STATUSES.includes(status)) return { error: "Estado inválido" }

  const supabase = createServiceClient()
  const now = new Date().toISOString()
  const patch: Record<string, any> = {
    kyc_status: status,
    validado: validadoFromStatus(status),
    kyc_message: message ?? null,
    reviewed_at: now,
  }

  if (status === "approved") {
    patch.approved_at = now
    patch.rejected_at = null
  }

  if (status === "rejected") {
    patch.rejected_at = now
    patch.approved_at = null
  }

  const { error } = await supabase.from("profiles").update(patch).eq("id", userId)
  if (error) return { error: error.message }

  revalidatePath("/admin/usuarios")
  revalidatePath("/dashboard")
  revalidatePath("/transferir")
  return { success: true }
}

export async function updateAdminUserAction(formData: FormData) {
  const userId = String(formData.get("id") ?? "")
  const status = normalizeStatus(String(formData.get("kyc_status") ?? ""))

  if (!userId) return { error: "Usuario inválido" }

  const supabase = createServiceClient()
  const now = new Date().toISOString()

  const patch: Record<string, any> = {
    name: String(formData.get("name") ?? ""),
    lastname: String(formData.get("lastname") ?? ""),
    rut: String(formData.get("rut") ?? ""),
    celular: String(formData.get("phone") ?? ""),
    kyc_status: status,
    validado: validadoFromStatus(status),
    kyc_message: String(formData.get("kyc_message") ?? ""),
    kyc_internal_note: String(formData.get("kyc_internal_note") ?? ""),
    reviewed_at: now,
  }

  if (status === "approved") {
    patch.approved_at = now
    patch.rejected_at = null
  }

  if (status === "rejected") {
    patch.rejected_at = now
    patch.approved_at = null
  }

  const { error } = await supabase.from("profiles").update(patch).eq("id", userId)
  if (error) return { error: error.message }

  revalidatePath("/admin/usuarios")
  return { success: true }
}
