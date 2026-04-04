const BASE = 'https://api.mail.gw'

export interface MailGwMessage {
  id: string
  subject: string
  from: { name: string; address: string }
  intro: string
  seen: boolean
  createdAt: string
}

export interface MailGwMessageFull extends MailGwMessage {
  text: string
  html: string[]
}

export async function mailGwGetDomains(): Promise<string[]> {
  const res = await fetch(`${BASE}/domains?page=1`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch domains')
  const data = await res.json()
  return (data['hydra:member'] as { domain: string; isActive: boolean }[])
    .filter((d) => d.isActive)
    .map((d) => d.domain)
}

export async function mailGwCreateAccount(address: string, password: string): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err['hydra:description'] ?? `Create account failed: ${res.status}`)
  }
  return res.json()
}

export async function mailGwGetToken(address: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, password }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  const data = await res.json()
  return data.token as string
}

export async function mailGwGetMessages(token: string): Promise<MailGwMessage[]> {
  const res = await fetch(`${BASE}/messages?page=1`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Get messages failed: ${res.status}`)
  const data = await res.json()
  return data['hydra:member'] as MailGwMessage[]
}

export async function mailGwGetMessage(token: string, id: string): Promise<MailGwMessageFull> {
  const res = await fetch(`${BASE}/messages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Get message failed: ${res.status}`)
  return res.json()
}

export async function mailGwMarkRead(token: string, id: string): Promise<void> {
  await fetch(`${BASE}/messages/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify({ seen: true }),
  })
}
