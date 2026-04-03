import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getOrderByNumber } from '@/actions/order'
import { formatDate, formatPrice, PLAN_LABELS } from '@/lib/utils'
import { CopyButton } from '@/components/CopyButton'

interface Props {
  params: { orderNumber: string }
}

export async function generateMetadata({ params }: Props) {
  return { title: `Commande ${params.orderNumber} — NaviPass` }
}

export default async function OrderConfirmationPage({ params }: Props) {
  const order = await getOrderByNumber(params.orderNumber)
  if (!order) notFound()

  return (
    <div className="min-h-screen bg-white">
      <PageHeader greeting="Merci !" title="Commande confirmée" />

      <div className="px-5 pt-4 pb-8 space-y-4">

        {/* Succès */}
        <div className="animate-fade-in-up rounded-[16px] p-6 text-center" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div className="animate-scale-in text-4xl mb-2">✅</div>
          <h2 className="text-base font-bold text-green-800">Paiement réussi !</h2>
          <p className="text-sm text-green-700 mt-1">
            Email de confirmation envoyé à <strong>{order.email}</strong>
          </p>
        </div>

        {/* Numéro de commande */}
        <div className="animate-fade-in-up delay-100 bg-white rounded-[16px] border border-[#E5E7EB] p-4">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Votre numéro de commande
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black tracking-wider" style={{ color: '#0A1628' }}>
              {order.orderNumber}
            </span>
            <CopyButton text={order.orderNumber} />
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Conservez ce numéro pour suivre votre commande.
          </p>
        </div>

        {/* Recap */}
        <div className="animate-fade-in-up delay-200 bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
          <div className="p-4 border-b border-[#F3F4F6]">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Récapitulatif</p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {[
              { label: 'Statut', value: <StatusBadge status={order.status} /> },
              { label: 'Forfait', value: PLAN_LABELS[order.planType] },
              { label: 'Titulaire', value: `${order.firstName} ${order.lastName}` },
              { label: 'Montant', value: formatPrice(order.amount) },
              { label: 'Date', value: formatDate(order.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center px-4 py-3">
                <span className="text-sm text-text-secondary">{label}</span>
                <span className="text-sm font-semibold text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="animate-fade-in-up delay-300 rounded-[16px] p-4" style={{ background: '#EBF6FB', border: '1px solid #BAE6FD' }}>
          <p className="text-sm text-[#0369A1] leading-relaxed">
            📧 Un lien magique a été envoyé à votre email pour accéder à votre commande sans mot de passe.
          </p>
        </div>

        <Link
          href="/suivi"
          className="animate-fade-in-up delay-400 flex items-center justify-center gap-2 rounded-full py-4 text-base font-semibold text-white transition-all active:scale-95"
          style={{ background: '#4BAFD4' }}
        >
          Suivre ma commande <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  )
}
