import { OrderStatus } from '@prisma/client'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/utils'

interface NavigoCardProps {
  status: OrderStatus
  accountEmail?: string | null
  accountExpiry?: Date | null
  className?: string
  /** Légère inclinaison pour la landing page */
  tilt?: boolean
}

export function NavigoCard({ status, accountEmail, accountExpiry, className, tilt }: NavigoCardProps) {
  const isDelivered = status === 'DELIVERED'

  // La carte SVG est portrait (429.82 × 677.79)
  // Section sombre : gauche (0 → 40% de la largeur)
  // Section bleue  : droite (40% → 100%)
  // On superpose les infos dans la section bleue (droite)

  return (
    <div
      className={cn('relative w-full select-none', className)}
      style={{
        aspectRatio: '429.82 / 677.79',
        transform: tilt ? 'rotate(-1.5deg)' : undefined,
        filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.22))',
        maxWidth: '260px',
        margin: '0 auto',
      }}
    >
      {/* SVG de la vraie carte Navigo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/cartenavigo.svg"
        alt="Carte Navigo"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'fill' }}
      />

      {/* Overlay — section bleue droite (left: 40%) */}
      <div
        className="absolute flex flex-col justify-end"
        style={{
          left: '42%',
          right: '4%',
          top: '40%',
          bottom: '8%',
        }}
      >
        {isDelivered && accountEmail ? (
          <div className="flex flex-col gap-1">
            <p
              className="font-bold text-white truncate"
              style={{ fontSize: 'clamp(8px, 2.5vw, 13px)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
            >
              {accountEmail}
            </p>
            {accountExpiry && (
              <p
                className="text-white/80"
                style={{ fontSize: 'clamp(7px, 2vw, 10px)' }}
              >
                Exp. {formatDate(accountExpiry)}
              </p>
            )}
            <div
              className="inline-flex items-center gap-1 self-start mt-1"
              style={{
                background: 'rgba(16,185,129,0.25)',
                border: '1px solid rgba(16,185,129,0.6)',
                borderRadius: '9999px',
                padding: '2px 8px',
              }}
            >
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <span style={{ color: '#D1FAE5', fontSize: 'clamp(7px, 1.8vw, 10px)', fontWeight: 700 }}>
                Actif
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="animate-pulse rounded-full bg-white/25" style={{ height: '8px', width: '75%' }} />
            <div className="animate-pulse rounded-full bg-white/15" style={{ height: '8px', width: '50%' }} />
            <p className="text-white/50" style={{ fontSize: 'clamp(7px, 1.8vw, 10px)' }}>
              En attente...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
