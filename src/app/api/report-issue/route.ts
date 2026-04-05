import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyCredentialsToken, verifyProfilToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { getPostHogServer } from '@/lib/posthog'

export async function POST(req: NextRequest) {
  // Must be logged in to profil
  const cookieStore = await cookies()
  const profilToken = cookieStore.get('profil_session')?.value
  const email = profilToken ? await verifyProfilToken(profilToken) : null
  if (!email) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Must have credentials unlocked
  const credToken = cookieStore.get('credentials_unlocked')?.value
  const credEmail = credToken ? await verifyCredentialsToken(credToken) : null
  if (!credEmail || credEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: 'Vérification requise' }, { status: 403 })
  }

  const { orderId } = await req.json()
  if (!orderId) {
    return NextResponse.json({ error: 'orderId manquant' }, { status: 400 })
  }

  // Verify the order belongs to this user and is DELIVERED
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      email: { equals: email, mode: 'insensitive' },
      status: 'DELIVERED',
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      accountIssueReported: true,
      accountIssueReportedAt: new Date(),
    },
  })

  try {
    const ph = getPostHogServer()
    ph.capture({
      distinctId: email,
      event: 'account_issue_reported',
      properties: { order_id: orderId },
    })
    await ph.shutdown()
  } catch {}

  return NextResponse.json({ success: true })
}
