'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrderStatus } from '@prisma/client'
import { Card } from '@/components/ui/Card'
import { CTAButton } from '@/components/ui/CTAButton'
import { RoundedInput } from '@/components/ui/RoundedInput'
import { markProcessing, deliverOrder, deleteOrder, setMailGwForwarding, updateClientEmail, saveMailGwCredentials } from '@/actions/admin'
import { Mail, Lock, Calendar, Send, Trash2, AlertTriangle, RefreshCw, WifiOff, Pencil, Check } from 'lucide-react'

interface Props {
  order: {
    id: string
    status: OrderStatus
    orderNumber: string
    clientEmail: string
    accountIssueReported?: boolean
    mailGwForwarding?: boolean
    hasMailGw?: boolean
  }
}

export function AdminOrderActions({ order }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [accountEmail, setAccountEmail] = useState('')
  const [accountPassword, setAccountPassword] = useState('')
  const [accountExpiry, setAccountExpiry] = useState('')
  const [adminNote, setAdminNote] = useState('')

  // Mail.gw
  const [mailGwEmail, setMailGwEmail] = useState('')
  const [mailGwPassword, setMailGwPassword] = useState('')
  const [isMailGw, setIsMailGw] = useState(false)
  const [mailGwForwarding, setMailGwForwardingState] = useState(order.mailGwForwarding ?? false)
  const [mailGwLoading, setMailGwLoading] = useState(false)
  const [gwSaveLoading, setGwSaveLoading] = useState(false)

  // Client email edit
  const [editingEmail, setEditingEmail] = useState(false)
  const [newClientEmail, setNewClientEmail] = useState(order.clientEmail)
  const [emailSaving, setEmailSaving] = useState(false)

  async function handleMarkProcessing() {
    setLoading(true)
    setError(null)
    const result = await markProcessing(order.id)
    if (!result.success) setError(result.error)
    else setSuccess('Commande marquée en traitement')
    setLoading(false)
  }

  async function handleDeliver(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})

    const fd = new FormData()
    fd.append('orderId', order.id)
    fd.append('accountEmail', accountEmail)
    fd.append('accountPassword', accountPassword)
    fd.append('accountExpiry', accountExpiry)
    if (adminNote.trim()) fd.append('adminNote', adminNote.trim())

    if (isMailGw && mailGwEmail && mailGwPassword) {
      fd.append('mailGwEmail', mailGwEmail)
      fd.append('mailGwPassword', mailGwPassword)
    }

    const result = await deliverOrder(fd)

    if (!result.success) {
      setError(result.error)
      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
    } else {
      setSuccess('Commande livrée ! Email envoyé au client.')
      if (isMailGw) setMailGwForwardingState(true)
    }

    setLoading(false)
  }

  async function handleToggleForwarding() {
    setMailGwLoading(true)
    const next = !mailGwForwarding
    const result = await setMailGwForwarding(order.id, next)
    if (result.success) setMailGwForwardingState(next)
    else setError(result.error)
    setMailGwLoading(false)
  }

  async function handleSaveMailGw() {
    if (!mailGwEmail || !mailGwPassword) return
    setGwSaveLoading(true)
    setError(null)
    const result = await saveMailGwCredentials(order.id, mailGwEmail, mailGwPassword)
    if (result.success) {
      setMailGwForwardingState(true)
      setMailGwEmail('')
      setMailGwPassword('')
      setIsMailGw(false)
      setSuccess('Forwarding mail.gw activé !')
    } else {
      setError(result.error)
    }
    setGwSaveLoading(false)
  }

  async function handleSaveEmail() {
    setEmailSaving(true)
    setError(null)
    const result = await updateClientEmail(order.id, newClientEmail)
    if (result.success) setEditingEmail(false)
    else setError(result.error)
    setEmailSaving(false)
  }

  async function handleDelete() {
    setLoading(true)
    const result = await deleteOrder(order.id)
    if (!result.success) { setError(result.error); setLoading(false); return }
    router.push('/admin/dashboard')
  }

  const deleteBlock = (
    <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 size={15} /> Supprimer la commande
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
          <p className="text-sm font-semibold text-red-700">Confirmer la suppression ?</p>
          <p className="text-xs text-red-500">Cette action est irréversible.</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 text-white text-sm font-semibold rounded-lg py-2 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Suppression...' : 'Oui, supprimer'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg py-2 hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )

  if (order.status === 'DELIVERED' && !order.accountIssueReported) {
    return (
      <Card padding="md" className="bg-green-50 border border-green-200">
        <p className="text-sm font-semibold text-green-800 text-center">✓ Commande livrée</p>
        {deleteBlock}
      </Card>
    )
  }

  return (
    <Card padding="md">
      <h2 className="text-sm font-semibold text-text-primary mb-4">Actions</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Client email edit */}
      <div className="mb-4 rounded-[12px] border border-[#E5E7EB] px-4 py-3">
        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Email client</p>
        {editingEmail ? (
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              className="flex-1 h-9 rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#4BAFD4] transition-colors"
              autoFocus
            />
            <button
              onClick={handleSaveEmail}
              disabled={emailSaving}
              className="w-9 h-9 rounded-lg bg-accent-blue flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              <Check size={15} className="text-white" />
            </button>
            <button
              onClick={() => { setEditingEmail(false); setNewClientEmail(order.clientEmail) }}
              className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"
            >
              <span className="text-xs text-gray-500">✕</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-text-primary break-all">{newClientEmail}</p>
            <button
              onClick={() => setEditingEmail(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-accent-blue hover:text-[#005f8f] transition-colors shrink-0"
            >
              <Pencil size={12} /> Modifier
            </button>
          </div>
        )}
      </div>

      {(order.status === 'PAID' || order.status === 'PENDING') && (
        <CTAButton
          loading={loading}
          variant="secondary"
          onClick={handleMarkProcessing}
          className="mb-4"
        >
          Marquer en traitement
        </CTAButton>
      )}

      {order.accountIssueReported && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-red-700">Compte signalé défaillant par le client</p>
        </div>
      )}

      {(order.status === 'PROCESSING' || (order.status === 'DELIVERED' && order.accountIssueReported)) && (
        <form onSubmit={handleDeliver} className="space-y-4">
          <h3 className="text-sm font-medium text-text-primary">
            {order.accountIssueReported ? 'Remplacer les identifiants' : 'Saisir les identifiants du compte IDF'}
          </h3>

          <RoundedInput
            label="Email du compte IDF"
            type="email"
            placeholder="utilisateur@idfmobilites.fr"
            icon={<Mail size={16} />}
            value={accountEmail}
            onChange={(e) => setAccountEmail(e.target.value)}
            error={fieldErrors.accountEmail?.[0]}
            required
          />

          <RoundedInput
            label="Mot de passe du compte"
            type="text"
            placeholder="Mot de passe"
            icon={<Lock size={16} />}
            value={accountPassword}
            onChange={(e) => setAccountPassword(e.target.value)}
            error={fieldErrors.accountPassword?.[0]}
            required
          />

          <RoundedInput
            label="Date d'expiration"
            type="date"
            icon={<Calendar size={16} />}
            value={accountExpiry}
            onChange={(e) => setAccountExpiry(e.target.value)}
            error={fieldErrors.accountExpiry?.[0]}
            required
          />

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Note pour le client <span className="text-text-secondary font-normal">(optionnel — apparaît dans l&apos;email)</span>
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Ex : Votre carte est activée, pensez à vous connecter sur idfmobilites.fr pour vérifier votre abonnement..."
              rows={3}
              maxLength={500}
              className="w-full rounded-[12px] border border-[#E5E7EB] px-4 py-3 text-sm text-text-primary outline-none focus:border-[#4BAFD4] transition-colors resize-none bg-white"
            />
            {adminNote.length > 0 && (
              <p className="text-xs text-text-secondary mt-1 text-right">{adminNote.length}/500</p>
            )}
          </div>

          {/* Mail.gw forwarding */}
          <div className="rounded-[12px] border border-[#E5E7EB] overflow-hidden">
            <button
              type="button"
              onClick={() => setIsMailGw((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className="text-accent-blue" />
                <span className="text-sm font-medium text-text-primary">Activer le forwarding mail.gw</span>
              </div>
              <div className={`w-9 h-5 rounded-full transition-colors ${isMailGw ? 'bg-accent-blue' : 'bg-gray-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform shadow ${isMailGw ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
              </div>
            </button>
            {isMailGw && (
              <div className="px-4 pb-4 pt-2 space-y-3 border-t border-[#F3F4F6]">
                <p className="text-xs text-text-secondary">Les emails reçus sur ce compte mail.gw seront forwarded au client. Il ne verra jamais ces identifiants.</p>
                <RoundedInput
                  label="Email mail.gw"
                  type="email"
                  placeholder="xyz123@mail.gw"
                  icon={<Mail size={16} />}
                  value={mailGwEmail}
                  onChange={(e) => setMailGwEmail(e.target.value)}
                />
                <RoundedInput
                  label="Mot de passe mail.gw"
                  type="text"
                  placeholder="Mot de passe du compte mail.gw"
                  icon={<Lock size={16} />}
                  value={mailGwPassword}
                  onChange={(e) => setMailGwPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <CTAButton type="submit" loading={loading} icon={<Send size={18} />}>
            {order.accountIssueReported ? 'Envoyer les nouveaux identifiants' : 'Livrer la commande'}
          </CTAButton>
        </form>
      )}

      {/* Forwarding toggle — already has mail.gw */}
      {order.status === 'DELIVERED' && order.hasMailGw && !order.accountIssueReported && (
        <div className="mb-4 rounded-[12px] border border-[#E5E7EB] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {mailGwForwarding
              ? <RefreshCw size={15} className="text-accent-blue animate-spin" style={{ animationDuration: '3s' }} />
              : <WifiOff size={15} className="text-gray-400" />
            }
            <div>
              <p className="text-sm font-medium text-text-primary">Forwarding mail.gw</p>
              <p className="text-xs text-text-secondary">{mailGwForwarding ? 'Actif — emails IDF transmis au client' : 'Arrêté'}</p>
            </div>
          </div>
          <button
            onClick={handleToggleForwarding}
            disabled={mailGwLoading}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${mailGwForwarding ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-accent-blue hover:bg-blue-100'}`}
          >
            {mailGwLoading ? '...' : mailGwForwarding ? 'Arrêter' : 'Réactiver'}
          </button>
        </div>
      )}

      {/* Setup forwarding — delivered but no mail.gw yet */}
      {order.status === 'DELIVERED' && !order.hasMailGw && !order.accountIssueReported && (
        <div className="mb-4 rounded-[12px] border border-[#E5E7EB] overflow-hidden">
          <button
            type="button"
            onClick={() => setIsMailGw((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="text-accent-blue" />
              <span className="text-sm font-medium text-text-primary">Configurer le forwarding mail.gw</span>
            </div>
            <div className={`w-9 h-5 rounded-full transition-colors ${isMailGw ? 'bg-accent-blue' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform shadow ${isMailGw ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
            </div>
          </button>
          {isMailGw && (
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-[#F3F4F6]">
              <p className="text-xs text-text-secondary">Les emails reçus sur ce compte mail.gw seront forwarded au client. Il ne verra jamais ces identifiants.</p>
              <RoundedInput
                label="Email mail.gw"
                type="email"
                placeholder="xyz123@mail.gw"
                icon={<Mail size={16} />}
                value={mailGwEmail}
                onChange={(e) => setMailGwEmail(e.target.value)}
              />
              <RoundedInput
                label="Mot de passe mail.gw"
                type="text"
                placeholder="Mot de passe du compte mail.gw"
                icon={<Lock size={16} />}
                value={mailGwPassword}
                onChange={(e) => setMailGwPassword(e.target.value)}
              />
              <button
                onClick={handleSaveMailGw}
                disabled={gwSaveLoading || !mailGwEmail || !mailGwPassword}
                className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white disabled:opacity-50 transition-colors"
                style={{ background: '#0077B6' }}
              >
                <Send size={15} />
                {gwSaveLoading ? 'Activation...' : 'Activer le forwarding'}
              </button>
            </div>
          )}
        </div>
      )}
      {deleteBlock}
    </Card>
  )
}
