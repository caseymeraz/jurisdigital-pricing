import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

const SESSION_COOKIE = 'jd_admin_session'
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'dev-secret-change-me'

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function createSession(username: string): Promise<string> {
  const token = Buffer.from(`${username}:${Date.now()}:${SESSION_SECRET}`).toString('base64')
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return token
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [username, , secret] = decoded.split(':')
    if (secret !== SESSION_SECRET) return null
    // Verify user still exists
    const user = await prisma.adminUser.findUnique({ where: { username } })
    if (!user) return null
    return username
  } catch {
    return null
  }
}

export async function requireAdmin(): Promise<string> {
  const username = await getSession()
  if (!username) {
    throw new Error('Unauthorized')
  }
  return username
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
