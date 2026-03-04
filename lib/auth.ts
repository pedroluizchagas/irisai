// Auth configuration and utilities
import { hash, compare } from 'bcryptjs'
import { sign, verify } from 'jsonwebtoken'
import { query } from '@/lib/db'
import { nanoid } from 'nanoid'
import type { User, Tenant } from '@iris/domain'

function getJwtSecret(): string {
  const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (s) return s
  if (process.env.NODE_ENV === 'test') return 'test-secret'
  throw new Error('AUTH_SECRET not configured')
}
const JWT_EXPIRES_IN = '7d'
function getRefreshSecret(): string {
  const s = process.env.AUTH_REFRESH_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (s) return s
  if (process.env.NODE_ENV === 'test') return 'test-refresh'
  throw new Error('AUTH_REFRESH_SECRET not configured')
}
const REFRESH_EXPIRES_IN = '30d'

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// JWT utilities
export function createToken(payload: { userId: string; tenantId: string; email: string; name: string; role: string }): string {
  return sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): { userId: string; tenantId: string; email: string; name: string; role: string } | null {
  try {
    return verify(token, getJwtSecret()) as { userId: string; tenantId: string; email: string; name: string; role: string }
  } catch {
    return null
  }
}

export function createRefreshToken(payload: { userId: string; tenantId: string }): string {
  return sign(payload, getRefreshSecret(), { expiresIn: REFRESH_EXPIRES_IN })
}

export function verifyRefreshToken(token: string): { userId: string; tenantId: string } | null {
  try {
    return verify(token, getRefreshSecret()) as { userId: string; tenantId: string }
  } catch {
    return null
  }
}

// Get session from request headers (supports both cookie-based and Bearer token for mobile)
export async function getSession(request: Request): Promise<{ userId: string; tenantId: string; email: string; name: string; role: string } | null> {
  // Try Bearer token first (mobile)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return verifyToken(token)
  }

  // Try cookie (web)
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...vals] = c.trim().split('=')
        return [key, vals.join('=')]
      })
    )
    const token = cookies['iris-token']
    if (token) {
      return verifyToken(token)
    }
  }

  return null
}

// Register a new user + tenant
export async function registerUser(data: {
  name: string
  email: string
  password: string
  tenantName?: string
}): Promise<{ user: Omit<User, 'password_hash'>; tenant: Tenant; token: string }> {
  // Check if email exists
  const existing = await query('SELECT id FROM users WHERE email = $1', [data.email])
  if (existing.rows.length > 0) {
    throw new Error('Email ja cadastrado')
  }

  const tenantId = nanoid()
  const userId = nanoid()
  const passwordHash = await hashPassword(data.password)
  const tenantSlugBase = (data.tenantName || data.name).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
  const tenantSlug = `${tenantSlugBase}-${nanoid(6)}`

  // Create tenant
  await query(
    'INSERT INTO tenants (id, name, slug, plan, created_at) VALUES ($1, $2, $3, $4, NOW())',
    [tenantId, data.tenantName || `${data.name}'s Workspace`, tenantSlug, 'free']
  )

  // Create user
  await query(
    'INSERT INTO users (id, tenant_id, name, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
    [userId, tenantId, data.name, data.email, passwordHash, 'owner']
  )

  const token = createToken({ userId, tenantId, email: data.email, name: data.name, role: 'owner' })

  return {
    user: { id: userId, tenant_id: tenantId, name: data.name, email: data.email, role: 'owner', avatar_url: null, created_at: new Date().toISOString() },
    tenant: { id: tenantId, name: data.tenantName || `${data.name}'s Workspace`, slug: tenantSlug, plan: 'free', created_at: new Date().toISOString() },
    token,
  }
}

// Login
export async function loginUser(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email])
  if (result.rows.length === 0) {
    throw new Error('Credenciais invalidas')
  }

  const user = result.rows[0]
  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    throw new Error('Credenciais invalidas')
  }

  const token = createToken({
    userId: user.id,
    tenantId: user.tenant_id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  return {
    user: {
      id: user.id,
      tenant_id: user.tenant_id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    },
    token,
  }
}
