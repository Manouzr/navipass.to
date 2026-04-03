import { cookies } from 'next/headers'
import { verifyProfilToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/crypto'
import { ProfilLoginPage } from '@/components/ProfilLoginPage'
import { ProfilDashboard } from '@/components/ProfilDashboard'

export const dynamic = 'force-dynamic'

export default async function ProfilPage() {
  const token = cookies().get('profil_session')?.value
  const email = token ? await verifyProfilToken(token) : null

  if (!email) {
    return <ProfilLoginPage />
  }

  // Récupérer toutes les commandes de cet email
  const orders = await prisma.order.findMany({
    where: { email: { equals: email, mode: 'insensitive' } },
    orderBy: { createdAt: 'desc' },
  })

  // Déchiffrer les identifiants pour les commandes livrées
  const ordersWithCredentials = orders.map((order) => {
    let accountEmail: string | null = null
    let accountPassword: string | null = null

    if (order.status === 'DELIVERED' && order.accountEmail && order.accountPassword) {
      try {
        accountEmail = decrypt(order.accountEmail)
        accountPassword = decrypt(order.accountPassword)
      } catch {}
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      planType: order.planType,
      amount: order.amount,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      accountExpiry: order.accountExpiry,
      accountEmail,
      accountPassword,
    }
  })

  return <ProfilDashboard email={email} orders={ordersWithCredentials} />
}
