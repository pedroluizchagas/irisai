import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(async () => ({ tenantId: 't', userId: 'u', name: 'Test' }))
}))

vi.mock('@/infra/container', () => ({
  getGoalRepository: () => ({
    findAll: async () => ({ data: [{ id: 'g1', title: 'Meta', status: 'active' }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } }),
    create: async () => ({ id: 'g2', title: 'Nova', description: null, target_value: null, unit: null, deadline: null, status: 'active', tenant_id: 't', user_id: 'u', current_value: 0, created_at: '', updated_at: '' }),
    update: async () => ({ id: 'g1', title: 'Meta editada', description: null, target_value: null, unit: null, deadline: null, status: 'active', tenant_id: 't', user_id: 'u', current_value: 0, created_at: '', updated_at: '' }),
    delete: async () => {}
  }),
  getHabitRepository: () => ({
    findAll: async () => [{ id: 'h1', title: 'Habito', description: null, frequency: 'daily', target_count: 1, color: null, is_active: true, tenant_id: 't', user_id: 'u', created_at: '' }],
    create: async () => ({ id: 'h2', title: 'Novo', description: null, frequency: 'daily', target_count: 1, color: null, is_active: true, tenant_id: 't', user_id: 'u', created_at: '' }),
    update: async () => ({ id: 'h1', title: 'Habito editado', description: null, frequency: 'weekly', target_count: 2, color: null, is_active: true, tenant_id: 't', user_id: 'u', created_at: '' }),
    delete: async () => {},
    logCompletion: async () => ({ id: 'l1', habit_id: 'h1', tenant_id: 't', user_id: 'u', completed_at: new Date().toISOString(), note: null })
  })
}))

describe('API metas e hábitos', () => {
  it('GET /api/goals lista metas', async () => {
    const mod = await import('@/app/api/goals/route')
    const res = await mod.GET(new Request('http://localhost/api/goals'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.length).toBe(1)
  })

  it('POST /api/goals cria meta', async () => {
    const mod = await import('@/app/api/goals/route')
    const req = new Request('http://localhost/api/goals', {
      method: 'POST',
      body: JSON.stringify({ title: 'Nova' }),
      headers: { 'content-type': 'application/json' }
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.id).toBeDefined()
  })

  it('PATCH /api/goals/[id] atualiza meta', async () => {
    const mod = await import('@/app/api/goals/[id]/route')
    const req = new Request('http://localhost/api/goals/g1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Meta editada' }),
      headers: { 'content-type': 'application/json' }
    })
    const res = await mod.PATCH(req, { params: Promise.resolve({ id: 'g1' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.title).toBe('Meta editada')
  })

  it('GET /api/habits lista hábitos', async () => {
    const mod = await import('@/app/api/habits/route')
    const res = await mod.GET(new Request('http://localhost/api/habits'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it('POST /api/habits cria hábito', async () => {
    const mod = await import('@/app/api/habits/route')
    const req = new Request('http://localhost/api/habits', {
      method: 'POST',
      body: JSON.stringify({ title: 'Novo', frequency: 'daily' }),
      headers: { 'content-type': 'application/json' }
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.id).toBeDefined()
  })

  it('POST /api/habits/[id] registra conclusão', async () => {
    const mod = await import('@/app/api/habits/[id]/route')
    const req = new Request('http://localhost/api/habits/h1', {
      method: 'POST',
      body: JSON.stringify({ note: null }),
      headers: { 'content-type': 'application/json' }
    })
    const res = await mod.POST(req, { params: Promise.resolve({ id: 'h1' }) })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.id).toBeDefined()
  })
}
)
