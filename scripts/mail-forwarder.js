/**
 * mail-forwarder.js — standalone PM2 worker
 * Polls mail.gw every 60s and forwards new emails to clients via Resend.
 */

'use strict'

require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') })

const { createCipheriv, createDecipheriv, randomBytes } = require('crypto')
const { PrismaClient } = require('@prisma/client')
const { Resend } = require('resend')

// ── Crypto (inline, same logic as src/lib/crypto.ts) ──────────────
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getKey() {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error('ENCRYPTION_KEY is not set')
  const buf = Buffer.from(key, 'hex')
  if (buf.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars)')
  return buf
}

function decrypt(data) {
  const key = getKey()
  const buf = Buffer.from(data, 'base64')
  const iv = buf.subarray(0, IV_LENGTH)
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const encrypted = buf.subarray(IV_LENGTH + TAG_LENGTH)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
}

// ── Mail.gw helpers ────────────────────────────────────────────────
const BASE = 'https://api.mail.gw'

async function mailGwGetToken(address, password) {
  const res = await fetch(`${BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, password }),
  })
  if (!res.ok) throw new Error(`mail.gw auth failed: ${res.status}`)
  const data = await res.json()
  return data.token
}

async function mailGwGetMessages(token) {
  const res = await fetch(`${BASE}/messages?page=1`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`mail.gw get messages failed: ${res.status}`)
  const data = await res.json()
  return data['hydra:member'] || []
}

async function mailGwGetMessage(token, id) {
  const res = await fetch(`${BASE}/messages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`mail.gw get message failed: ${res.status}`)
  return res.json()
}

async function mailGwMarkRead(token, id) {
  await fetch(`${BASE}/messages/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify({ seen: true }),
  })
}

// ── Main ───────────────────────────────────────────────────────────
const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.EMAIL_FROM || 'NaviPass <noreply@navipass.to>'
const POLL_INTERVAL = 60_000

async function poll() {
  console.log(`[mail-forwarder] ${new Date().toISOString()} — polling...`)

  const orders = await prisma.order.findMany({
    where: {
      mailGwForwarding: true,
      mailGwEmail: { not: null },
      mailGwPassword: { not: null },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      mailGwEmail: true,
      mailGwPassword: true,
      mailGwLastCheckedAt: true,
      accountExpiry: true,
    },
  })

  for (const order of orders) {
    try {
      // Stop forwarding if subscription expired
      if (order.accountExpiry && new Date() > new Date(order.accountExpiry)) {
        await prisma.order.update({
          where: { id: order.id },
          data: { mailGwForwarding: false },
        })
        console.log(`[mail-forwarder] Stopped forwarding for ${order.id} — subscription expired`)
        continue
      }

      const gwEmail = decrypt(order.mailGwEmail)
      const gwPassword = decrypt(order.mailGwPassword)

      const token = await mailGwGetToken(gwEmail, gwPassword)
      const messages = await mailGwGetMessages(token)

      const cutoff = order.mailGwLastCheckedAt ? new Date(order.mailGwLastCheckedAt) : new Date(0)
      const newMessages = messages.filter(
        (m) => !m.seen && new Date(m.createdAt) > cutoff
      )

      for (const msg of newMessages) {
        const full = await mailGwGetMessage(token, msg.id)
        const htmlBody = (full.html && full.html[0]) || `<p>${full.text || msg.intro || ''}</p>`
        const textBody = full.text || msg.intro || ''

        await resend.emails.send({
          from: EMAIL_FROM,
          to: order.email,
          subject: `[NaviPass] ${msg.subject}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto"><div style="background:#0A1628;padding:16px 24px;border-radius:8px 8px 0 0"><span style="color:#4BAFD4;font-weight:700;font-size:16px">NaviPass</span></div><div style="background:#F9FAFB;padding:20px 24px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px"><p style="font-size:13px;color:#6B7280;margin:0 0 16px 0">Bonjour ${order.firstName}, vous avez recu un message de IDF Mobilites concernant votre abonnement Navigo.</p><hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 16px 0"/>${htmlBody}<hr style="border:none;border-top:1px solid #E5E7EB;margin:16px 0 0 0"/><p style="font-size:11px;color:#9CA3AF;margin:12px 0 0 0;text-align:center">Ce message a ete transmis automatiquement depuis votre compte IDF Mobilites via NaviPass.</p></div></div>`,
          text: `NaviPass — message IDF Mobilites\n\nBonjour ${order.firstName},\n\n${textBody}\n\n— NaviPass navipass.to`,
        })

        await mailGwMarkRead(token, msg.id)
        console.log(`[mail-forwarder] Forwarded "${msg.subject}" → ${order.email}`)

        await new Promise((r) => setTimeout(r, 200))
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { mailGwLastCheckedAt: new Date() },
      })
    } catch (err) {
      console.error(`[mail-forwarder] Error on order ${order.id}:`, err.message)
    }

    await new Promise((r) => setTimeout(r, 500))
  }
}

poll().catch(console.error)
setInterval(() => poll().catch(console.error), POLL_INTERVAL)
