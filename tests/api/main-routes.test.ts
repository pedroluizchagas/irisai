import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(async () => ({ tenantId: 't', userId: 'u', name: 'Test' }))
}))

vi.mock('@/infra/container', () => ({
  getTaskRepository: () => ({
    findAll: async () => ({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }),
    countByStatus: async () => ({ todo: 1, in_progress: 2, done: 3 }),
    create: async () => ({ id: 'task-1', title: 'Teste', status: 'todo', priority: 'medium', due_date: null })
  }),
  getNoteRepository: () => ({
    findAll: async () => ({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }),
    create: async () => ({ id: 'note-1', title: 'Teste' })
  }),
  getEventRepository: () => ({
    findUpcoming: async () => [{ id: 'event-1', title: 'Meet', start_time: '2026-03-01T10:00:00Z', end_time: null, location: 'Online' }],
    findById: async () => ({ id: 'event-1', title: 'Meet', start_time: '2026-03-01T10:00:00Z', end_time: null, location: 'Online' })
  }),
  getTransactionRepository: () => ({
    getSummary: async () => ({ income: 1000, expense: 200, balance: 800 })
  }),
  getHabitRepository: () => ({
    findAll: async () => [{ id: 'habit-1', title: 'Daily', color: '#fff' }],
    getLogsForDate: async () => [{ id: 'log-1', habit_id: 'habit-1', completed_at: '2026-03-01T00:00:00Z' }]
  })
}))

describe('API rotas principais', () => {
  it('GET /api/tasks lista tarefas', async () => {
    const mod = await import('@/app/api/tasks/route')
    const res = await mod.GET(new Request('http://localhost/api/tasks'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('POST /api/tasks cria tarefa', async () => {
    const mod = await import('@/app/api/tasks/route')
    const req = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Teste' }),
      headers: { 'content-type': 'application/json' }
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('GET /api/notes lista notas', async () => {
    const mod = await import('@/app/api/notes/route')
    const res = await mod.GET(new Request('http://localhost/api/notes'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('GET /api/transactions/summary retorna resumo', async () => {
    const mod = await import('@/app/api/transactions/summary/route')
    const res = await mod.GET(new Request('http://localhost/api/transactions/summary'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.balance).toBe(800)
  })

  it('GET /api/dashboard agrega dados', async () => {
    const mod = await import('@/app/api/dashboard/route')
    const res = await mod.GET(new Request('http://localhost/api/dashboard'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.tasks.todo).toBe(1)
  })
})
