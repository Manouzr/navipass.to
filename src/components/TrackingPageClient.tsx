'use client'

import { motion } from 'framer-motion'
import { OrderStatus, PlanType } from '@prisma/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OrderTimeline } from '@/components/OrderTimeline'
import { NavigoCard } from '@/components/ui/NavigoCard'
import { NavigoCard3D } from '@/components/ui/NavigoCard3D'
import { CredentialsCopyBlock } from '@/components/CredentialsCopyBlock'
import { PLAN_LABELS, formatPrice } from '@/lib/utils'

interface OrderData {
  orderNumber: string
  status: OrderStatus
  planType: PlanType
  firstName: string
  lastName: string
  email: string
  amount: number
  createdAt: Date
  stripePaidAt: Date | null
  deliveredAt: Date | null
  accountExpiry: Date | null
}

interface Props {
  order: OrderData
  accountEmail: string | null
  accountPassword: string | null
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
}

export function TrackingPageClient({ order, accountEmail, accountPassword }: Props) {
  const isDelivered = order.status === 'DELIVERED'

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-white">
        <PageHeader greeting="Ma commande" title={order.orderNumber} />
        <div className="px-5 pt-4 pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-secondary">Forfait</p>
              <p className="text-sm font-bold text-text-primary">{PLAN_LABELS[order.planType]}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="flex justify-center">
            <NavigoCard
              status={order.status}
              accountEmail={accountEmail}
              accountExpiry={order.accountExpiry}
              className="max-w-[240px]"
            />
          </div>

          {isDelivered && accountEmail && accountPassword && (
            <CredentialsCopyBlock
              accountEmail={accountEmail}
              accountPassword={accountPassword}
              accountExpiry={order.accountExpiry}
            />
          )}

          <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
            <div className="p-4 border-b border-[#F3F4F6]">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Suivi</p>
            </div>
            <div className="p-4">
              <OrderTimeline
                status={order.status}
                createdAt={order.createdAt}
                stripePaidAt={order.stripePaidAt}
                deliveredAt={order.deliveredAt}
              />
            </div>
          </div>

          <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
            <div className="p-4 border-b border-[#F3F4F6]">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Détails</p>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {[
                { label: 'N° commande', value: order.orderNumber },
                { label: 'Titulaire', value: `${order.firstName} ${order.lastName}` },
                { label: 'Email', value: order.email },
                { label: 'Montant', value: formatPrice(order.amount) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between px-4 py-3">
                  <span className="text-xs text-text-secondary">{label}</span>
                  <span className="text-xs font-semibold text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block min-h-screen" style={{ background: '#0A1628' }}>
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(75,175,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,175,212,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-10">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4BAFD4] mb-1 block">Ma commande</span>
                <h1 className="text-4xl font-black text-white">{order.orderNumber}</h1>
              </div>
              <StatusBadge status={order.status} />
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-10">
            {/* Main column */}
            <div className="space-y-6">

              {/* Credentials if delivered */}
              {isDelivered && accountEmail && accountPassword && (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                  <CredentialsCopyBlock
                    accountEmail={accountEmail}
                    accountPassword={accountPassword}
                    accountExpiry={order.accountExpiry}
                  />
                </motion.div>
              )}

              {/* Timeline */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
                className="rounded-[20px] p-8"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-xs font-bold text-[#4BAFD4] uppercase tracking-wider mb-6">Suivi de commande</p>
                <OrderTimeline
                  status={order.status}
                  createdAt={order.createdAt}
                  stripePaidAt={order.stripePaidAt}
                  deliveredAt={order.deliveredAt}
                />
              </motion.div>

              {/* Details */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={3}
                className="rounded-[20px] overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs font-bold text-[#4BAFD4] uppercase tracking-wider">Détails de la commande</p>
                </div>
                <div>
                  {[
                    { label: 'N° commande', value: order.orderNumber },
                    { label: 'Forfait', value: PLAN_LABELS[order.planType] },
                    { label: 'Titulaire', value: `${order.firstName} ${order.lastName}` },
                    { label: 'Email', value: order.email },
                    { label: 'Montant', value: formatPrice(order.amount) },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between px-6 py-3.5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <span className="text-sm text-white/40">{label}</span>
                      <span className="text-sm font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar: card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="flex flex-col items-center gap-4 sticky top-24"
            >
              <NavigoCard3D
                status={order.status}
                accountEmail={accountEmail}
                accountExpiry={order.accountExpiry}
                maxWidth={240}
                floating
              />
              <div className="text-center">
                <p className="text-sm font-bold text-white">{PLAN_LABELS[order.planType]}</p>
                <p className="text-xs text-white/40">{formatPrice(order.amount)}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
