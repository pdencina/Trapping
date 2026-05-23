import { randomBytes } from 'crypto'

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

export default nextConfig
