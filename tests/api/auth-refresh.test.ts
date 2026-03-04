import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/auth', async (orig) => {
  const actual = await orig<typeof import('@/lib/auth')>()
  return {
    ...actual,
    verifyRefreshToken: vi.fn(() => ({ userId: 'u', tenantId: 't' })),
    createToken: vi.fn(() => 'newtoken123'),
    createRefreshToken: vi.fn(() => 'newrefresh456'),
  }
})

vi.mock('@/lib/db', () => ({
  query: vi.fn(async () => ({
    rows: [
      {
        id: 'u',
        tenant_id: 't',
        name: 'Test',
        email: 'test@example.com',
        role: 'owner',
        avatar_url: null,
        created_at: new Date().toISOString(),
        password_hash: 'hashed',
      },
    ],
  })),
}))

describe('API auth refresh', () => {
  it('POST /api/auth/refresh renova e seta cookies', async () => {
    const mod = await import('@/app/api/auth/refresh/route')
    const req = new Request('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: { cookie: 'iris-refresh=mockrefresh' },
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(res.headers.get('set-cookie')).toMatch(/iris-token=/)
    expect(res.headers.get('set-cookie')).toMatch(/iris-refresh=/)
  })
})
