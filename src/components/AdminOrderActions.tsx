'use client'

import { useState } from 'react'
import { OrderStatus } from '@prisma/client'
import { Card } from '@/components/ui/Card'
import { CTAButton } from '@/components/ui/CTAButton'
import { RoundedInput } from '@/components/ui/RoundedInput'
import { markProcessing, deliverOrder } from '@/actions/admin'
import { Mail, Lock, Calendar, Send, Loader2 } from 'lucide-react'

interface Props {
  order: {
    id: string
    status: OrderStatus
    orderNumber: string
  }
}

export function AdminOrderActions({ order }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const [accountEmail, setAccountEmail] = useState('')
  const [accountPassword, setAccountPassword] = useState('')
  const [accountExpiry, setAccountExpiry] = useState('')

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

    const result = await deliverOrder(fd)

    if (!result.success) {
      setError(result.error)
      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
    } else {
      setSuccess('Commande livrée ! Email envoyé au client.')
    }

    setLoading(false)
  }

  if (order.status === 'DELIVERED') {
    return (
      <Card padding="md" className="bg-green-50 border border-green-200">
        <p className="text-sm font-semibold text-green-800 text-center">✓ Commande livrée</p>
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

      {order.status === 'PAID' && (
        <CTAButton
          loading={loading}
          variant="secondary"
          onClick={handleMarkProcessing}
        >
          Marquer en traitement
        </CTAButton>
      )}

      {order.status === 'PROCESSING' && (
        <form onSubmit={handleDeliver} className="space-y-4">
          <h3 className="text-sm font-medium text-text-primary">Saisir les identifiants du compte IDF</h3>

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

          <CTAButton type="submit" loading={loading} icon={<Send size={18} />}>
            Livrer la commande
          </CTAButton>
        </form>
      )}
    </Card>
  )
}
