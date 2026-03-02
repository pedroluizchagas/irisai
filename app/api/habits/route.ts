// Habits API - List + Create
import { getSession } from '@/lib/auth'
import { getHabitRepository } from '@/infra/container'
import { success, created, error, unauthorized, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function GET(request: Request) {
  try {
    const log = startLog('api/habits', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/habits', 401)
      log.end(401)
      return unauthorized()
    }
    const repo = getHabitRepository()
    const habits = await repo.findAll({ tenantId: session.tenantId, userId: session.userId })
    inc('api/habits', 200)
    log.end(200, { userId: session.userId })
    return success(habits)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar habitos'
    inc('api/habits', 500)
    startLog('api/habits', request).end(500, { error: msg })
    return serverError(msg)
  }
}

export async function POST(request: Request) {
  try {
    const log = startLog('api/habits', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/habits', 401)
      log.end(401)
      return unauthorized()
    }
    const body = await request.json()
    if (!body.title) {
      inc('api/habits', 400)
      log.end(400)
      return error('Titulo e obrigatorio')
    }
    const repo = getHabitRepository()
    const habit = await repo.create({ tenantId: session.tenantId, userId: session.userId }, { title: body.title, description: body.description, frequency: body.frequency || 'daily', target_count: body.target_count || 1, color: body.color })
    inc('api/habits', 201)
    log.end(201, { userId: session.userId })
    return created(habit)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar habito'
    inc('api/habits', 500)
    startLog('api/habits', request).end(500, { error: msg })
    return serverError(msg)
  }
}
