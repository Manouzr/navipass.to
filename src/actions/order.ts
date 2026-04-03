'use server'

import { prisma } from '@/lib/prisma'
import { stripe, PLAN_PRODUCT_IDS, PLAN_AMOUNTS } from '@/lib/stripe'
import { orderFormSchema } from '@/lib/validations'
import { generateOrderNumber, getAppUrl } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { PlanType } from '@prisma/client'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function createOrderAction(formData: FormData): Promise<ActionResult<{ checkoutUrl: string }>> {
  const raw = {
    planType: formData.get('planType') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    dateOfBirth: formData.get('dateOfBirth') as string,
    photoUrl: formData.get('photoUrl') as string,
  }

  const parsed = orderFormSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { planType, firstName, lastName, email, dateOfBirth, photoUrl } = parsed.data

  let orderNumber: string
  let attempts = 0
  do {
    orderNumber = generateOrderNumber()
    attempts++
    if (attempts > 10) throw new Error('Failed to generate unique order number')
  } while (await prisma.order.findUnique({ where: { orderNumber } }))

  const amount = PLAN_AMOUNTS[planType]

  const order = await prisma.order.create({
    data: {
      orderNumber,
      firstName,
      lastName,
      email,
      dateOfBirth: new Date(dateOfBirth),
      photoUrl,
      planType: planType as PlanType,
      amount,
      status: 'PENDING',
    },
  })

  const appUrl = getAppUrl()

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product: PLAN_PRODUCT_IDS[planType],
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/commande/${orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/commander?cancelled=true`,
    customer_email: email,
    metadata: {
      orderId: order.id,
      orderNumber,
    },
  })

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  })

  return { success: true, data: { checkoutUrl: session.url! } }
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({ where: { orderNumber } })
}

export async function getOrderByEmailAndNumber(email: string, orderNumber: string) {
  return prisma.order.findFirst({
    where: { email: email.toLowerCase(), orderNumber },
  })
}

export async function getOrderByMagicToken(token: string) {
  const order = await prisma.order.findFirst({
    where: {
      magicToken: token,
      magicTokenExpiry: { gt: new Date() },
    },
  })
  return order
}

export async function invalidateMagicToken(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { magicToken: null, magicTokenExpiry: null },
  })
  revalidatePath('/suivi')
}
