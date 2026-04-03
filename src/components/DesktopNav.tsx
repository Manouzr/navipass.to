'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/commander', label: 'Commander' },
  { href: '/suivi', label: 'Suivi' },
  { href: '/profil', label: 'Profil' },
  { href: '/affilier', label: 'Devenir affilié' },
]

export function DesktopNav() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return null

  return (
    <header
      className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-[64px] items-center justify-between px-8 nav-blur border-b border-white/10"
      style={{ background: 'rgba(10,22,40,0.85)' }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{ background: '#4BAFD4' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://play-lh.googleusercontent.com/LJD2yoFM-4bNLJ5xUFg5pKAFWKZW7eCx3UQf2RGC3qoUm11N665BaKPyPefXhcfSqEo"
            alt="IDF"
            className="w-8 h-8 rounded-[9px] object-cover"
          />
        </div>
        <span className="text-white font-black text-lg tracking-tight group-hover:text-[#4BAFD4] transition-colors">
          NaviPass
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#4BAFD4]/20 text-[#4BAFD4]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* CTA */}
      <Link
        href="/commander"
        className="hidden lg:flex items-center gap-2 text-sm font-bold text-[#0A1628] rounded-full px-5 py-2.5 transition-all hover:scale-105 active:scale-95"
        style={{ background: '#4BAFD4', boxShadow: '0 0 20px rgba(75,175,212,0.4)' }}
      >
        Commander un pass →
      </Link>
    </header>
  )
}
