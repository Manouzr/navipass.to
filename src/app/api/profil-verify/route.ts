import { NextRequest, NextResponse } from 'next/server'
import { verifyProfilToken, signOtpChallenge, verifyOtpChallenge, signCredentialsToken } from '@/lib/jwt'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { z } from 'zod'

const verifySchema = z.object({
  action: z.literal('verify'),
  challengeToken: z.string(),
  otp: z.string().length(6),
})

export async function POST(req: NextRequest) {
  // Must have a valid profil session
  const sessionToken = req.cookies.get('profil_session')?.value
  if (!sessionToken) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const email = await verifyProfilToken(sessionToken)
  if (!email) return NextResponse.json({ error: 'Session invalide' }, { status: 401 })

  const body = await req.json()
  const action = body?.action

  // ── Send OTP ──────────────────────────────────────────────
  if (action === 'send') {
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const challengeToken = await signOtpChallenge(email, otp)

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: `NaviPass — votre code de verification : ${otp}`,
        text: `NaviPass\n\nCode de verification : ${otp}\n\nCe code est valable 10 minutes.\nSi vous n avez pas fait cette demande, ignorez ce message.\n\n— NaviPass navipass.to`,
        html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F9FAFB;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;padding:32px 16px">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
      <tr><td style="padding-bottom:16px">
        <span style="font-size:18px;font-weight:700;color:#0077B6;font-family:Arial,Helvetica,sans-serif">NaviPass</span>
      </td></tr>
      <tr><td style="background-color:#ffffff;border:1px solid #E5E7EB;border-radius:8px;padding:32px">
        <p style="font-size:16px;font-weight:700;color:#1A1A2E;margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif">Code de verification</p>
        <p style="font-size:14px;color:#6B7280;line-height:1.7;margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif">
          Entrez ce code dans NaviPass pour acceder a votre espace. Il expire dans 10 minutes.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:20px 0">
            <table cellpadding="0" cellspacing="0">
              <tr><td style="background-color:#F3F4F6;border:1px solid #E5E7EB;border-radius:8px;padding:16px 32px;text-align:center">
                <span style="font-size:32px;font-weight:700;letter-spacing:10px;color:#0077B6;font-family:Courier New,monospace">${otp}</span>
              </td></tr>
            </table>
          </td></tr>
        </table>
        <p style="font-size:12px;color:#9CA3AF;margin:8px 0 0 0;font-family:Arial,Helvetica,sans-serif;line-height:1.6">
          Si vous n avez pas fait cette demande, ignorez simplement cet email.
        </p>
      </td></tr>
      <tr><td style="padding:16px 0">
        <p style="font-size:11px;color:#9CA3AF;text-align:center;margin:0;font-family:Arial,Helvetica,sans-serif;line-height:1.6">
          NaviPass — navipass.to
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
      })
    } catch (err) {
      console.error('Failed to send OTP email:', err)
      return NextResponse.json({ error: "Impossible d'envoyer l'email" }, { status: 500 })
    }

    return NextResponse.json({ challengeToken })
  }

  // ── Verify OTP ────────────────────────────────────────────
  if (action === 'verify') {
    const parsed = verifySchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

    const { challengeToken, otp } = parsed.data
    const valid = await verifyOtpChallenge(challengeToken, otp, email)
    if (!valid) return NextResponse.json({ error: 'Code incorrect ou expiré' }, { status: 400 })

    const credToken = await signCredentialsToken(email)
    const res = NextResponse.json({ success: true })
    res.cookies.set('credentials_unlocked', credToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1h
      path: '/',
    })
    return res
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('credentials_unlocked')
  return res
}
