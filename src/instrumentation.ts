// src/instrumentation.ts
// Next.js instrumentation file — Sentry server + edge initialization
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry init
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      enabled: process.env.NODE_ENV === 'production',
      tracesSampleRate: 0.1,
      ignoreErrors: [
        'Invalid login credentials',
        'Email not confirmed',
        'NEXT_NOT_FOUND',
        'NEXT_REDIRECT',
      ],
      initialScope: {
        tags: { app: 'trapping', runtime: 'server' },
      },
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry init (middleware)
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      enabled: process.env.NODE_ENV === 'production',
      tracesSampleRate: 0.1,
    })
  }
}
