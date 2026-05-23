// src/types/database.ts
// Tipos TypeScript generados desde el schema de Supabase

export type ValidadoStatus = 0 | 1 | 2 | 4
export type UserRole = 'Admin' | 'User'
export type ClaseCuenta = 'Persona' | 'Empresa'
export type MonedaCode = 'CLP' | 'USD' | 'ARS' | 'COP' | 'VES' | 'PAB' | 'PEN'
export type TipoMovimiento = 'recarga' | 'envio' | 'retiro'
export type EstadoOperacionBilletera = 'pendiente' | 'aprobado' | 'rechazado'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          tipo_documento_id: number | null
          rut: string | null
          name: string | null
          lastname: string | null
          nacimiento: string | null
          genero: string | null
          region_id: number | null
          comuna_id: number | null
          direccion: string | null
          fono: string | null
          celular: string | null
          nacionalidad_id: number | null
          status: boolean
          cargo: string | null
          validado: ValidadoStatus
          role: UserRole
          foto: string | null
          documento: string | null
          observaciones: string | null
          terms: boolean
          last_login: string | null
          total_login: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      paises: {
        Row: { id: number; nombre_pais: string; siglas: string | null; estatus: boolean; created_at: string; updated_at: string; deleted_at: string | null }
        Insert: Omit<Database['public']['Tables']['paises']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['paises']['Insert']>
      }
      bancos: {
        Row: { id: number; codigo: string; nombre_banco: string; pais_id: number; swift: string | null; created_at: string; updated_at: string; deleted_at: string | null }
        Insert: Omit<Database['public']['Tables']['bancos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bancos']['Insert']>
      }
      monedas: {
        Row: { id: number; pais_id: number; moneda: string; acronimo: string; icono: string | null; bank_origen: boolean; bank_destino: boolean; created_at: string; updated_at: string; deleted_at: string | null }
        Insert: Omit<Database['public']['Tables']['monedas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['monedas']['Insert']>
      }
      tasas: {
        Row: { id: number; moneda_origen: string; valor: number; moneda_destino: string; monto_minimo: number; monto_maximo: number; impuesto_moneda_origen: number; activo: boolean; created_at: string; updated_at: string; deleted_at: string | null }
        Insert: Omit<Database['public']['Tables']['tasas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasas']['Insert']>
      }
      tipos_documentos: {
        Row: { id: number; nombre_documento: string; created_at: string; updated_at: string; deleted_at: string | null }
        Insert: Omit<Database['public']['Tables']['tipos_documentos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tipos_documentos']['Insert']>
      }
      tipos_cuentas: {
        Row: { id: number; nombre_tipo: string; created_at: string; updated_at: string; deleted_at: string | null }
        Insert: Omit<Database['public']['Tables']['tipos_cuentas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tipos_cuentas']['Insert']>
      }
      estatus_operaciones: {
        Row: { id: number; nombre_estatus: string; created_at: string; updated_at: string; deleted_at: string | null }
        Insert: Omit<Database['public']['Tables']['estatus_operaciones']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['estatus_operaciones']['Insert']>
      }
      operaciones_propositos: {
        Row: { id: number; nombre_proposito: string | null; created_at: string; updated_at: string; deleted_at: string | null }
        Insert: Omit<Database['public']['Tables']['operaciones_propositos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['operaciones_propositos']['Insert']>
      }
      destinatarios: {
        Row: {
          id: number; user_id: string; rut: string; tipo_documento_id: number | null
          name: string | null; lastname: string | null; genero: string | null
          direccion: string | null; email: string | null; fono: string | null
          celular: string | null; pais_id: number; nacionalidad_id: number | null
          estatus: boolean; favorito: boolean
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['destinatarios']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['destinatarios']['Insert']>
      }
      cuentas_destinatarios: {
        Row: {
          id: number; destinatario_id: number; rut: string; tipo_documento_id: number
          banco_id: number; tipo_cuenta_id: number; clase_cuenta: ClaseCuenta
          razon_social: string | null; numero_cuenta: string; favorito: boolean
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['cuentas_destinatarios']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cuentas_destinatarios']['Insert']>
      }
      cuentas: {
        Row: {
          id: number; rut: string | null; tipo_documento_id: number; name: string | null
          lastname: string | null; banco_id: number; tipo_cuenta_id: number
          clase_cuenta: ClaseCuenta; razon_social: string | null; email: string | null
          numero_cuenta: string; principal: boolean; estatus: boolean
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['cuentas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cuentas']['Insert']>
      }
      billeteras: {
        Row: { id: number; user_id: string; moneda: MonedaCode; saldo: number; created_at: string; updated_at: string; deleted_at: string | null }
        Insert: Omit<Database['public']['Tables']['billeteras']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['billeteras']['Insert']>
      }
      operaciones: {
        Row: {
          id: number; user_id: string; codigo_operacion: string
          cuenta_destinatario_id: number; monto_origen: number; moneda_origen: string
          tasa_id: number; monto_destino: number; moneda_destino: string
          proposito_id: number; boucher: string | null; codigo_boucher: string | null
          cuenta_app_id: number | null; boucher_transferencia: string | null
          observaciones: string | null; estatus_id: number
          origen: boolean; billetera_id: number | null
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['operaciones']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['operaciones']['Insert']>
      }
      operaciones_billeteras: {
        Row: {
          id: number; user_id: string; billetera_id: number; moneda: MonedaCode
          monto: number; monto_aprobado: number | null; comprobante: string
          num_comprobante: string | null; estado: EstadoOperacionBilletera
          codigo_operacion: string; observaciones: string | null
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['operaciones_billeteras']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['operaciones_billeteras']['Insert']>
      }
      billeteras_historial: {
        Row: {
          id: number; user_id: string; billetera_id: number
          operacion_id: number | null; operacion_billetera_id: number | null
          tipo: TipoMovimiento; saldo_billetera: number; moneda_billetera: MonedaCode
          monto_conversion: number | null; moneda_conversion: MonedaCode | null
          monto_aprobado: number | null; moneda_aprobado: string | null
          detalle: string | null; admin_id: string; is_corregido: boolean
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['billeteras_historial']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['billeteras_historial']['Insert']>
      }
    }
    Views: {}
    Functions: {
      is_admin: { Args: {}; Returns: boolean }
      is_validated_user: { Args: {}; Returns: boolean }
    }
    Enums: {}
  }
}

// Tipos helpers para uso en componentes
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Pais = Database['public']['Tables']['paises']['Row']
export type Banco = Database['public']['Tables']['bancos']['Row']
export type Moneda = Database['public']['Tables']['monedas']['Row']
export type Tasa = Database['public']['Tables']['tasas']['Row']
export type Destinatario = Database['public']['Tables']['destinatarios']['Row']
export type CuentaDestinatario = Database['public']['Tables']['cuentas_destinatarios']['Row']
export type Cuenta = Database['public']['Tables']['cuentas']['Row']
export type Billetera = Database['public']['Tables']['billeteras']['Row']
export type Operacion = Database['public']['Tables']['operaciones']['Row']
export type OperacionBilletera = Database['public']['Tables']['operaciones_billeteras']['Row']
export type BilleteraHistorial = Database['public']['Tables']['billeteras_historial']['Row']
export type TipoDocumento = Database['public']['Tables']['tipos_documentos']['Row']
export type TipoCuenta = Database['public']['Tables']['tipos_cuentas']['Row']
export type EstatusOperacion = Database['public']['Tables']['estatus_operaciones']['Row']
export type OperacionProposito = Database['public']['Tables']['operaciones_propositos']['Row']

// Tipos enriquecidos con joins
export type OperacionConRelaciones = Operacion & {
  estatus_operaciones: EstatusOperacion
  tasas: Tasa
  cuentas_destinatarios: CuentaDestinatario & {
    destinatarios: Destinatario & { paises: Pais }
    bancos: Banco
    tipos_cuentas: TipoCuenta
  }
  operaciones_propositos: OperacionProposito
  cuentas?: Cuenta & { bancos: Banco }
}

export type DestinatarioConCuentas = Destinatario & {
  paises: Pais
  cuentas_destinatarios: (CuentaDestinatario & { bancos: Banco; tipos_cuentas: TipoCuenta })[]
}

// Estado del wizard de transferencia
export interface WizardState {
  step: 1 | 2 | 3 | 4
  // Paso 1: Monto
  monedaOrigen: string
  monedaDestino: string
  montoOrigen: number | null
  montoDestino: number | null
  tasaId: number | null
  tasaValor: number | null
  comision: number
  impuesto: number
  total: number
  codigoDescuento: string
  descuentoAplicado: boolean
  // Paso 2: Destinatario
  cuentaDestinatarioId: number | null
  siglaPais: string
  // Paso 3: Pago
  cuentaAppId: number | null
  billeteraId: number | null
  propositoId: number | null
  boucher: File | null
  // Paso 4: Confirmación
  codigoOperacion?: string
}
