import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/auth', async (orig) => {
  const actual = await orig<typeof import('@/lib/auth')>()
  return {
    ...actual,
    getSession: vi.fn(async (req: Request) => ({ tenantId: 't', userId: 'u', email: 'test@example.com', name: 'Test', role: 'owner' })),
    loginUser: vi.fn(async (email: string, password: string) => ({
      user: { id: 'u', tenant_id: 't', name: 'Test', email, role: 'owner', avatar_url: null, created_at: new Date().toISOString() },
      token: 'token123'
    })),
    registerUser: vi.fn(async () => ({
      user: { id: 'u', tenant_id: 't', name: 'Test', email: 'test@example.com', role: 'owner', avatar_url: null, created_at: new Date().toISOString() },
      tenant: { id: 't', name: 'Workspace', slug: 'workspace', plan: 'free', created_at: new Date().toISOString() },
      token: 'token123'
    })),
  }
})

describe('API auth', () => {
  it('POST /api/auth/register registra e seta cookie', async () => {
    const mod = await import('@/app/api/auth/register/route')
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: '123456' }),
      headers: { 'content-type': 'application/json' }
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(res.headers.get('set-cookie')).toMatch(/iris-token=/)
  })

  it('POST /api/auth/login loga e seta cookie', async () => {
    const mod = await import('@/app/api/auth/login/route')
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: '123' }),
      headers: { 'content-type': 'application/json' }
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(res.headers.get('set-cookie')).toMatch(/iris-token=/)
  })

  it('GET /api/auth/me retorna usuario atual', async () => {
    const mod = await import('@/app/api/auth/me/route')
    const res = await mod.GET(new Request('http://localhost/api/auth/me'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.user.email).toBe('test@example.com')
  })

  it('POST /api/auth/logout limpa cookie', async () => {
    const mod = await import('@/app/api/auth/logout/route')
    const req = new Request('http://localhost/api/auth/logout', { method: 'POST' })
    const res = await mod.POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(res.headers.get('set-cookie')).toMatch(/Max-Age=0/)
  })
})
