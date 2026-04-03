import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { signMagicToken } from '@/lib/jwt'
import { getAppUrl } from '@/lib/utils'
import { OrderConfirmationEmail } from '@/components/EmailTemplates/OrderConfirmation'
import { render } from '@react-email/components'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const orderId = session.metadata?.orderId
    const orderNumber = session.metadata?.orderNumber

    if (!orderId || !orderNumber) {
      console.error('Missing metadata in Stripe session')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        stripeSessionId: session.id,
        stripePaidAt: new Date(),
      },
    })

    // Generate and store magic token for the customer
    const token = await signMagicToken(orderNumber)
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await prisma.order.update({
      where: { id: orderId },
      data: { magicToken: token, magicTokenExpiry: expiry },
    })

    const appUrl = getAppUrl()
    const magicUrl = `${appUrl}/suivi/${token}`

    // Send confirmation email
    try {
      const html = await render(
        OrderConfirmationEmail({
          orderNumber,
          firstName: order.firstName,
          planLabel: order.planType,
          amount: order.amount,
          magicUrl,
        })
      )

      await resend.emails.send({
        from: EMAIL_FROM,
        to: order.email,
        subject: `Commande ${orderNumber} confirmée ✓`,
        html,
      })
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr)
    }

    // Notify admin
    if (process.env.ADMIN_EMAIL) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: process.env.ADMIN_EMAIL,
          subject: `Nouvelle commande ${orderNumber} à traiter`,
          html: `<p>Nouvelle commande <strong>${orderNumber}</strong> payée par ${order.firstName} ${order.lastName} (${order.email}).</p><p><a href="${appUrl}/admin/commande/${orderId}">Voir la commande</a></p>`,
        })
      } catch (adminEmailErr) {
        console.error('Failed to send admin notification:', adminEmailErr)
      }
    }
  }

  return NextResponse.json({ received: true })
}
