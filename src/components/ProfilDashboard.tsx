'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, ChevronRight, ArrowRight } from 'lucide-react'
import { OrderStatus, PlanType } from '@prisma/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { NavigoCard } from '@/components/ui/NavigoCard'
import { NavigoCard3D } from '@/components/ui/NavigoCard3D'
import { CredentialsCopyBlock } from '@/components/CredentialsCopyBlock'
import { PLAN_LABELS, formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface OrderData {
  id: string
  orderNumber: string
  status: OrderStatus
  planType: PlanType
  amount: number
  createdAt: Date
  deliveredAt: Date | null
  accountExpiry: Date | null
  accountEmail: string | null
  accountPassword: string | null
}

interface Props {
  email: string
  orders: OrderData[]
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
}

export function ProfilDashboard({ email, orders }: Props) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(
    orders.find((o) => o.status === 'DELIVERED')?.id ?? orders[0]?.id ?? null
  )

  const activeOrder = orders.find((o) => o.id === activeOrderId) ?? orders[0]

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/profil-auth', { method: 'DELETE' })
    router.refresh()
  }

  const greeting = email.split('@')[0]

  return (
    <>
      {/* ════════════════ MOBILE ════════════════ */}
      <div className="lg:hidden min-h-screen bg-white">
        <PageHeader greeting={`Bonjour, ${greeting}`} title="Gérer mon compte" />

        <div className="px-5 pt-4 pb-8 space-y-5">

          {/* Carte active */}
          {activeOrder && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-text-secondary">Forfait actif</p>
                  <p className="text-sm font-bold text-text-primary">{PLAN_LABELS[activeOrder.planType]}</p>
                </div>
                <StatusBadge status={activeOrder.status} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.12 }}
                className="flex justify-center"
              >
                <NavigoCard
                  status={activeOrder.status}
                  accountEmail={activeOrder.accountEmail}
                  accountExpiry={activeOrder.accountExpiry}
                  className="max-w-[240px]"
                />
              </motion.div>

              {activeOrder.status === 'DELIVERED' && activeOrder.accountEmail && activeOrder.accountPassword && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                >
                  <CredentialsCopyBlock
                    accountEmail={activeOrder.accountEmail}
                    accountPassword={activeOrder.accountPassword}
                    accountExpiry={activeOrder.accountExpiry}
                  />
                </motion.div>
              )}
            </>
          )}

          {/* Mes commandes */}
          {orders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            >
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 pl-1">Mes commandes</p>
              <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
                {orders.map((order, i) => (
                  <motion.button
                    key={order.id}
                    onClick={() => setActiveOrderId(order.id)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.07 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${i < orders.length - 1 ? 'border-b border-[#F3F4F6]' : ''} ${activeOrderId === order.id ? 'bg-[#EBF6FB]' : 'hover:bg-[#F9FAFB]'}`}
                  >
                    <div>
                      <p className="text-sm font-bold text-text-primary">{order.orderNumber}</p>
                      <p className="text-xs text-text-secondary">{PLAN_LABELS[order.planType]} · {formatDate(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Déconnexion */}
          <motion.button
            onClick={handleLogout}
            disabled={loggingOut}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-full py-4 text-base font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: '#F3F4F6', color: '#6B7280' }}
          >
            <LogOut size={18} />
            {loggingOut ? 'Déconnexion...' : 'Me déconnecter'}
          </motion.button>
        </div>
      </div>

      {/* ════════════════ DESKTOP ════════════════ */}
      <div className="hidden lg:block min-h-screen" style={{ background: '#0A1628' }}>
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(rgba(75,175,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,175,212,1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">

          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between mb-10">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4BAFD4] mb-1 block">Mon espace</span>
              <h1 className="text-4xl font-black text-white">Bonjour, <span className="gradient-text">{greeting}</span></h1>
              <p className="text-white/40 text-sm mt-1">{email}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors rounded-full px-4 py-2"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <LogOut size={16} />
              {loggingOut ? 'Déconnexion...' : 'Me déconnecter'}
            </motion.button>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-10">

            {/* Main */}
            <div className="space-y-6">

              {/* Identifiants si livré */}
              {activeOrder?.status === 'DELIVERED' && activeOrder.accountEmail && activeOrder.accountPassword && (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                  <CredentialsCopyBlock
                    accountEmail={activeOrder.accountEmail}
                    accountPassword={activeOrder.accountPassword}
                    accountExpiry={activeOrder.accountExpiry}
                  />
                </motion.div>
              )}

              {/* Commandes */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
                className="rounded-[20px] overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs font-bold text-[#4BAFD4] uppercase tracking-wider">Mes commandes</p>
                </div>
                {orders.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-white/40 text-sm">Aucune commande trouvée.</p>
                    <Link href="/commander" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#4BAFD4]">
                      Commander un pass <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  orders.map((order, i) => (
                    <motion.button
                      key={order.id}
                      onClick={() => setActiveOrderId(order.id)}
                      whileHover={{ backgroundColor: 'rgba(75,175,212,0.05)' }}
                      className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
                      style={{
                        borderBottom: i < orders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: activeOrderId === order.id ? 'rgba(75,175,212,0.1)' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: activeOrderId === order.id ? '#4BAFD4' : 'rgba(255,255,255,0.2)' }}
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{order.orderNumber}</p>
                          <p className="text-xs text-white/40">{PLAN_LABELS[order.planType]} · {formatPrice(order.amount)} · {formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <ChevronRight size={16} className="text-white/20" />
                      </div>
                    </motion.button>
                  ))
                )}
              </motion.div>

              {/* Status message if not delivered */}
              {activeOrder && activeOrder.status !== 'DELIVERED' && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={3}
                  className="rounded-[16px] p-5"
                  style={{ background: 'rgba(75,175,212,0.08)', border: '1px solid rgba(75,175,212,0.2)' }}
                >
                  <p className="text-sm font-semibold text-[#4BAFD4] mb-1">⏳ Commande en cours de traitement</p>
                  <p className="text-sm text-white/50">
                    Votre compte IDF Mobilités est en cours de préparation. Vous recevrez un email dès que vos identifiants seront disponibles.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Sidebar: carte */}
            {activeOrder && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={1}
                className="flex flex-col items-center gap-5 sticky top-24"
              >
                <NavigoCard3D
                  status={activeOrder.status}
                  accountEmail={activeOrder.accountEmail}
                  accountExpiry={activeOrder.accountExpiry}
                  maxWidth={260}
                  floating
                />
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{PLAN_LABELS[activeOrder.planType]}</p>
                  <p className="text-xs text-white/40">{formatPrice(activeOrder.amount)}</p>
                  {activeOrder.deliveredAt && (
                    <p className="text-xs text-green-400 mt-1">Livré le {formatDate(activeOrder.deliveredAt)}</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
