import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signProfilToken } from '@/lib/jwt'
import { z } from 'zod'
import { getPostHogServer } from '@/lib/posthog'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const { email } = parsed.data

    const orderCount = await prisma.order.count({
      where: { email: { equals: email, mode: 'insensitive' } },
    })

    if (orderCount === 0) {
      // Ne pas révéler si l'email existe ou pas
      return NextResponse.json({ error: 'Aucune commande trouvée pour cet email.' }, { status: 404 })
    }

    const token = await signProfilToken(email.toLowerCase())

    try {
      const ph = getPostHogServer()
      ph.identify({ distinctId: email.toLowerCase(), properties: { email: email.toLowerCase() } })
      ph.capture({ distinctId: email.toLowerCase(), event: 'profil_authenticated', properties: { order_count: orderCount } })
      await ph.shutdown()
    } catch {}

    const res = NextResponse.json({ success: true })
    res.cookies.set('profil_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/',
    })

    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('profil_session')
  return res
}
