// sentry.server.config.ts
// Configuración de Sentry para el servidor (Node.js)
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Solo activar en producción
  enabled: process.env.NODE_ENV === 'production',

  // Performance monitoring server-side
  tracesSampleRate: 0.1, // 10% de las transacciones

  // No capturar errores de auth esperados
  ignoreErrors: [
    'Invalid login credentials',
    'Email not confirmed',
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],

  // Tags globales
  initialScope: {
    tags: {
      app: 'trapping',
      runtime: 'server',
    },
  },
})
