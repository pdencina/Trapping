// src/app/(dashboard)/transferir/page.tsx
import { createClient } from '@/lib/supabase/server'
import TransferirWizard from '@/components/transferir/TransferirWizard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Transferir' }

export default async function TransferirPage() {
  const supabase = createClient()

  // Cargar todos los datos que el wizard necesita de una sola vez (Server Component)
  const [
    { data: monedas },
    { data: tasas },
    { data: destinatarios },
    { data: cuentasApp },
    { data: billeteras },
    { data: propositos },
  ] = await Promise.all([
    supabase.from('monedas').select('*, paises(nombre_pais)').is('deleted_at', null).or('bank_origen.eq.true,bank_destino.eq.true'),
    supabase.from('tasas').select('*').is('deleted_at', null).eq('activo', true),
    supabase.from('destinatarios').select(`
      *, paises(nombre_pais, siglas),
      cuentas_destinatarios(*, bancos(nombre_banco, pais_id), tipos_cuentas(nombre_tipo))
    `).is('deleted_at', null).eq('estatus', true).order('favorito', { ascending: false }),
    supabase.from('cuentas').select('*, bancos(nombre_banco), tipos_cuentas(nombre_tipo)').is('deleted_at', null).eq('estatus', true),
    supabase.from('billeteras').select('*').is('deleted_at', null),
    supabase.from('operaciones_propositos').select('*').is('deleted_at', null),
  ])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Enviar dinero</h1>
        <p className="text-gray-500 text-sm mt-1">Completa los 4 pasos para realizar tu transferencia</p>
      </div>
      <TransferirWizard
        monedas={monedas ?? []}
        tasas={tasas ?? []}
        destinatarios={destinatarios ?? []}
        cuentasApp={cuentasApp ?? []}
        billeteras={billeteras ?? []}
        propositos={propositos ?? []}
      />
    </div>
  )
}
