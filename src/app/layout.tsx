import type { Metadata, Viewport } from 'next'
import './globals.css'
import { BottomNav } from '@/components/ui/BottomNav'
import { DesktopNav } from '@/components/DesktopNav'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'NaviPass — Votre passe Navigo en ligne',
  description: 'Commandez votre passe Navigo IDF Mobilités en ligne. Simple, rapide et sécurisé.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NaviPass',
  },
  icons: { apple: '/icons/icon-192.png' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A1628',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0A1628" />
      </head>
      <body className="min-h-screen bg-[#F2F2F2] lg:bg-[#0A1628]">
        <ServiceWorkerRegistration />

        {/* ── Desktop nav (hidden on mobile) ── */}
        <DesktopNav />

        {/* ── Mobile: centered max-w-[430px] container ── */}
        <div className="lg:hidden flex justify-center bg-[#F2F2F2] min-h-screen">
          <div className="w-full max-w-[430px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.08)] relative">
            <main className="pb-[72px]">{children}</main>
            <BottomNav />
          </div>
        </div>

        {/* ── Desktop: full-width below fixed nav ── */}
        <div className="hidden lg:block pt-[64px] min-h-screen">
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
