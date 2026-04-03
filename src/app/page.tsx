'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, Shield, Clock, CheckCircle, Zap } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { NavigoCard } from '@/components/ui/NavigoCard'
import { NavigoCard3D } from '@/components/ui/NavigoCard3D'
import { formatPrice } from '@/lib/utils'

const PLANS = [
  { type: 'WEEK', label: 'Navigo Semaine', price: 500, description: '7 jours · Métro, RER, Bus, Tram · Zones 1–5' },
  { type: 'MONTH', label: 'Navigo Mois', price: 1500, description: '1 mois · Métro, RER, Bus, Tram · Zones 1–5', popular: true },
  { type: 'YEAR', label: 'Navigo Annuel', price: 15000, description: '12 mois · Réseau complet IDF · Meilleur prix', badge: '−31%' },
]

const STEPS = [
  { icon: '📝', title: 'Remplissez vos infos', desc: 'Nom, prénom, photo et forfait souhaité' },
  { icon: '💳', title: 'Payez en ligne', desc: 'Paiement sécurisé Stripe. Aucune donnée bancaire stockée.' },
  { icon: '✉️', title: 'Recevez votre compte', desc: 'Identifiants IDF Mobilités par email sous 24–48h.' },
]

const GUARANTEES = [
  { icon: Shield, label: 'Paiement sécurisé', sub: 'Chiffrement SSL + Stripe' },
  { icon: Clock, label: 'Livraison 24–48h', sub: 'Jours ouvrés garantis' },
  { icon: CheckCircle, label: 'Satisfaction garantie', sub: 'Remboursement si problème' },
  { icon: Zap, label: 'Activation rapide', sub: 'Compte actif immédiatement' },
]

// Framer Motion variants
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
}

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function HomePage() {
  return (
    <>
      {/* ════════════════════════════════════════════════
          MOBILE VIEW (hidden on lg+)
      ════════════════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen bg-white">
        <PageHeader greeting="Bonjour," title="Votre pass Navigo en ligne" />
        <div className="px-5 space-y-5 pb-8">
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.1 }}
            className="mt-2 flex flex-col items-center"
          >
            <p className="text-xs font-medium text-text-secondary mb-3 self-start">Mon abonnement</p>
            <NavigoCard status="PENDING" tilt className="max-w-[200px]" />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <Link
              href="/commander"
              className="flex items-center justify-center gap-2 rounded-full py-4 text-base font-semibold text-white transition-all active:scale-95"
              style={{ background: '#4BAFD4' }}
            >
              Commander un pass Navigo <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Plans */}
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Nos forfaits</p>
            <div className="space-y-2.5">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.25 + i * 0.09 }}
                >
                  <Link href={`/commander?plan=${plan.type}`}>
                    <div className="bg-white rounded-[16px] border border-[#E5E7EB] flex items-center justify-between p-4 hover:border-[#4BAFD4] transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-text-primary">{plan.label}</span>
                          {plan.popular && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#4BAFD4' }}>Populaire</span>
                          )}
                          {plan.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-green-500">{plan.badge}</span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary">{plan.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-xl font-black text-text-primary">{formatPrice(plan.price)}</span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#EBF6FB' }}>
                          <ChevronRight size={14} style={{ color: '#4BAFD4' }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Comment ça marche ?</p>
            <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
              {STEPS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                  className="flex items-center gap-4 px-4 py-4 border-b border-[#F3F4F6] last:border-0"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg" style={{ background: '#EBF6FB' }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[16px] p-4"
            style={{ background: '#EBF6FB', border: '1px solid #BAE6FD' }}
          >
            <p className="text-sm font-semibold text-[#0369A1] mb-1">Service sécurisé · Réseau complet IDF</p>
            <p className="text-xs text-[#0369A1] leading-relaxed">Valable sur tout le réseau : métro, RER, bus et tramway · Paiement Stripe sécurisé · Livraison sous 48h.</p>
          </motion.div>

          <div className="flex items-center justify-center gap-4 pb-2">
            <Link href="/cgv" className="text-xs text-text-secondary underline underline-offset-2">CGV</Link>
            <span className="text-text-secondary text-xs">·</span>
            <Link href="/cgu" className="text-xs text-text-secondary underline underline-offset-2">CGU</Link>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          DESKTOP VIEW (hidden on mobile)
      ════════════════════════════════════════════════ */}
      <div className="hidden lg:block">

        {/* ── Hero ───────────────────────────────────── */}
        <section
          className="min-h-[calc(100vh-64px)] flex items-center relative overflow-hidden animated-gradient"
        >
          {/* Background grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(75,175,212,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(75,175,212,1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 animate-float-still"
            style={{ background: 'radial-gradient(circle, #4BAFD4, transparent)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full opacity-8 animate-float-still delay-300"
            style={{ background: 'radial-gradient(circle, #0077B6, transparent)', filter: 'blur(80px)' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* ── Left: Text ── */}
              <div>
                {/* Badge */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={0}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-medium"
                  style={{ background: 'rgba(75,175,212,0.15)', border: '1px solid rgba(75,175,212,0.3)', color: '#4BAFD4' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4BAFD4] animate-pulse" />
                  Service disponible 24h/24
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={1}
                  className="text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight mb-6"
                >
                  <span className="text-white">Le pass Navigo,</span>
                  <br />
                  <span className="gradient-text-hero">simplifié.</span>
                </motion.h1>

                {/* Subline */}
                <motion.p
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={2}
                  className="text-lg text-white/60 leading-relaxed mb-10 max-w-md"
                >
                  Obtenez votre compte IDF Mobilités en ligne. Valable sur tout le réseau Île-de-France : métro, RER, bus et tramway. Recevez vos identifiants sous 24–48h.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={3}
                  className="flex flex-wrap gap-4 mb-12"
                >
                  <Link
                    href="/commander"
                    className="group flex items-center gap-2 text-base font-bold text-[#0A1628] rounded-full px-7 py-4 transition-all hover:scale-105 active:scale-95"
                    style={{ background: '#4BAFD4', boxShadow: '0 0 30px rgba(75,175,212,0.5)' }}
                  >
                    Commander maintenant
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/suivi"
                    className="flex items-center gap-2 text-base font-semibold text-white/80 rounded-full px-7 py-4 border border-white/20 hover:border-white/40 hover:text-white transition-all"
                  >
                    Suivre ma commande
                  </Link>
                </motion.div>

                {/* Guarantees row */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={4}
                  className="flex flex-wrap gap-5"
                >
                  {GUARANTEES.map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(75,175,212,0.15)' }}>
                        <Icon size={15} style={{ color: '#4BAFD4' }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/90">{label}</p>
                        <p className="text-[10px] text-white/40">{sub}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* ── Right: 3D Card ── */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={slideRight}
                className="flex flex-col items-center gap-8"
              >
                <NavigoCard3D maxWidth={280} floating />

                {/* Stats under card */}
                <div className="flex gap-8">
                  {[
                    { value: '500+', label: 'Clients satisfaits' },
                    { value: '24h', label: 'Délai moyen' },
                    { value: '4.9★', label: 'Note client' },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center">
                      <p className="text-2xl font-black text-white">{value}</p>
                      <p className="text-xs text-white/40 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom fade to next section */}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #0f172a)' }} />
        </section>

        {/* ── How it works ──────────────────────────── */}
        <section className="bg-[#0f172a] py-24">
          <div className="max-w-7xl mx-auto px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUp}
              custom={0}
              className="text-center mb-16"
            >
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4BAFD4] mb-3 block">
                Processus simplifié
              </span>
              <h2 className="text-4xl font-black text-white">Comment ça marche ?</h2>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="relative rounded-[20px] p-8 group cursor-default"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {/* Step number */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform"
                    style={{ background: 'rgba(75,175,212,0.15)' }}
                  >
                    {step.icon}
                  </div>

                  {/* Step counter */}
                  <span
                    className="absolute top-6 right-6 text-5xl font-black opacity-10"
                    style={{ color: '#4BAFD4' }}
                  >
                    {i + 1}
                  </span>

                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ border: '1px solid rgba(75,175,212,0.3)', boxShadow: 'inset 0 0 30px rgba(75,175,212,0.05)' }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────── */}
        <section className="bg-[#0A1628] py-24">
          <div className="max-w-7xl mx-auto px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUp}
              custom={0}
              className="text-center mb-16"
            >
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4BAFD4] mb-3 block">
                Tarifs transparents
              </span>
              <h2 className="text-4xl font-black text-white">Choisissez votre forfait</h2>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.type}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                  className="relative rounded-[20px] overflow-hidden cursor-pointer"
                  style={{
                    background: plan.popular
                      ? 'linear-gradient(135deg, rgba(75,175,212,0.2), rgba(75,175,212,0.08))'
                      : 'rgba(255,255,255,0.04)',
                    border: plan.popular
                      ? '1px solid rgba(75,175,212,0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: plan.popular ? '0 0 40px rgba(75,175,212,0.15)' : 'none',
                  }}
                >
                  {plan.popular && (
                    <div
                      className="absolute top-0 left-0 right-0 py-1.5 text-center text-xs font-bold tracking-wider"
                      style={{ background: '#4BAFD4', color: '#0A1628' }}
                    >
                      LE PLUS POPULAIRE
                    </div>
                  )}

                  <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                    <p className="text-sm font-semibold text-white/60 mb-1">{plan.description}</p>
                    <h3 className="text-xl font-black text-white mb-4">{plan.label}</h3>

                    <div className="flex items-end gap-1 mb-8">
                      <span className="text-5xl font-black text-white">{formatPrice(plan.price)}</span>
                    </div>

                    {plan.badge && (
                      <div
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-green-300 mb-6"
                        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
                      >
                        ✦ Économisez {plan.badge}
                      </div>
                    )}

                    <Link
                      href={`/commander?plan=${plan.type}`}
                      className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all hover:scale-105"
                      style={
                        plan.popular
                          ? { background: '#4BAFD4', color: '#0A1628' }
                          : { background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }
                      }
                    >
                      Commander <ArrowRight size={15} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer strip ─────────────────────────── */}
        <section
          className="py-12 text-center"
          style={{ background: '#060e1a', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://play-lh.googleusercontent.com/LJD2yoFM-4bNLJ5xUFg5pKAFWKZW7eCx3UQf2RGC3qoUm11N665BaKPyPefXhcfSqEo"
              alt="IDF"
              className="w-8 h-8 rounded-[8px]"
            />
            <span className="text-white font-black text-lg">NaviPass</span>
          </div>
          <p className="text-white/30 text-sm mb-4">
            Service non officiel · Pas affilié à IDF Mobilités · © {new Date().getFullYear()}
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link href="/cgv" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Conditions générales de vente
            </Link>
            <span className="text-white/15 text-xs">·</span>
            <Link href="/cgu" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Conditions d&apos;utilisation
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
