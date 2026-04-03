import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signMagicToken } from '@/lib/jwt'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { trackingFormSchema } from '@/lib/validations'
import { getAppUrl } from '@/lib/utils'
import { MagicLinkEmail } from '@/components/EmailTemplates/MagicLink'
import { render } from '@react-email/components'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const parsed = trackingFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const { orderNumber, email } = parsed.data

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        email: { equals: email, mode: 'insensitive' },
      },
    })

    if (!order) {
      // Don't reveal whether the order exists
      return NextResponse.json({ message: 'Si cette commande existe, un email a été envoyé.' })
    }

    const token = await signMagicToken(orderNumber)
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    await prisma.order.update({
      where: { id: order.id },
      data: { magicToken: token, magicTokenExpiry: expiry },
    })

    const appUrl = getAppUrl()
    const magicUrl = `${appUrl}/suivi/${token}`

    const html = await render(MagicLinkEmail({ orderNumber, magicUrl }))

    await resend.emails.send({
      from: EMAIL_FROM,
      to: order.email,
      subject: `Accédez à votre commande NaviPass — ${orderNumber}`,
      html,
    })

    // In development, return the token directly for testing
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ message: 'Email envoyé', token })
    }

    return NextResponse.json({ message: 'Si cette commande existe, un email a été envoyé.' })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
