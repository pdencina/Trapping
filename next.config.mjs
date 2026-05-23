/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Deshabilitar partial prerendering que causa CSS vacío en el shell
  experimental: {
    optimizeCss: false,
  },
}

export default nextConfig
