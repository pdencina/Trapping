import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import './globals.css'
import './critical.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7c3aed',
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: { default: 'Trapping | Envío de Remesas', template: '%s | Trapping' },
  description: 'Envía dinero al exterior de forma rápida, segura y con las mejores tasas.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://trapping-green.vercel.app'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Trapping',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-brand-50 text-gray-900 antialiased font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
