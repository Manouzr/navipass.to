'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Copy, Check, TrendingUp, Wallet, Users, ArrowRight } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { getAffiliateByEmail } from '@/actions/affiliate'
import { formatPrice, formatDate, PLAN_LABELS } from '@/lib/utils'
import { PageHeader } from '@/components/ui/PageHeader'
import Link from 'next/link'

type AffiliateData = Awaited<ReturnType<typeof getAffiliateByEmail>>

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'En attente', color: '#92400E', bg: '#FEF3C7' },
  ACTIVE: { label: 'Actif', color: '#065F46', bg: '#D1FAE5' },
  SUSPENDED: { label: 'Suspendu', color: '#991B1B', bg: '#FEE2E2' },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 } }),
}

export default function AffilierDashboardPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const data = await getAffiliateByEmail(email)
    if (!data) { setError('Aucun compte affilié trouvé pour cet email.'); setLoading(false); return }
    setAffiliate(data)
    setLoading(false)
  }

  function copyLink() {
    if (!affiliate) return
    navigator.clipboard.writeText(`https://navipass.to/commander?ref=${affiliate.code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://navipass.to'

  return (
    <>
      {/* ── MOBILE ── */}
      <div className="lg:hidden min-h-screen bg-white">
        <PageHeader greeting="Affilié" title="Mon tableau de bord" />
        <div className="px-5 pt-4 pb-24 space-y-5">

          {!affiliate ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
                <div className="p-4 border-b border-[#F3F4F6]">
                  <p className="text-xs font-bold text-text-primary uppercase tracking-wider">Accéder à mon espace</p>
                </div>
                <form onSubmit={handleSearch} className="p-4 space-y-4">
                  <p className="text-sm text-text-secondary">Entrez l&apos;email utilisé lors de votre inscription affilié.</p>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jean@exemple.fr"
                    className="w-full h-12 rounded-[12px] border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#4BAFD4] bg-white text-text-primary" />
                  {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: '#4BAFD4' }}>
                    <Search size={18} />
                    {loading ? 'Recherche...' : 'Accéder'}
                  </button>
                </form>
              </div>
              <div className="text-center mt-3">
                <Link href="/affilier" className="text-xs text-[#4BAFD4] underline">Pas encore affilié ? S&apos;inscrire →</Link>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Status */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary">Bonjour,</p>
                  <p className="text-sm font-bold text-text-primary">{affiliate.firstName} {affiliate.lastName}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: STATUS_LABELS[affiliate.status]?.bg, color: STATUS_LABELS[affiliate.status]?.color }}>
                  {STATUS_LABELS[affiliate.status]?.label}
                </span>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Wallet, label: 'Solde', value: formatPrice(affiliate.balance), color: '#4BAFD4' },
                  { icon: TrendingUp, label: 'Total gagné', value: formatPrice(affiliate.totalEarned), color: '#059669' },
                  { icon: Users, label: 'Filleuls', value: affiliate.referrals.length, color: '#7C3AED' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}
                    className="bg-white rounded-[16px] border border-[#E5E7EB] p-4">
                    <Icon size={18} style={{ color }} className="mb-2" />
                    <p className="text-xs text-text-secondary">{label}</p>
                    <p className="text-xl font-black text-text-primary mt-0.5">{value}</p>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, delay: 0.1 }}
                  className="bg-white rounded-[16px] border border-[#E5E7EB] p-4">
                  <p className="text-xs text-text-secondary mb-1">Code</p>
                  <p className="text-lg font-black" style={{ color: '#4BAFD4' }}>{affiliate.code}</p>
                </motion.div>
              </div>

              {/* Lien + QR */}
              <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-4 space-y-3">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Votre lien de parrainage</p>
                <div className="flex items-center gap-2 bg-[#F9FAFB] rounded-[12px] border border-[#E5E7EB] px-3 py-3">
                  <p className="flex-1 text-xs font-mono text-text-primary truncate">navipass.to/commander?ref={affiliate.code}</p>
                  <button onClick={copyLink} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#EBF6FB' }}>
                    {copied ? <Check size={13} style={{ color: '#4BAFD4' }} /> : <Copy size={13} style={{ color: '#4BAFD4' }} />}
                  </button>
                </div>
                {copied && <p className="text-xs text-center" style={{ color: '#4BAFD4' }}>Lien copié !</p>}
                {/* QR Code */}
                <div className="flex flex-col items-center pt-2">
                  <p className="text-xs text-text-secondary mb-3">Ou partage ce QR code</p>
                  <div className="p-3 rounded-[12px] border border-[#E5E7EB] bg-white inline-block">
                    <QRCodeSVG
                      value={`https://navipass.to/commander?ref=${affiliate.code}`}
                      size={160}
                      fgColor="#0A1628"
                      bgColor="#ffffff"
                      level="M"
                    />
                  </div>
                </div>
              </div>

              {/* Historique */}
              {affiliate.referrals.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 pl-1">Mes filleuls</p>
                  <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
                    {affiliate.referrals.map((r, i) => (
                      <div key={r.id} className="flex items-center justify-between px-4 py-3.5"
                        style={{ borderBottom: i < affiliate.referrals.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <div>
                          <p className="text-sm font-bold text-text-primary">{r.order.orderNumber}</p>
                          <p className="text-xs text-text-secondary">{PLAN_LABELS[r.order.planType]} · {formatDate(r.createdAt)}</p>
                        </div>
                        <span className="text-sm font-black" style={{ color: '#059669' }}>+{formatPrice(r.commission)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {affiliate.balance > 0 && (
                <Link href={`/commander?balance=${affiliate.code}`}
                  className="flex items-center justify-center gap-2 rounded-full py-4 text-base font-semibold text-white"
                  style={{ background: '#059669' }}>
                  Utiliser mon solde ({formatPrice(affiliate.balance)}) <ArrowRight size={18} />
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:block min-h-screen" style={{ background: '#0A1628' }}>
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(rgba(75,175,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,175,212,1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-8 py-16">

          {!affiliate ? (
            <div className="max-w-md mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4BAFD4] mb-3 block">Espace affilié</span>
                <h1 className="text-4xl font-black text-white mb-2">Mon tableau de bord</h1>
                <p className="text-white/50 mb-8">Entrez votre email d&apos;inscription pour accéder à votre espace.</p>
                <div className="rounded-[24px] p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <form onSubmit={handleSearch} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Email affilié</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jean@exemple.fr"
                        className="w-full h-[52px] rounded-[12px] px-4 text-sm outline-none text-white placeholder-white/30"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                    {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
                    <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full rounded-full py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                      style={{ background: '#4BAFD4', color: '#0A1628' }}>
                      <Search size={18} /> {loading ? 'Recherche...' : 'Accéder'}
                    </motion.button>
                  </form>
                </div>
                <p className="text-center mt-6">
                  <Link href="/affilier" className="text-sm text-white/40 hover:text-white transition-colors underline">
                    Pas encore affilié ? S&apos;inscrire gratuitement →
                  </Link>
                </p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Header */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between mb-10">
                <div>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4BAFD4] mb-1 block">Espace affilié</span>
                  <h1 className="text-4xl font-black text-white">Bonjour, <span className="gradient-text">{affiliate.firstName}</span></h1>
                </div>
                <span className="text-sm font-bold px-4 py-2 rounded-full"
                  style={{ background: STATUS_LABELS[affiliate.status]?.bg, color: STATUS_LABELS[affiliate.status]?.color }}>
                  {STATUS_LABELS[affiliate.status]?.label}
                </span>
              </motion.div>

              {/* Stats */}
              <div className="grid lg:grid-cols-4 gap-5 mb-8">
                {[
                  { icon: Wallet, label: 'Solde disponible', value: formatPrice(affiliate.balance), color: '#4BAFD4' },
                  { icon: TrendingUp, label: 'Total gagné', value: formatPrice(affiliate.totalEarned), color: '#059669' },
                  { icon: Users, label: 'Filleuls', value: affiliate.referrals.length, color: '#7C3AED' },
                  { icon: Copy, label: 'Code affilié', value: affiliate.code, color: '#F59E0B' },
                ].map(({ icon: Icon, label, value, color }, i) => (
                  <motion.div key={label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
                    className="rounded-[20px] p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}20` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <p className="text-xs text-white/40 mb-1">{label}</p>
                    <p className="text-2xl font-black text-white">{value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-[1fr_340px] gap-8">
                {/* Referrals */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}
                  className="rounded-[20px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-bold text-[#4BAFD4] uppercase tracking-wider">Historique des filleuls</p>
                  </div>
                  {affiliate.referrals.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <p className="text-white/30 text-sm">Aucun filleul pour le moment.</p>
                      <p className="text-white/20 text-xs mt-1">Partagez votre lien pour commencer à gagner.</p>
                    </div>
                  ) : (
                    affiliate.referrals.map((r, i) => (
                      <div key={r.id} className="flex items-center justify-between px-6 py-4"
                        style={{ borderBottom: i < affiliate.referrals.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <div>
                          <p className="text-sm font-bold text-white">{r.order.orderNumber}</p>
                          <p className="text-xs text-white/40">{PLAN_LABELS[r.order.planType]} · {formatPrice(r.order.amount)} · {formatDate(r.createdAt)}</p>
                        </div>
                        <span className="text-sm font-black" style={{ color: '#059669' }}>+{formatPrice(r.commission)}</span>
                      </div>
                    ))
                  )}
                </motion.div>

                {/* Link + actions */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="space-y-4">
                  <div className="rounded-[20px] p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-xs font-bold text-[#4BAFD4] uppercase tracking-wider">Votre lien</p>
                    <div className="flex items-center gap-3 rounded-[12px] px-4 py-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <p className="flex-1 text-xs font-mono text-white truncate">navipass.to/commander?ref={affiliate.code}</p>
                      <button onClick={copyLink} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(75,175,212,0.2)' }}>
                        {copied ? <Check size={13} style={{ color: '#4BAFD4' }} /> : <Copy size={13} style={{ color: '#4BAFD4' }} />}
                      </button>
                    </div>
                    {copied && <p className="text-xs text-[#4BAFD4] text-center">Lien copié !</p>}
                    {/* QR Code */}
                    <div className="flex flex-col items-center pt-2">
                      <p className="text-xs text-white/40 mb-3">Ou partage ce QR code</p>
                      <div className="p-3 rounded-[12px] bg-white inline-block">
                        <QRCodeSVG
                          value={`https://navipass.to/commander?ref=${affiliate.code}`}
                          size={180}
                          fgColor="#0A1628"
                          bgColor="#ffffff"
                          level="M"
                        />
                      </div>
                    </div>
                  </div>

                  {affiliate.balance > 0 && (
                    <Link href={`/commander?balance=${affiliate.code}`}
                      className="flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold w-full"
                      style={{ background: '#059669', color: '#fff' }}>
                      Utiliser mon solde ({formatPrice(affiliate.balance)}) <ArrowRight size={18} />
                    </Link>
                  )}
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
