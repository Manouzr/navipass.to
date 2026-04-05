'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hash, Mail, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/ui/PageHeader'
import { RoundedInput } from '@/components/ui/RoundedInput'
import { NavigoCard3D } from '@/components/ui/NavigoCard3D'
import posthog from 'posthog-js'

export default function SuiviPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.toUpperCase(), email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Commande introuvable'); return }
      posthog.capture('magic_link_requested', { order_number: orderNumber.toUpperCase() })
      if (data.token) { router.push(`/suivi/${data.token}`) }
      else { setSent(true) }
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const formContent = sent ? (
    <div className="rounded-[16px] p-6 text-center" style={{ background: '#EBF6FB', border: '1px solid #BAE6FD' }}>
      <div className="text-4xl mb-3">📧</div>
      <h2 className="text-base font-bold text-[#0369A1] mb-1">Email envoyé !</h2>
      <p className="text-sm text-[#0369A1] leading-relaxed">
        Un lien a été envoyé à <strong>{email}</strong>.<br />Cliquez dessus pour accéder.
      </p>
      <button onClick={() => setSent(false)} className="mt-4 text-sm font-medium text-[#4BAFD4] underline">
        Ressaisir
      </button>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RoundedInput
        label="Numéro de commande"
        placeholder="NAV-AB1234"
        icon={<Hash size={16} />}
        value={orderNumber}
        onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
        maxLength={10}
      />
      <RoundedInput
        label="Email"
        type="email"
        placeholder="jean@exemple.fr"
        icon={<Mail size={16} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !orderNumber || !email}
        className="w-full rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        style={{ background: '#4BAFD4' }}
      >
        {loading ? 'Recherche...' : <><Search size={18} /> Accéder à ma commande</>}
      </button>
    </form>
  )

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-white">
        <PageHeader greeting="Mon espace" title="Suivre ma commande" />
        <div className="px-5 pt-4 pb-8 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden"
          >
            <div className="p-4 border-b border-[#F3F4F6]">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Accéder à ma commande</p>
            </div>
            <div className="p-4">{formContent}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
            className="rounded-[16px] p-4"
            style={{ background: '#EBF6FB', border: '1px solid #BAE6FD' }}
          >
            <p className="text-sm text-[#0369A1] leading-relaxed">
              💡 Vous avez reçu un lien par email ? Cliquez directement dessus.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:flex min-h-screen items-center" style={{ background: '#0A1628' }}>
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(75,175,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,175,212,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-8 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4BAFD4] mb-3 block">Mon espace</span>
              <h1 className="text-4xl font-black text-white mb-2">Suivre ma commande</h1>
              <p className="text-white/50 text-base mb-8">Entrez votre numéro et votre email pour accéder à votre commande.</p>

              <div
                className="rounded-[24px] p-8"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {sent ? formContent : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-white/70">Numéro de commande</label>
                      <div className="flex items-center gap-3 rounded-[12px] px-4 h-[52px] transition-colors" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Hash size={16} className="text-white/40 shrink-0" />
                        <input
                          value={orderNumber}
                          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                          placeholder="NAV-AB1234"
                          maxLength={10}
                          className="flex-1 text-sm bg-transparent outline-none text-white placeholder-white/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-white/70">Email</label>
                      <div className="flex items-center gap-3 rounded-[12px] px-4 h-[52px] transition-colors" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Mail size={16} className="text-white/40 shrink-0" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jean@exemple.fr"
                          className="flex-1 text-sm bg-transparent outline-none text-white placeholder-white/30"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !orderNumber || !email}
                      className="w-full rounded-full py-4 text-base font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                      style={{ background: '#4BAFD4', color: '#0A1628', boxShadow: '0 0 20px rgba(75,175,212,0.3)' }}
                    >
                      {loading ? 'Recherche...' : <><Search size={18} /> Accéder à ma commande</>}
                    </button>

                    <p className="text-xs text-white/30 text-center">
                      💡 Vous avez reçu un lien magique par email ? Cliquez dessus directement.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Right: Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center gap-6"
            >
              <NavigoCard3D maxWidth={260} floating />
              <p className="text-white/30 text-sm text-center max-w-xs">
                Accédez à votre carte Navigo et suivez l&apos;état de votre commande en temps réel.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
