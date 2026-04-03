'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, User } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { NavigoCard3D } from '@/components/ui/NavigoCard3D'

export function ProfilLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/profil-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Aucune commande trouvée pour cet email.')
        return
      }

      router.refresh()
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-white">
        <PageHeader greeting="Mon espace" title="Gérer mon compte" />

        <div className="px-5 pt-4 pb-8 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="rounded-[16px] overflow-hidden"
            style={{ background: '#EBF6FB', border: '1px solid #BAE6FD' }}
          >
            <div className="p-4 border-b border-[#BAE6FD]">
              <p className="text-xs font-bold text-[#0369A1] uppercase tracking-wider">Connexion</p>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <p className="text-sm text-[#0369A1]">
                Entrez l&apos;email utilisé lors de votre commande pour accéder à votre espace.
              </p>

              <div className="flex items-center gap-3 bg-white rounded-[12px] border border-[#BAE6FD] px-4 h-[52px]">
                <Mail size={16} className="text-[#4BAFD4] shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  required
                  className="flex-1 text-sm outline-none bg-transparent text-text-primary placeholder-text-secondary/60"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                style={{ background: '#4BAFD4' }}
              >
                {loading ? 'Vérification...' : <><ArrowRight size={18} /> Accéder à mon espace</>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:flex min-h-screen items-center" style={{ background: '#0A1628' }}>
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(rgba(75,175,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,175,212,1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-8 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm font-medium"
                style={{ background: 'rgba(75,175,212,0.15)', border: '1px solid rgba(75,175,212,0.3)', color: '#4BAFD4' }}>
                <User size={14} />
                Mon espace
              </div>

              <h1 className="text-4xl font-black text-white mb-2">Gérer mon compte</h1>
              <p className="text-white/50 text-base mb-8">
                Entrez l&apos;email utilisé lors de votre commande pour accéder à votre carte Navigo et vos identifiants.
              </p>

              <div
                className="rounded-[24px] p-8"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-white/70">Email de commande</label>
                    <div
                      className="flex items-center gap-3 rounded-[12px] px-4 h-[52px] focus-within:border-[#4BAFD4] transition-colors"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <Mail size={16} className="text-[#4BAFD4] shrink-0" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.fr"
                        required
                        className="flex-1 text-sm bg-transparent outline-none text-white placeholder-white/30"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading || !email}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-full py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                    style={{ background: '#4BAFD4', color: '#0A1628', boxShadow: '0 0 20px rgba(75,175,212,0.3)' }}
                  >
                    {loading ? 'Vérification...' : <><ArrowRight size={18} /> Accéder à mon espace</>}
                  </motion.button>
                </form>
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
                Retrouvez votre carte Navigo, vos identifiants IDF Mobilités et l&apos;historique de vos commandes.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
