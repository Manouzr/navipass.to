import { SignJWT, jwtVerify } from 'jose'

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function signMagicToken(orderNumber: string): Promise<string> {
  const secret = getSecret()
  return new SignJWT({ orderNumber, type: 'magic' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    if (payload.type !== 'magic' || typeof payload.orderNumber !== 'string') return null
    return payload.orderNumber
  } catch {
    return null
  }
}

export async function signAdminToken(email: string): Promise<string> {
  const secret = getSecret()
  return new SignJWT({ email, type: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload.type === 'admin' && payload.email === process.env.ADMIN_EMAIL
  } catch {
    return false
  }
}

export async function signProfilToken(email: string): Promise<string> {
  const secret = getSecret()
  return new SignJWT({ email, type: 'profil' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyProfilToken(token: string): Promise<string | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    if (payload.type !== 'profil' || typeof payload.email !== 'string') return null
    return payload.email
  } catch {
    return null
  }
}
