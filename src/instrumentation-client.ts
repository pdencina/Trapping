// src/instrumentation-client.ts
// Configuración de Sentry para el cliente (browser)
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Solo activar en producción
  enabled: process.env.NODE_ENV === 'production',

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% de las transacciones

  // Session replay para debugging visual
  replaysSessionSampleRate: 0.01, // 1% de las sesiones
  replaysOnErrorSampleRate: 1.0,  // 100% cuando hay error

  // No enviar errores de red genéricos
  ignoreErrors: [
    'ResizeObserver loop',
    'Non-Error promise rejection',
    'AbortError',
    'Network request failed',
    'Load failed',
  ],

  // Tags globales
  initialScope: {
    tags: {
      app: 'trapping',
      platform: 'web',
    },
  },
})
