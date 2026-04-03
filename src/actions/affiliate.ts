'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './admin'
import { z } from 'zod'

// Commission: 30% of order amount
const COMMISSION_RATE = 0.30

function generateCode(firstName: string, lastName: string): string {
  const base = (firstName.slice(0, 3) + lastName.slice(0, 3)).toUpperCase().replace(/[^A-Z]/g, '')
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${base}${suffix}`
}

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
})

export async function registerAffiliate(formData: FormData) {
  const raw = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false as const, error: 'Données invalides' }
  }

  const { firstName, lastName, email } = parsed.data

  const existing = await prisma.affiliate.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    return { success: false as const, error: 'Cet email est déjà enregistré.' }
  }

  // Generate unique code
  let code = generateCode(firstName, lastName)
  let attempts = 0
  while (await prisma.affiliate.findUnique({ where: { code } }) && attempts < 10) {
    code = generateCode(firstName, lastName)
    attempts++
  }

  const affiliate = await prisma.affiliate.create({
    data: { firstName, lastName, email: email.toLowerCase(), code },
  })

  return { success: true as const, data: { code: affiliate.code, id: affiliate.id } }
}

export async function getAffiliateByCode(code: string) {
  return prisma.affiliate.findUnique({
    where: { code },
    include: {
      referrals: {
        include: { order: { select: { orderNumber: true, planType: true, amount: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function getAffiliateByEmail(email: string) {
  return prisma.affiliate.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      referrals: {
        include: { order: { select: { orderNumber: true, planType: true, amount: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

// Called from webhook after payment
export async function creditAffiliateReferral(orderId: string, affiliateCode: string, orderAmount: number) {
  const affiliate = await prisma.affiliate.findUnique({ where: { code: affiliateCode } })
  if (!affiliate || affiliate.status !== 'ACTIVE') return

  const commission = Math.round(orderAmount * COMMISSION_RATE)

  await prisma.$transaction([
    prisma.affiliateReferral.create({
      data: { affiliateId: affiliate.id, orderId, commission },
    }),
    prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        balance: { increment: commission },
        totalEarned: { increment: commission },
      },
    }),
  ])
}

// Admin actions
export async function adminGetAffiliates() {
  await requireAdmin()
  return prisma.affiliate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { referrals: true } } },
  })
}

export async function adminUpdateAffiliateStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'PENDING') {
  await requireAdmin()
  await prisma.affiliate.update({ where: { id }, data: { status } })
  revalidatePath('/admin/affilies')
}

export async function adminDebitAffiliateBalance(id: string, amount: number) {
  await requireAdmin()
  await prisma.affiliate.update({
    where: { id },
    data: { balance: { decrement: amount } },
  })
  revalidatePath('/admin/affilies')
}
