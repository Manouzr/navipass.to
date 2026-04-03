'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, User, Mail, Calendar, Check, ArrowLeft, ArrowRight } from 'lucide-react'
import { RoundedInput } from '@/components/ui/RoundedInput'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/utils'
import { createOrderAction } from '@/actions/order'

const PLANS = [
  { type: 'WEEK', label: 'Navigo Semaine', price: 500, description: '7 jours consécutifs · Zones 1–5' },
  { type: 'MONTH', label: 'Navigo Mois', price: 1500, description: '1 mois calendaire · Zones 1–5', popular: true },
  { type: 'YEAR', label: 'Navigo Annuel', price: 15000, description: '12 mois · Meilleur prix', badge: '−31%' },
]

type Step = 1 | 2 | 3

const stepVariants = {
  hidden: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  visible: { x: 0, opacity: 1, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir: number) => ({ x: dir * -40, opacity: 0, transition: { duration: 0.2 } }),
}

export function OrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultPlan = searchParams.get('plan') ?? 'MONTH'

  const [step, setStep] = useState<Step>(1)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const [selectedPlan, setSelectedPlan] = useState(defaultPlan)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedPlanData = PLANS.find((p) => p.type === selectedPlan)!

  function goTo(next: Step) {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erreur upload'); return }
      setPhotoUrl(data.url)
      setPhotoPreview(URL.createObjectURL(file))
    } catch { setError('Erreur upload') }
    finally { setUploading(false) }
  }

  function validateStep2(): boolean {
    const errors: Record<string, string[]> = {}
    if (!firstName.trim() || firstName.length < 2) errors.firstName = ['Prénom requis']
    if (!lastName.trim() || lastName.length < 2) errors.lastName = ['Nom requis']
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = ['Email invalide']
    if (!dateOfBirth) errors.dateOfBirth = ['Date de naissance requise']
    if (!photoUrl) errors.photoUrl = ['Photo requise']
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const fd = new FormData()
    fd.append('planType', selectedPlan)
    fd.append('firstName', firstName)
    fd.append('lastName', lastName)
    fd.append('email', email)
    fd.append('dateOfBirth', dateOfBirth)
    fd.append('photoUrl', photoUrl)
    const result = await createOrderAction(fd)
    if (!result.success) {
      setError(result.error)
      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
      setLoading(false)
      return
    }
    router.push(result.data.checkoutUrl)
  }

  return (
    <div className="space-y-4">

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-2">
        {(['Forfait', 'Infos', 'Récap'] as const).map((label, i) => {
          const s = i + 1
          const isDone = step > s
          const isCurrent = step === s
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={
                    isDone
                      ? { backgroundColor: '#4BAFD4', color: '#ffffff' }
                      : isCurrent
                      ? { backgroundColor: '#0A1628', color: '#ffffff' }
                      : { backgroundColor: '#F3F4F6', color: '#9CA3AF' }
                  }
                  transition={{ duration: 0.3 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                >
                  {isDone ? <Check size={12} /> : s}
                </motion.div>
                <span className={cn('text-xs font-medium', isCurrent ? 'text-text-primary' : 'text-text-secondary')}>
                  {label}
                </span>
              </div>
              {s < 3 && (
                <motion.div
                  animate={{ backgroundColor: step > s ? '#4BAFD4' : '#E5E7EB' }}
                  transition={{ duration: 0.4 }}
                  className="flex-1 h-px mx-2"
                />
              )}
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps */}
      <AnimatePresence mode="wait" custom={direction}>

        {/* ─── Step 1: Choix forfait ─────────────────── */}
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-3"
          >
            {PLANS.map((plan) => {
              const active = selectedPlan === plan.type
              return (
                <motion.button
                  key={plan.type}
                  onClick={() => setSelectedPlan(plan.type)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full text-left rounded-[16px] p-4 border-2 transition-colors bg-white',
                    active ? 'border-[#4BAFD4]' : 'border-[#E5E7EB]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-text-primary">{plan.label}</span>
                        {plan.popular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#4BAFD4' }}>
                            Populaire
                          </span>
                        )}
                        {plan.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-green-500">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary">{plan.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xl font-black text-text-primary">{formatPrice(plan.price)}</span>
                      <motion.div
                        animate={active ? { borderColor: '#4BAFD4', backgroundColor: '#4BAFD4' } : { borderColor: '#D1D5DB', backgroundColor: 'transparent' }}
                        transition={{ duration: 0.2 }}
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      >
                        {active && <Check size={11} className="text-white" />}
                      </motion.div>
                    </div>
                  </div>
                </motion.button>
              )
            })}

            <motion.button
              onClick={() => goTo(2)}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: '#4BAFD4' }}
            >
              Continuer <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* ─── Step 2: Infos personnelles ───────────── */}
        {step === 2 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
              <div className="p-4 border-b border-[#F3F4F6]">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Informations personnelles</p>
              </div>
              <div className="p-4 space-y-4">
                <RoundedInput
                  label="Prénom"
                  placeholder="Jean"
                  icon={<User size={16} />}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={fieldErrors.firstName?.[0]}
                />
                <RoundedInput
                  label="Nom"
                  placeholder="Dupont"
                  icon={<User size={16} />}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={fieldErrors.lastName?.[0]}
                />
                <RoundedInput
                  label="Email"
                  type="email"
                  placeholder="jean@exemple.fr"
                  icon={<Mail size={16} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={fieldErrors.email?.[0]}
                />
                <RoundedInput
                  label="Date de naissance"
                  type="date"
                  icon={<Calendar size={16} />}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  error={fieldErrors.dateOfBirth?.[0]}
                />
              </div>
            </div>

            {/* Photo upload */}
            <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
              <div className="p-4 border-b border-[#F3F4F6]">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Photo d&apos;identité</p>
              </div>
              <div className="p-4">
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full rounded-[12px] border-2 border-dashed p-5 flex flex-col items-center gap-3 transition-colors',
                    photoPreview ? 'border-green-400 bg-green-50 lg:bg-green-500/10'
                    : fieldErrors.photoUrl ? 'border-red-300 bg-red-50 lg:bg-red-500/10'
                    : 'border-[#E5E7EB] bg-[#F9FAFB] hover:border-[#4BAFD4] lg:bg-[rgba(75,175,212,0.06)] lg:border-[rgba(75,175,212,0.2)] lg:hover:border-[#4BAFD4]'
                  )}
                >
                  {photoPreview ? (
                    <div className="flex items-center gap-4">
                      <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-green-700">Photo ajoutée ✓</p>
                        <p className="text-xs text-text-secondary">Cliquer pour changer</p>
                      </div>
                    </div>
                  ) : uploading ? (
                    <p className="text-sm text-text-secondary">Upload en cours...</p>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center">
                        <Upload size={20} className="text-[#4BAFD4]" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-text-primary">Ajouter votre photo</p>
                        <p className="text-xs text-text-secondary mt-0.5">JPG ou PNG · max 5MB</p>
                      </div>
                    </>
                  )}
                </motion.button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
                {fieldErrors.photoUrl?.[0] && (
                  <p className="text-xs text-red-500 mt-2">{fieldErrors.photoUrl[0]}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={() => goTo(1)}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full border-2 border-[#E5E7EB] flex items-center justify-center shrink-0 hover:border-[#4BAFD4] transition-colors"
              >
                <ArrowLeft size={18} className="text-text-primary" />
              </motion.button>
              <motion.button
                onClick={() => { if (validateStep2()) goTo(3) }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: '#4BAFD4' }}
              >
                Continuer <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── Step 3: Récapitulatif ─────────────────── */}
        {step === 3 && (
          <motion.div
            key="step3"
            custom={direction}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {/* Recap card */}
            <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
              <div className="p-4 border-b border-[#F3F4F6]">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Récapitulatif</p>
              </div>
              <div className="divide-y divide-[#F3F4F6]">
                {[
                  { label: 'Forfait', value: selectedPlanData.label },
                  { label: 'Titulaire', value: `${firstName} ${lastName}` },
                  { label: 'Email', value: email },
                ].map(({ label, value }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    className="flex justify-between items-center px-4 py-3.5"
                  >
                    <span className="text-sm text-text-secondary">{label}</span>
                    <span className="text-sm font-semibold text-text-primary">{value}</span>
                  </motion.div>
                ))}
                {photoPreview && (
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-text-secondary">Photo</span>
                    <img src={photoPreview} alt="ID" className="w-10 h-10 rounded-lg object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Total */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.18 }}
              className="rounded-[16px] p-4 flex justify-between items-center"
              style={{ background: '#EBF6FB', border: '1px solid #BAE6FD' }}
            >
              <span className="font-bold text-[#0369A1]">Total à payer</span>
              <span className="text-2xl font-black text-[#0A1628]">{formatPrice(selectedPlanData.price)}</span>
            </motion.div>

            <div className="flex gap-3">
              <motion.button
                onClick={() => goTo(2)}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full border-2 border-[#E5E7EB] flex items-center justify-center shrink-0 hover:border-[#4BAFD4] transition-colors"
              >
                <ArrowLeft size={18} className="text-text-primary" />
              </motion.button>
              <motion.button
                disabled={loading}
                onClick={handleSubmit}
                whileTap={{ scale: 0.97 }}
                className="flex-1 rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: '#4BAFD4' }}
              >
                {loading ? 'Redirection...' : `Payer ${formatPrice(selectedPlanData.price)} →`}
              </motion.button>
            </div>

            <p className="text-xs text-center text-text-secondary">
              🔒 Paiement sécurisé par Stripe
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
