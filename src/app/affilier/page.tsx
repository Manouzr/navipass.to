'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Users, TrendingUp, Wallet, CheckCircle, Copy, Check } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { registerAffiliate } from '@/actions/affiliate'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

const COMMISSIONS = [
  { plan: 'Navigo Semaine', price: 500, commission: 150, label: '1,50€ · 7 jours' },
  { plan: 'Navigo Mois', price: 1500, commission: 450, label: '4,50€ · 1 mois', popular: true },
  { plan: 'Navigo Annuel', price: 15000, commission: 4500, label: '45€ · 12 mois' },
]

const AVANTAGES = [
  { icon: TrendingUp, title: '30% de commission', desc: 'Sur chaque vente générée via ton lien de parrainage' },
  { icon: Wallet, title: 'Solde utilisable', desc: 'Utilise tes gains pour payer ta propre carte Navigo' },
  { icon: Users, title: 'Suivi en temps réel', desc: 'Tableau de bord dédié avec l\'historique de tes filleuls' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 } }),
}

export default function AffiliePage() {
  const [step, setStep] = useState<'landing' | 'form' | 'success'>('landing')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [affCode, setAffCode] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData()
    fd.append('firstName', firstName)
    fd.append('lastName', lastName)
    fd.append('email', email)
    const result = await registerAffiliate(fd)
    if (!result.success) { setError(result.error); setLoading(false); return }
    setAffCode(result.data.code)
    setStep('success')
    setLoading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://navipass.to/commander?ref=${affCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* ── MOBILE ── */}
      <div className="lg:hidden min-h-screen bg-white">
        <PageHeader greeting="Programme" title="Devenir affilié" />
        <div className="px-5 pt-4 pb-24 space-y-5">

          {step === 'landing' && (
            <>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                className="rounded-[16px] p-5" style={{ background: '#EBF6FB', border: '1px solid #BAE6FD' }}
              >
                <p className="text-sm font-bold text-[#0369A1] mb-1">Gagne de l&apos;argent avec NaviPass</p>
                <p className="text-xs text-[#0369A1] leading-relaxed">
                  Partage ton lien, touche 30% sur chaque vente. Utilise tes gains pour payer ta propre carte Navigo.
                </p>
              </motion.div>

              {AVANTAGES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div key={title}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-4 bg-white rounded-[16px] border border-[#E5E7EB] p-4"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EBF6FB' }}>
                    <Icon size={18} style={{ color: '#4BAFD4' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}

              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Commissions par forfait</p>
                <div className="space-y-2">
                  {COMMISSIONS.map((c) => (
                    <div key={c.plan} className="bg-white rounded-[14px] border border-[#E5E7EB] flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-text-primary">{c.plan}</p>
                        <p className="text-xs text-text-secondary">{c.label}</p>
                      </div>
                      <span className="text-sm font-black" style={{ color: '#4BAFD4' }}>+{formatPrice(c.commission)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={() => setStep('form')}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: '#4BAFD4' }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              >
                Créer mon compte affilié <ArrowRight size={18} />
              </motion.button>

              <div className="text-center">
                <Link href="/affilier/dashboard" className="text-xs text-[#4BAFD4] underline">
                  J&apos;ai déjà un compte → accéder à mon tableau de bord
                </Link>
              </div>
            </>
          )}

          {step === 'form' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
                <div className="p-4 border-b border-[#F3F4F6]">
                  <p className="text-xs font-bold text-text-primary uppercase tracking-wider">Créer mon compte</p>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Prénom</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Jean"
                      className="w-full h-12 rounded-[12px] border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#4BAFD4] transition-colors bg-white text-text-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Nom</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Dupont"
                      className="w-full h-12 rounded-[12px] border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#4BAFD4] transition-colors bg-white text-text-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jean@exemple.fr"
                      className="w-full h-12 rounded-[12px] border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#4BAFD4] transition-colors bg-white text-text-primary" />
                  </div>
                  {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full rounded-full py-4 text-base font-semibold text-white disabled:opacity-50"
                    style={{ background: '#4BAFD4' }}>
                    {loading ? 'Création...' : 'Créer mon compte'}
                  </button>
                </form>
              </div>
              <button onClick={() => setStep('landing')} className="mt-3 text-xs text-text-secondary underline w-full text-center">← Retour</button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="space-y-4">
              <div className="rounded-[16px] p-5 text-center" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <CheckCircle size={36} className="text-green-500 mx-auto mb-2" />
                <p className="text-base font-bold text-green-800">Compte créé !</p>
                <p className="text-xs text-green-700 mt-1">Votre demande est en cours de validation par notre équipe.</p>
              </div>
              <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-4">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Votre lien de parrainage</p>
                <div className="flex items-center gap-2 bg-[#F9FAFB] rounded-[12px] border border-[#E5E7EB] px-3 py-3">
                  <p className="flex-1 text-xs font-mono text-text-primary truncate">navipass.to/commander?ref={affCode}</p>
                  <button onClick={copyLink} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#EBF6FB' }}>
                    {copied ? <Check size={14} style={{ color: '#4BAFD4' }} /> : <Copy size={14} style={{ color: '#4BAFD4' }} />}
                  </button>
                </div>
              </div>
              <Link href="/affilier/dashboard" className="flex items-center justify-center gap-2 rounded-full py-4 text-base font-semibold text-white" style={{ background: '#4BAFD4' }}>
                Mon tableau de bord <ArrowRight size={18} />
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:block min-h-screen" style={{ background: '#0A1628' }}>
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(rgba(75,175,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,175,212,1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-16">

          {step === 'landing' && (
            <>
              {/* Hero */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-16">
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm font-medium"
                  style={{ background: 'rgba(75,175,212,0.15)', border: '1px solid rgba(75,175,212,0.3)', color: '#4BAFD4' }}>
                  <Users size={14} /> Programme affilié
                </span>
                <h1 className="text-5xl font-black text-white mb-4">Gagne avec chaque parrainage</h1>
                <p className="text-xl text-white/50 max-w-xl mx-auto">
                  Partage ton lien NaviPass. Touche <strong className="text-white">30%</strong> sur chaque vente.
                  Utilise tes gains pour ta propre carte Navigo.
                </p>
              </motion.div>

              {/* Avantages */}
              <div className="grid lg:grid-cols-3 gap-6 mb-16">
                {AVANTAGES.map(({ icon: Icon, title, desc }, i) => (
                  <motion.div key={title} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
                    className="rounded-[20px] p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(75,175,212,0.15)' }}>
                      <Icon size={22} style={{ color: '#4BAFD4' }} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Commission table + CTA */}
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
                  className="rounded-[20px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-bold text-[#4BAFD4] uppercase tracking-wider">Grille de commissions</p>
                  </div>
                  {COMMISSIONS.map((c, i) => (
                    <div key={c.plan} className="flex items-center justify-between px-6 py-4"
                      style={{ borderBottom: i < COMMISSIONS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: c.popular ? 'rgba(75,175,212,0.06)' : 'transparent' }}>
                      <div>
                        <p className="text-sm font-bold text-white">{c.plan}</p>
                        <p className="text-xs text-white/40">{c.label}</p>
                      </div>
                      <span className="text-xl font-black" style={{ color: '#4BAFD4' }}>+{formatPrice(c.commission)}</span>
                    </div>
                  ))}
                </motion.div>

                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="space-y-4">
                  <div className="rounded-[20px] p-8" style={{ background: 'rgba(75,175,212,0.08)', border: '1px solid rgba(75,175,212,0.2)' }}>
                    <p className="text-sm font-bold text-[#4BAFD4] mb-2">Comment ça marche ?</p>
                    {['Inscris-toi gratuitement ci-dessous', 'Notre équipe active ton compte sous 24h', 'Partage ton lien unique sur tes réseaux', 'Touche 30% sur chaque achat de tes filleuls', 'Utilise ton solde pour payer ta carte Navigo'].map((s, i) => (
                      <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: 'rgba(75,175,212,0.2)', color: '#4BAFD4' }}>{i + 1}</div>
                        <p className="text-sm text-white/70">{s}</p>
                      </div>
                    ))}
                  </div>

                  <motion.button onClick={() => setStep('form')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full rounded-full py-4 text-base font-bold flex items-center justify-center gap-2"
                    style={{ background: '#4BAFD4', color: '#0A1628' }}>
                    Créer mon compte affilié <ArrowRight size={18} />
                  </motion.button>
                  <div className="text-center">
                    <Link href="/affilier/dashboard" className="text-sm text-white/40 hover:text-white transition-colors underline">
                      Déjà affilié ? Accéder à mon tableau de bord →
                    </Link>
                  </div>
                </motion.div>
              </div>
            </>
          )}

          {step === 'form' && (
            <div className="max-w-md mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <button onClick={() => setStep('landing')} className="text-sm text-white/40 hover:text-white mb-8 transition-colors">← Retour</button>
                <h2 className="text-3xl font-black text-white mb-2">Créer mon compte</h2>
                <p className="text-white/50 mb-8">Gratuit, sans engagement. Validé sous 24h.</p>
                <div className="rounded-[24px] p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {[
                      { label: 'Prénom', value: firstName, set: setFirstName, placeholder: 'Jean' },
                      { label: 'Nom', value: lastName, set: setLastName, placeholder: 'Dupont' },
                      { label: 'Email', value: email, set: setEmail, placeholder: 'jean@exemple.fr', type: 'email' },
                    ].map(({ label, value, set, placeholder, type }) => (
                      <div key={label}>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
                        <input type={type ?? 'text'} value={value} onChange={e => set(e.target.value)} required placeholder={placeholder}
                          className="w-full h-[52px] rounded-[12px] px-4 text-sm outline-none transition-colors text-white placeholder-white/30"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      </div>
                    ))}
                    {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
                    <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full rounded-full py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                      style={{ background: '#4BAFD4', color: '#0A1628' }}>
                      {loading ? 'Création...' : 'Créer mon compte'}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}

          {step === 'success' && (
            <div className="max-w-lg mx-auto text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }} className="space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle size={40} className="text-green-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">Compte créé !</h2>
                  <p className="text-white/50">Demande en cours de validation. Vous recevrez un email dès l&apos;activation.</p>
                </div>
                <div className="rounded-[20px] p-6 text-left" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs font-bold text-[#4BAFD4] uppercase tracking-wider mb-3">Votre lien de parrainage</p>
                  <div className="flex items-center gap-3 rounded-[12px] px-4 py-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p className="flex-1 text-sm font-mono text-white truncate">navipass.to/commander?ref={affCode}</p>
                    <button onClick={copyLink} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(75,175,212,0.2)' }}>
                      {copied ? <Check size={14} style={{ color: '#4BAFD4' }} /> : <Copy size={14} style={{ color: '#4BAFD4' }} />}
                    </button>
                  </div>
                </div>
                <Link href="/affilier/dashboard" className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold" style={{ background: '#4BAFD4', color: '#0A1628' }}>
                  Mon tableau de bord <ArrowRight size={18} />
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
