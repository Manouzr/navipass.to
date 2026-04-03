import { cn } from '@/lib/cn'
import Image from 'next/image'

const IDF_LOGO_FULL = 'https://www.emploipublic.fr/mediatheque/9/8/4/000016489.jpg'
const IDF_ICON = 'https://play-lh.googleusercontent.com/LJD2yoFM-4bNLJ5xUFg5pKAFWKZW7eCx3UQf2RGC3qoUm11N665BaKPyPefXhcfSqEo'

interface PageHeaderProps {
  greeting?: string
  title: string
  className?: string
}

export function PageHeader({ greeting, title, className }: PageHeaderProps) {
  return (
    <div
      className={cn('bg-white px-5 pt-3 pb-3', className)}
      style={{ paddingTop: 'max(12px, calc(env(safe-area-inset-top) + 8px))' }}
    >
      {/* Top row: logo gauche + icône droite */}
      <div className="flex items-center justify-between mb-2">
        {/* Logo IDF Mobilités avec texte — haut gauche */}
        <Image
          src={IDF_LOGO_FULL}
          alt="île-de-France mobilités"
          width={130}
          height={40}
          className="object-contain"
          style={{ maxHeight: '36px', width: 'auto' }}
          unoptimized
        />

        {/* Icône sans texte — haut droite */}
        <Image
          src={IDF_ICON}
          alt="IDF Mobilités"
          width={36}
          height={36}
          className="rounded-[9px] object-cover"
          unoptimized
        />
      </div>

      {/* Section label + grand titre */}
      {greeting && (
        <p className="text-sm text-text-secondary">{greeting}</p>
      )}
      <h1 className="text-[28px] font-black text-text-primary leading-tight tracking-tight">
        {title}
      </h1>
    </div>
  )
}

/** Icône seule, pour usage interne (NavigoCard, etc.) */
export function IDFIcon({ size = 32 }: { size?: number }) {
  return (
    <Image
      src={IDF_ICON}
      alt="IDF Mobilités"
      width={size}
      height={size}
      className="rounded-[8px] object-cover"
      unoptimized
    />
  )
}

/** Logo complet avec texte */
export function IDFLogoFull({ height = 32 }: { height?: number }) {
  return (
    <Image
      src={IDF_LOGO_FULL}
      alt="île-de-France mobilités"
      width={120}
      height={height}
      className="object-contain"
      style={{ height: `${height}px`, width: 'auto' }}
      unoptimized
    />
  )
}
