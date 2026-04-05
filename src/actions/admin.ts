'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/crypto'
import { signAdminToken, verifyAdminToken } from '@/lib/jwt'
import { adminLoginSchema, deliverOrderSchema } from '@/lib/validations'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { signMagicToken } from '@/lib/jwt'
import { getAppUrl } from '@/lib/utils'
import { OrderDeliveredEmail } from '@/components/EmailTemplates/OrderDelivered'
import { render } from '@react-email/components'
import { revalidatePath } from 'next/cache'
import { getPostHogServer } from '@/lib/posthog'
import type { ActionResult } from './order'

export async function loginAdmin(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = adminLoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: 'Données invalides' }
  }

  const { email, password } = parsed.data

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return { success: false, error: 'Email ou mot de passe incorrect' }
  }

  const token = await signAdminToken(email)

  const cookieStore = await cookies()
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60, // 8h
    path: '/',
  })

  redirect('/admin/dashboard')
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  redirect('/admin')
}

export async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token || !(await verifyAdminToken(token))) {
    redirect('/admin')
  }
}

export async function getAdminStats() {
  await requireAdmin()

  const [total, pending, paid, processing, delivered, issues, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { accountIssueReported: true } }),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'PROCESSING', 'DELIVERED'] } },
      _sum: { amount: true },
    }),
  ])

  return {
    total,
    pending,
    paid,
    processing,
    delivered,
    issues,
    revenue: revenue._sum.amount ?? 0,
  }
}

export async function getAdminOrders(params: {
  page?: number
  status?: string
  search?: string
}) {
  await requireAdmin()

  const { page = 1, status, search } = params
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = {}

  if (status && status !== 'ALL') {
    where.status = status
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        orderNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        planType: true,
        amount: true,
        status: true,
        createdAt: true,
        stripePaidAt: true,
        accountIssueReported: true,
      },
    }),
    prisma.order.count({ where }),
  ])

  return { orders, total, pages: Math.ceil(total / pageSize) }
}

export async function getAdminOrderById(id: string) {
  await requireAdmin()
  return prisma.order.findUnique({ where: { id } })
}

export async function markProcessing(orderId: string): Promise<ActionResult> {
  await requireAdmin()

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PROCESSING' },
  })

  revalidatePath('/admin/dashboard')
  revalidatePath(`/admin/commande/${orderId}`)

  return { success: true, data: undefined }
}

export async function deliverOrder(formData: FormData): Promise<ActionResult> {
  await requireAdmin()

  const raw = {
    orderId: formData.get('orderId') as string,
    accountEmail: formData.get('accountEmail') as string,
    accountPassword: formData.get('accountPassword') as string,
    accountExpiry: formData.get('accountExpiry') as string,
    adminNote: (formData.get('adminNote') as string) || undefined,
  }

  const mailGwEmailRaw = formData.get('mailGwEmail') as string | null
  const mailGwPasswordRaw = formData.get('mailGwPassword') as string | null

  const parsed = deliverOrderSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { orderId, accountEmail, accountPassword, accountExpiry, adminNote } = parsed.data

  const encryptedEmail = encrypt(accountEmail)
  const encryptedPassword = encrypt(accountPassword)

  const currentOrder = await prisma.order.findUnique({ where: { id: orderId } })
  const isReplacement = currentOrder?.status === 'DELIVERED'

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'DELIVERED',
      accountEmail: encryptedEmail,
      accountPassword: encryptedPassword,
      accountExpiry: new Date(accountExpiry),
      deliveredAt: new Date(),
      accountIssueReported: false,
      accountIssueReportedAt: null,
      ...(mailGwEmailRaw && mailGwPasswordRaw ? {
        mailGwEmail: encrypt(mailGwEmailRaw),
        mailGwPassword: encrypt(mailGwPasswordRaw),
        mailGwForwarding: true,
        mailGwLastCheckedAt: new Date(),
      } : {}),
    },
  })

  // Generate fresh magic token
  const token = await signMagicToken(order.orderNumber)
  const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await prisma.order.update({
    where: { id: orderId },
    data: { magicToken: token, magicTokenExpiry: expiry },
  })

  const appUrl = getAppUrl()
  const magicUrl = `${appUrl}/suivi/${token}`

  try {
    const html = await render(
      OrderDeliveredEmail({
        orderNumber: order.orderNumber,
        firstName: order.firstName,
        accountEmail,
        accountPassword,
        accountExpiry: new Date(accountExpiry),
        magicUrl,
        adminNote,
      })
    )

    await resend.emails.send({
      from: EMAIL_FROM,
      to: order.email,
      subject: isReplacement ? `NaviPass — vos nouveaux identifiants` : `NaviPass — votre compte est pret`,
      html,
    })
  } catch (emailErr) {
    console.error('Failed to send delivery email:', emailErr)
  }

  // PostHog — order delivered
  try {
    const ph = getPostHogServer()
    ph.capture({
      distinctId: order.email,
      event: 'order_delivered',
      properties: {
        order_number: order.orderNumber,
        plan: order.planType,
        amount: order.amount / 100,
        is_replacement: isReplacement,
        has_admin_note: !!adminNote,
        mail_gw_forwarding: !!(mailGwEmailRaw && mailGwPasswordRaw),
      },
    })
    await ph.shutdown()
  } catch {}

  revalidatePath('/admin/dashboard')
  revalidatePath(`/admin/commande/${orderId}`)

  return { success: true, data: undefined }
}

export async function setMailGwForwarding(orderId: string, enabled: boolean): Promise<ActionResult> {
  await requireAdmin()
  await prisma.order.update({
    where: { id: orderId },
    data: { mailGwForwarding: enabled },
  })
  revalidatePath(`/admin/commande/${orderId}`)
  return { success: true, data: undefined }
}

export async function updateClientEmail(orderId: string, newEmail: string): Promise<ActionResult> {
  await requireAdmin()
  const email = newEmail.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Email invalide' }
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { email },
  })
  revalidatePath(`/admin/commande/${orderId}`)
  return { success: true, data: undefined }
}

export async function saveMailGwCredentials(orderId: string, gwEmail: string, gwPassword: string): Promise<ActionResult> {
  await requireAdmin()
  await prisma.order.update({
    where: { id: orderId },
    data: {
      mailGwEmail: encrypt(gwEmail.trim()),
      mailGwPassword: encrypt(gwPassword),
      mailGwForwarding: true,
      mailGwLastCheckedAt: new Date(),
    },
  })
  revalidatePath(`/admin/commande/${orderId}`)
  return { success: true, data: undefined }
}

export async function deleteOrder(orderId: string): Promise<ActionResult> {
  await requireAdmin()
  await prisma.affiliateReferral.deleteMany({ where: { orderId } })
  await prisma.order.delete({ where: { id: orderId } })
  revalidatePath('/admin/dashboard')
  return { success: true, data: undefined }
}
