'use client'

import { useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { OrderStatus } from '@prisma/client'
import { formatDate } from '@/lib/utils'

interface NavigoCard3DProps {
  status?: OrderStatus
  accountEmail?: string | null
  accountExpiry?: Date | null
  /** Taille max en px */
  maxWidth?: number
  /** Active le flottement automatique */
  floating?: boolean
}

export function NavigoCard3D({
  status = 'PENDING',
  accountEmail,
  accountExpiry,
  maxWidth = 300,
  floating = true,
}: NavigoCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Mouse-driven rotation
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 200,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 200,
    damping: 30,
  })

  // Sheen position
  const sheenX = useTransform(mouseX, [-0.5, 0.5], [-80, 80])
  const sheenY = useTransform(mouseY, [-0.5, 0.5], [-80, 80])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      mouseX.set(x)
      mouseY.set(y)
    },
    [mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }, [mouseX, mouseY])

  const isDelivered = status === 'DELIVERED'

  return (
    <div
      className="perspective-1000"
      style={{ width: maxWidth, maxWidth: '100%' }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          borderRadius: '8%',
        }}
        animate={
          !isHovered && floating
            ? {
                y: [0, -14, 0],
                rotate: [-1.5, -1.5, -1.5],
              }
            : { y: 0, rotate: 0 }
        }
        transition={
          !isHovered && floating
            ? {
                y: { duration: 4, ease: 'easeInOut', repeat: Infinity },
                rotate: { duration: 0 },
              }
            : { type: 'spring', stiffness: 300, damping: 30 }
        }
        whileHover={{ scale: 1.04 }}
        className="cursor-pointer select-none"
      >
        {/* ── Card SVG ── */}
        <div
          className="relative w-full"
          style={{
            aspectRatio: '429.82 / 677.79',
            borderRadius: '8%',
            clipPath: 'inset(0 round 8%)',
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cartenavigo.svg"
            alt="Carte Navigo"
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'fill', borderRadius: '8%' }}
            draggable={false}
          />

          {/* Holographic sheen overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: useTransform(
                [sheenX, sheenY],
                ([x, y]) =>
                  `radial-gradient(circle at ${50 + (x as number) * 0.5}% ${50 + (y as number) * 0.5}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
              ),
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s',
            }}
          />

          {/* Glow behind card */}
          <motion.div
            className="absolute inset-0 -z-10 rounded-[8%]"
            animate={{
              boxShadow: isHovered
                ? '0 30px 80px rgba(75,175,212,0.5), 0 0 40px rgba(75,175,212,0.2)'
                : '0 20px 60px rgba(75,175,212,0.25)',
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Dynamic info overlay — section bleue droite */}
          <div
            className="absolute flex flex-col justify-end"
            style={{ left: '42%', right: '4%', top: '40%', bottom: '8%' }}
          >
            {isDelivered && accountEmail ? (
              <motion.div
                className="flex flex-col gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p
                  className="font-bold text-white truncate"
                  style={{ fontSize: 'clamp(8px, 2.5vw, 12px)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {accountEmail}
                </p>
                {accountExpiry && (
                  <p className="text-white/80" style={{ fontSize: 'clamp(7px, 1.8vw, 10px)' }}>
                    Exp. {formatDate(accountExpiry)}
                  </p>
                )}
                <div
                  className="inline-flex items-center gap-1 self-start"
                  style={{
                    background: 'rgba(16,185,129,0.3)',
                    border: '1px solid rgba(16,185,129,0.6)',
                    borderRadius: '9999px',
                    padding: '2px 7px',
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-100 font-bold" style={{ fontSize: 'clamp(6px, 1.6vw, 9px)' }}>
                    Actif
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="animate-pulse rounded-full bg-white/20" style={{ height: '7px', width: '70%' }} />
                <div className="animate-pulse rounded-full bg-white/12" style={{ height: '7px', width: '45%' }} />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
