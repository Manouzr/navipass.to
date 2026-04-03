import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAdmin, getAdminOrderById } from '@/actions/admin'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDate, formatPrice, PLAN_LABELS } from '@/lib/utils'
import { decrypt } from '@/lib/crypto'
import { AdminOrderActions } from '@/components/AdminOrderActions'

interface Props {
  params: { id: string }
}

export default async function AdminOrderDetailPage({ params }: Props) {
  await requireAdmin()

  const order = await getAdminOrderById(params.id)
  if (!order) notFound()

  let accountEmail: string | null = null
  let accountPassword: string | null = null

  if (order.accountEmail) {
    try { accountEmail = decrypt(order.accountEmail) } catch {}
  }
  if (order.accountPassword) {
    try { accountPassword = decrypt(order.accountPassword) } catch {}
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-white border-b border-border-light px-5 py-4 flex items-center gap-3">
        <Link href="/admin/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-base font-bold text-text-primary">{order.orderNumber}</h1>
          <p className="text-xs text-text-secondary">Détail de la commande</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="p-5 space-y-4 max-w-2xl mx-auto">
        {/* Client info */}
        <Card padding="md">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Informations client</h2>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Prénom" value={order.firstName} />
            <InfoRow label="Nom" value={order.lastName} />
            <InfoRow label="Email" value={order.email} span />
            <InfoRow label="Date de naissance" value={formatDate(order.dateOfBirth)} span />
            <InfoRow label="Forfait" value={PLAN_LABELS[order.planType]} />
            <InfoRow label="Montant" value={formatPrice(order.amount)} />
            <InfoRow label="Commandé le" value={formatDate(order.createdAt)} span />
            {order.stripePaidAt && (
              <InfoRow label="Payé le" value={formatDate(order.stripePaidAt)} span />
            )}
            {order.deliveredAt && (
              <InfoRow label="Livré le" value={formatDate(order.deliveredAt)} span />
            )}
          </div>
        </Card>

        {/* Photo */}
        <Card padding="md">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Photo d&apos;identité</h2>
          <div className="flex justify-center">
            <img
              src={order.photoUrl}
              alt="Photo identité"
              className="max-h-64 rounded-xl object-contain border border-border-light"
            />
          </div>
        </Card>

        {/* Identifiants livrés */}
        {order.status === 'DELIVERED' && accountEmail && accountPassword && (
          <Card padding="md" className="border border-green-200 bg-green-50">
            <h2 className="text-sm font-semibold text-green-800 mb-3">Identifiants livrés</h2>
            <div className="space-y-2">
              <InfoRow label="Email compte" value={accountEmail} span />
              <InfoRow label="Mot de passe" value={accountPassword} span />
              {order.accountExpiry && (
                <InfoRow label="Expiration" value={formatDate(order.accountExpiry)} span />
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <AdminOrderActions order={{
          id: order.id,
          status: order.status,
          orderNumber: order.orderNumber,
        }} />
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  span,
}: {
  label: string
  value: string
  span?: boolean
}) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-text-primary mt-0.5 break-all">{value}</p>
    </div>
  )
}
