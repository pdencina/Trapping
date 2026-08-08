// src/lib/constants.ts
// Constantes centralizadas para la plataforma Trapping

/** Banderas emoji por código de moneda */
export const BANDERAS: Record<string, string> = {
  CLP: '🇨🇱',
  VES: '🇻🇪',
  COP: '🇨🇴',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  PEN: '🇵🇪',
  ARS: '🇦🇷',
  PAB: '🇵🇦',
}

/** Nombres legibles de cada moneda */
export const NOMBRES_MONEDA: Record<string, string> = {
  CLP: 'Peso chileno',
  VES: 'Bolívar venezolano',
  COP: 'Peso colombiano',
  USD: 'Dólar americano',
  EUR: 'Euro',
  PEN: 'Sol peruano',
  ARS: 'Peso argentino',
  PAB: 'Balboa panameño',
}

/** País destino por moneda */
export const PAISES_DESTINO: Record<string, string> = {
  VES: 'Venezuela',
  COP: 'Colombia',
  USD: 'Estados Unidos',
  EUR: 'España',
  PEN: 'Perú',
  ARS: 'Argentina',
  PAB: 'Panamá',
}

/** Países origen (donde se puede enviar desde) */
export const PAISES_ORIGEN: Record<string, string> = {
  CLP: 'Chile',
}

/** Número de WhatsApp de soporte (con código de país) */
export const WHATSAPP_SOPORTE = '+56912345678'

/** URL base de la app */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://trapping-green.vercel.app'
