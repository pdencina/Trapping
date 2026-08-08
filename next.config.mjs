import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Forzar nuevo buildId en cada deploy para invalidar caché de Vercel
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  // Sentry config options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Solo subir sourcemaps si hay auth token
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Ocultar sourcemaps de la build final (seguridad)
  hideSourceMaps: true,

  // Deshabilitar el widget de feedback (no necesario para esta app)
  disableLogger: true,

  // Tunelizar eventos via API route para evitar ad-blockers
  tunnelRoute: '/monitoring',

  // Instrumentar automáticamente server actions
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
})
