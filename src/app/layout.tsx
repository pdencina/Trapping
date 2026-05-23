import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Trapping | Envío de Remesas', template: '%s | Trapping' },
  description: 'Plataforma de envío de dinero al exterior. Rápido, seguro y confiable.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://trapping.vercel.app'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
