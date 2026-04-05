import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OrderTimeline } from '@/components/OrderTimeline'
import { getOrderByMagicToken } from '@/actions/order'
import { PLAN_LABELS, formatPrice } from '@/lib/utils'
import { CredentialsCopyBlock } from '@/components/CredentialsCopyBlock'
import { decrypt } from '@/lib/crypto'
import { NavigoCard3D } from '@/components/ui/NavigoCard3D'
import { TrackingPageClient } from '@/components/TrackingPageClient'

interface Props { params: Promise<{ token: string }> }

export default async function OrderTrackingPage({ params }: Props) {
  const { token } = await params
  const order = await getOrderByMagicToken(token)
  if (!order) notFound()

  let accountEmail: string | null = null
  let accountPassword: string | null = null

  if (order.status === 'DELIVERED' && order.accountEmail && order.accountPassword) {
    try {
      accountEmail = decrypt(order.accountEmail)
      accountPassword = decrypt(order.accountPassword)
    } catch {}
  }

  const orderData = {
    orderNumber: order.orderNumber,
    status: order.status,
    planType: order.planType,
    firstName: order.firstName,
    lastName: order.lastName,
    email: order.email,
    amount: order.amount,
    createdAt: order.createdAt,
    stripePaidAt: order.stripePaidAt,
    deliveredAt: order.deliveredAt,
    accountExpiry: order.accountExpiry,
  }

  return (
    <TrackingPageClient
      order={orderData}
      accountEmail={accountEmail}
      accountPassword={accountPassword}
    />
  )
}
