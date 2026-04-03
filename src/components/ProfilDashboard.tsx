'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ChevronDown, ArrowRight, Lock, Mail, AlertTriangle, Copy, Check } from 'lucide-react'
import { OrderStatus, PlanType } from '@prisma/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { NavigoCard } from '@/components/ui/NavigoCard'
import { NavigoCard3D } from '@/components/ui/NavigoCard3D'
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
  accountIssueReported: boolean
}

interface Props {
  email: string
  orders: OrderData[]
  credentialsUnlocked: boolean
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
}

// ── Copy button ────────────────────────────────────────────
function CopyBtn({ value, dark = false }: { value: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
      style={{ background: dark ? 'rgba(75,175,212,0.15)' : '#EBF6FB' }}
    >
      {copied
        ? <Check size={13} style={{ color: '#4BAFD4' }} />
        : <Copy size={13} style={{ color: '#4BAFD4' }} />
      }
    </button>
  )
}

// ── OTP unlock inline component ────────────────────────────
function OtpUnlockBlock({ email, dark = false }: { email: string; dark?: boolean }) {
  const router = useRouter()
  const [step, setStep] = useState<'idle' | 'sent'>('idle')
  const [challengeToken, setChallengeToken] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  async function sendCode() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/profil-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setChallengeToken(data.challengeToken)
      setStep('sent')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  async function verifyCode(finalOtp: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/profil-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', challengeToken, otp: finalOtp }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.refresh()
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  function handleDigit(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const arr = Array.from({ length: 6 }, (_, k) => otp[k] ?? '')
    arr[i] = digit
    const newOtp = arr.join('')
    setOtp(newOtp)
    if (digit && i < 5) inputsRef.current[i + 1]?.focus()
    if (newOtp.replace(/\s/g, '').length === 6 && !newOtp.includes('')) {
      verifyCode(newOtp)
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus()
      const arr = Array.from({ length: 6 }, (_, k) => otp[k] ?? '')
      arr[i - 1] = ''
      setOtp(arr.join(''))
    }
  }

  const bg = dark ? 'rgba(75,175,212,0.06)' : '#F0F9FF'
  const border = dark ? '1px solid rgba(75,175,212,0.2)' : '1px solid #BAE6FD'
  const labelColor = dark ? 'rgba(255,255,255,0.7)' : '#0369A1'
  const subColor = dark ? 'rgba(255,255,255,0.4)' : '#4BAFD4'
  const inputBg = dark ? 'rgba(255,255,255,0.08)' : '#fff'
  const inputBorder = dark ? 'rgba(255,255,255,0.15)' : '#BAE6FD'
  const inputColor = dark ? '#fff' : '#0A1628'

  return (
    <div className="rounded-[14px] p-4" style={{ background: bg, border }}>
      {step === 'idle' ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: dark ? 'rgba(75,175,212,0.15)' : '#fff' }}>
              <Lock size={16} style={{ color: '#4BAFD4' }} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: labelColor }}>Identifiants protégés</p>
              <p className="text-[11px] mt-0.5" style={{ color: subColor }}>Vérifiez votre identité par email</p>
            </div>
          </div>
          <motion.button
            onClick={sendCode}
            disabled={loading}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shrink-0 disabled:opacity-50"
            style={{ background: '#4BAFD4', color: '#0A1628' }}
          >
            <Mail size={12} />
            {loading ? 'Envoi...' : 'Recevoir un code'}
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold" style={{ color: labelColor }}>
            Code envoyé à <span style={{ color: '#4BAFD4' }}>{email}</span>
          </p>
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[i] ?? ''}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-9 h-11 text-center text-base font-black rounded-[10px] outline-none transition-colors"
                style={{
                  background: inputBg,
                  border: `1px solid ${otp[i] ? '#4BAFD4' : inputBorder}`,
                  color: inputColor,
                }}
              />
            ))}
            {loading && (
              <div className="flex items-center pl-2">
                <div className="w-4 h-4 border-2 border-[#4BAFD4] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <button onClick={() => { setStep('idle'); setOtp(''); setError(null) }} className="text-[11px] underline" style={{ color: subColor }}>
            Renvoyer le code
          </button>
        </div>
      )}
    </div>
  )
}

// ── Report issue button ────────────────────────────────────
function ReportIssueBlock({ orderId, dark = false }: { orderId: string; dark?: boolean }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function report() {
    setLoading(true)
    try {
      const res = await fetch('/api/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      if (res.ok) { setDone(true); router.refresh() }
    } finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="rounded-[12px] p-3 flex items-center gap-2" style={{ background: dark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: dark ? '1px solid rgba(239,68,68,0.2)' : '1px solid #FECACA' }}>
        <AlertTriangle size={14} className="text-red-500 shrink-0" />
        <p className="text-xs font-semibold text-red-600">Problème signalé — notre équipe va vous contacter.</p>
      </div>
    )
  }

  if (confirm) {
    return (
      <div className="rounded-[12px] p-3 space-y-2" style={{ background: dark ? 'rgba(239,68,68,0.08)' : '#FEF2F2', border: dark ? '1px solid rgba(239,68,68,0.2)' : '1px solid #FECACA' }}>
        <p className="text-xs font-semibold text-red-600">Confirmer le signalement ?</p>
        <div className="flex gap-2">
          <button onClick={report} disabled={loading}
            className="flex-1 text-xs font-bold py-2 rounded-lg bg-red-500 text-white disabled:opacity-50">
            {loading ? 'Envoi...' : 'Oui, signaler'}
          </button>
          <button onClick={() => setConfirm(false)}
            className="flex-1 text-xs font-bold py-2 rounded-lg" style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#F3F4F6', color: dark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}>
            Annuler
          </button>
        </div>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirm(true)}
      className="flex items-center gap-1.5 text-xs font-medium w-full justify-center py-2 rounded-[10px] transition-colors"
      style={{ color: dark ? 'rgba(255,100,100,0.7)' : '#EF4444', background: dark ? 'rgba(239,68,68,0.06)' : '#FEF2F2' }}>
      <AlertTriangle size={12} />
      Signaler un problème avec ce compte
    </button>
  )
}

// ── Expanded order content ─────────────────────────────────
function OrderExpanded({
  order,
  credentialsUnlocked,
  email,
  dark = false,
}: {
  order: OrderData
  credentialsUnlocked: boolean
  email: string
  dark?: boolean
}) {
  const labelColor = dark ? 'rgba(255,255,255,0.4)' : '#6B7280'
  const valueColor = dark ? '#fff' : '#1A1A2E'
  const divider = dark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'

  if (order.status !== 'DELIVERED') {
    return (
      <div className="px-4 pb-4 pt-2">
        <div className="rounded-[12px] p-3 flex items-center gap-3" style={{ background: dark ? 'rgba(75,175,212,0.06)' : '#EBF6FB', border: dark ? '1px solid rgba(75,175,212,0.15)' : '1px solid #BAE6FD' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#4BAFD4] animate-pulse shrink-0" />
          <p className="text-xs" style={{ color: dark ? 'rgba(255,255,255,0.5)' : '#0369A1' }}>
            Votre compte est en cours de préparation. Les identifiants apparaîtront ici dès la livraison.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4 pt-1 space-y-3">
      {credentialsUnlocked && order.accountEmail && order.accountPassword ? (
        <>
          {/* Email */}
          <div className="rounded-[12px] p-3" style={{ background: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB', border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Email IDF Mobilités</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold truncate" style={{ color: valueColor }}>{order.accountEmail}</p>
              <CopyBtn value={order.accountEmail} dark={dark} />
            </div>
          </div>
          {/* Mot de passe */}
          <div className="rounded-[12px] p-3" style={{ background: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB', border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Mot de passe</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-mono font-semibold tracking-wider" style={{ color: valueColor }}>{order.accountPassword}</p>
              <CopyBtn value={order.accountPassword} dark={dark} />
            </div>
          </div>
          {/* Expiration */}
          {order.accountExpiry && (
            <p className="text-[11px] text-center" style={{ color: labelColor }}>
              Expire le {formatDate(order.accountExpiry)}
            </p>
          )}

          {/* Issue report or reported badge */}
          {order.accountIssueReported ? (
            <div className="rounded-[12px] p-3 flex items-center gap-2" style={{ background: dark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: dark ? '1px solid rgba(239,68,68,0.2)' : '1px solid #FECACA' }}>
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              <p className="text-xs font-semibold text-red-600">Problème signalé — notre équipe va vous recontacter.</p>
            </div>
          ) : (
            <ReportIssueBlock orderId={order.id} dark={dark} />
          )}
        </>
      ) : (
        <OtpUnlockBlock email={email} dark={dark} />
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────
export function ProfilDashboard({ email, orders, credentialsUnlocked }: Props) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [openOrderId, setOpenOrderId] = useState<string | null>(
    orders.find((o) => o.status === 'DELIVERED')?.id ?? orders[0]?.id ?? null
  )

  const activeOrder = orders.find((o) => o.id === openOrderId) ?? orders[0]

  function toggle(id: string) {
    setOpenOrderId((prev) => (prev === id ? null : id))
  }

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/profil-auth', { method: 'DELETE' })
    await fetch('/api/profil-verify', { method: 'DELETE' })
    router.refresh()
  }

  const greeting = email.split('@')[0]

  return (
    <>
      {/* ════════════════ MOBILE ════════════════ */}
      <div className="lg:hidden min-h-screen bg-white">
        <PageHeader greeting={`Bonjour, ${greeting}`} title="Gérer mon compte" />

        <div className="px-5 pt-4 pb-8 space-y-5">

          {/* Carte de la commande ouverte */}
          {activeOrder && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.1 }}
              className="flex justify-center"
            >
              <NavigoCard
                status={activeOrder.status}
                accountEmail={activeOrder.accountEmail}
                accountExpiry={activeOrder.accountExpiry}
                className="max-w-[230px]"
              />
            </motion.div>
          )}

          {/* Mes commandes — accordion */}
          {orders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            >
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 pl-1">Mes commandes</p>
              <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
                {orders.map((order, i) => {
                  const isOpen = openOrderId === order.id
                  return (
                    <div key={order.id} style={{ borderBottom: i < orders.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      {/* Header row */}
                      <motion.button
                        onClick={() => toggle(order.id)}
                        whileTap={{ scale: 0.99 }}
                        className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors"
                        style={{ background: isOpen ? '#EBF6FB' : 'transparent' }}
                      >
                        <div>
                          <p className="text-sm font-bold text-text-primary">{order.orderNumber}</p>
                          <p className="text-xs text-text-secondary">{PLAN_LABELS[order.planType]} · {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {order.accountIssueReported && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                              <AlertTriangle size={9} /> Problème
                            </span>
                          )}
                          <StatusBadge status={order.status} />
                          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={16} className="text-text-secondary" />
                          </motion.div>
                        </div>
                      </motion.button>

                      {/* Expanded content */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <OrderExpanded
                              order={order}
                              credentialsUnlocked={credentialsUnlocked}
                              email={email}
                              dark={false}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Déconnexion */}
          <motion.button
            onClick={handleLogout}
            disabled={loggingOut}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-full py-4 text-base font-semibold flex items-center justify-center gap-2"
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

          <div className="grid lg:grid-cols-[1fr_300px] gap-10">

            {/* Main */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
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
                orders.map((order, i) => {
                  const isOpen = openOrderId === order.id
                  return (
                    <div
                      key={order.id}
                      style={{ borderBottom: i < orders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      {/* Header row */}
                      <motion.button
                        onClick={() => toggle(order.id)}
                        whileHover={{ backgroundColor: 'rgba(75,175,212,0.04)' }}
                        className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
                        style={{ background: isOpen ? 'rgba(75,175,212,0.08)' : 'transparent' }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: isOpen ? '#4BAFD4' : 'rgba(255,255,255,0.2)' }} />
                          <div>
                            <p className="text-sm font-bold text-white">{order.orderNumber}</p>
                            <p className="text-xs text-white/40">{PLAN_LABELS[order.planType]} · {formatPrice(order.amount)} · {formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {order.accountIssueReported && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                              <AlertTriangle size={9} /> Problème
                            </span>
                          )}
                          <StatusBadge status={order.status} />
                          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={16} className="text-white/30" />
                          </motion.div>
                        </div>
                      </motion.button>

                      {/* Expanded */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="px-6 pb-6 pt-1">
                              <OrderExpanded
                                order={order}
                                credentialsUnlocked={credentialsUnlocked}
                                email={email}
                                dark
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              )}
            </motion.div>

            {/* Sidebar: carte */}
            {activeOrder && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
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
