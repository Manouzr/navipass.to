import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { signMagicToken } from '@/lib/jwt'
import { getAppUrl } from '@/lib/utils'
import { OrderConfirmationEmail } from '@/components/EmailTemplates/OrderConfirmation'
import { creditAffiliateReferral } from '@/actions/affiliate'
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
    const affiliateCode = session.metadata?.affiliateCode

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

    // Credit affiliate commission if applicable
    if (affiliateCode) {
      try {
        await creditAffiliateReferral(orderId, affiliateCode, order.amount)
      } catch (affiliateErr) {
        console.error('Failed to credit affiliate:', affiliateErr)
      }
    }

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
        subject: `NaviPass — votre commande ${orderNumber} est confirmee`,
        text: `NaviPass\n\nBonjour ${order.firstName},\n\nVotre commande ${orderNumber} a bien ete recue. Votre compte IDF Mobilites sera pret sous 24 a 48 heures ouvrees.\n\nSuivez votre commande : ${magicUrl}\n\n— NaviPass navipass.to`,
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
          subject: `[NaviPass] Nouvelle commande ${orderNumber}`,
          text: `Nouvelle commande ${orderNumber}\n\nClient : ${order.firstName} ${order.lastName}\nEmail : ${order.email}\nForfait : ${order.planType}\n\nAdmin : ${appUrl}/admin/commande/${orderId}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px"><p style="font-size:14px;color:#1A1A2E"><strong>Commande ${orderNumber}</strong></p><table style="width:100%;border-collapse:collapse;font-size:13px;color:#6B7280"><tr><td style="padding:6px 0;border-bottom:1px solid #F3F4F6">Client</td><td style="padding:6px 0;border-bottom:1px solid #F3F4F6;font-weight:600;color:#1A1A2E">${order.firstName} ${order.lastName}</td></tr><tr><td style="padding:6px 0;border-bottom:1px solid #F3F4F6">Email</td><td style="padding:6px 0;border-bottom:1px solid #F3F4F6;font-weight:600;color:#1A1A2E">${order.email}</td></tr><tr><td style="padding:6px 0">Forfait</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E">${order.planType}</td></tr></table><p style="margin-top:20px"><a href="${appUrl}/admin/commande/${orderId}" style="display:inline-block;background:#0077B6;color:#fff;text-decoration:none;border-radius:6px;padding:10px 20px;font-size:13px;font-weight:600">Voir dans l admin</a></p></div>`,
        })
      } catch (adminEmailErr) {
        console.error('Failed to send admin notification:', adminEmailErr)
      }
    }
  }

  return NextResponse.json({ received: true })
}
