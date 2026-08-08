// src/app/(dashboard)/transferir/page.tsx
import { createClient } from '@/lib/supabase/server'
import TransferirWizard from '@/components/transferir/TransferirWizard'
import { getDescuentoReferido } from '@/lib/actions/referrals'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Transferir' }

export default async function TransferirPage({
  searchParams,
}: {
  searchParams: {
    repetir?: string
    moneda_origen?: string
    moneda_destino?: string
    monto?: string
    cuenta_destinatario?: string
    proposito?: string
  }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Cargar todos los datos que el wizard necesita de una sola vez (Server Component)
  const [
    { data: monedas },
    { data: tasas },
    { data: destinatarios },
    { data: cuentasApp },
    { data: billeteras },
    { data: propositos },
    { data: puntosRetiro },
  ] = await Promise.all([
    supabase
      .from('monedas')
      .select('*, paises(nombre_pais)')
      .is('deleted_at', null)
      .or('bank_origen.eq.true,bank_destino.eq.true')
      .order('acronimo'),
    supabase.from('tasas').select('*').is('deleted_at', null).eq('activo', true),
    supabase.from('destinatarios').select(`
      *, paises(nombre_pais, siglas),
      cuentas_destinatarios(*, bancos(nombre_banco, pais_id), tipos_cuentas(nombre_tipo))
    `).eq('user_id', user?.id ?? '').is('deleted_at', null).eq('estatus', true).order('favorito', { ascending: false }),
    supabase.from('cuentas').select('*, bancos(nombre_banco), tipos_cuentas(nombre_tipo)').is('deleted_at', null).eq('estatus', true),
    supabase.from('billeteras').select('*').eq('user_id', user?.id ?? '').is('deleted_at', null),
    supabase.from('operaciones_propositos').select('*').is('deleted_at', null),
    supabase.from('puntos_retiro').select('*, paises(nombre_pais)').is('deleted_at', null).eq('activo', true).order('ciudad'),
  ])

  // Datos de repetición (si viene desde "Repetir operación")
  const repetirData = searchParams.repetir === '1' ? {
    monedaOrigen: searchParams.moneda_origen ?? undefined,
    monedaDestino: searchParams.moneda_destino ?? undefined,
    monto: searchParams.monto ? Number(searchParams.monto) : undefined,
    cuentaDestinatarioId: searchParams.cuenta_destinatario ? Number(searchParams.cuenta_destinatario) : undefined,
    propositoId: searchParams.proposito ? Number(searchParams.proposito) : undefined,
  } : undefined

  // Descuento de referido activo (primeras 3 operaciones sin comisión)
  const descuentoReferido = await getDescuentoReferido(user!.id)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Enviar dinero</h1>
        <p className="text-gray-500 text-sm mt-1">
          {repetirData ? 'Repitiendo operación anterior — verifica los datos' : 'Completa los 4 pasos para realizar tu transferencia'}
        </p>
      </div>
      <TransferirWizard
        monedas={monedas ?? []}
        tasas={tasas ?? []}
        destinatarios={destinatarios ?? []}
        cuentasApp={cuentasApp ?? []}
        billeteras={billeteras ?? []}
        propositos={propositos ?? []}
        puntosRetiro={puntosRetiro ?? []}
        repetirData={repetirData}
        descuentoReferido={descuentoReferido}
      />
    </div>
  )
}
