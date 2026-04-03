'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/ui/PageHeader'
import { OrderForm } from '@/components/OrderForm'
import { NavigoCard3D } from '@/components/ui/NavigoCard3D'

export default function CommanderPage() {
  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-white">
        <PageHeader greeting="Achat" title="Choppez votre titre" />
        <div className="px-5 pb-8 pt-4">
          <Suspense>
            <OrderForm />
          </Suspense>
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block min-h-screen" style={{ background: '#0A1628' }}>
        {/* Subtle grid */}
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(75,175,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,175,212,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4BAFD4] mb-2 block">Achat</span>
            <h1 className="text-4xl font-black text-white">Choppez votre titre</h1>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_340px] gap-12 items-start">
            {/* Form column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-[24px] p-8"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Suspense>
                <OrderFormDesktop />
              </Suspense>
            </motion.div>

            {/* Right sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 sticky top-24"
            >
              {/* 3D card preview */}
              <div className="flex justify-center">
                <NavigoCard3D maxWidth={240} floating />
              </div>

              {/* Info box */}
              <div
                className="rounded-[16px] p-5 space-y-3"
                style={{ background: 'rgba(75,175,212,0.08)', border: '1px solid rgba(75,175,212,0.2)' }}
              >
                <p className="text-xs font-bold text-[#4BAFD4] uppercase tracking-wider">Inclus dans votre commande</p>
                {[
                  '✓ Compte IDF Mobilités personnel',
                  '✓ Pass Navigo Zones 1–5',
                  '✓ Email avec vos identifiants',
                  '✓ Lien de suivi de commande',
                ].map((item) => (
                  <p key={item} className="text-sm text-white/70">{item}</p>
                ))}
              </div>

              {/* Security */}
              <div
                className="rounded-[16px] p-4 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="text-xs font-bold text-white/80">Paiement sécurisé</p>
                  <p className="text-xs text-white/40">Stripe · Chiffrement SSL</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

// Desktop version of the form with dark theme overrides
function OrderFormDesktop() {
  return (
    <div className="desktop-form-wrapper">
      <style jsx global>{`
        .desktop-form-wrapper .rounded-\\[16px\\] {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .desktop-form-wrapper input {
          background: transparent !important;
          color: white !important;
        }
        .desktop-form-wrapper input::placeholder {
          color: rgba(255,255,255,0.3) !important;
        }
        .desktop-form-wrapper .text-text-primary {
          color: white !important;
        }
        .desktop-form-wrapper .text-text-secondary {
          color: rgba(255,255,255,0.5) !important;
        }
        .desktop-form-wrapper .bg-white {
          background: rgba(255,255,255,0.05) !important;
        }
        .desktop-form-wrapper .border-\\[\\#E5E7EB\\] {
          border-color: rgba(255,255,255,0.1) !important;
        }
        .desktop-form-wrapper .border-\\[\\#F3F4F6\\] {
          border-color: rgba(255,255,255,0.06) !important;
        }
      `}</style>
      <OrderForm />
    </div>
  )
}
