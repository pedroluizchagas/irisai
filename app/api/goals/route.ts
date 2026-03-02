// Goals API - List + Create
import { getSession } from '@/lib/auth'
import { getGoalRepository } from '@/infra/container'
import { success, created, error, unauthorized, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function GET(request: Request) {
  try {
    const log = startLog('api/goals', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/goals', 401)
      log.end(401)
      return unauthorized()
    }
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const status = url.searchParams.get('status') || undefined
    const repo = getGoalRepository()
    const result = await repo.findAll({ tenantId: session.tenantId, userId: session.userId }, { page, limit, status })
    inc('api/goals', 200)
    log.end(200, { userId: session.userId })
    return success(result.data, result.meta)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar metas'
    inc('api/goals', 500)
    startLog('api/goals', request).end(500, { error: msg })
    return serverError(msg)
  }
}

export async function POST(request: Request) {
  try {
    const log = startLog('api/goals', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/goals', 401)
      log.end(401)
      return unauthorized()
    }
    const body = await request.json()
    if (!body.title) {
      inc('api/goals', 400)
      log.end(400)
      return error('Titulo e obrigatorio')
    }
    const repo = getGoalRepository()
    const goal = await repo.create({ tenantId: session.tenantId, userId: session.userId }, { title: body.title, description: body.description, target_value: body.target_value, unit: body.unit, deadline: body.deadline })
    inc('api/goals', 201)
    log.end(201, { userId: session.userId })
    return created(goal)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar meta'
    inc('api/goals', 500)
    startLog('api/goals', request).end(500, { error: msg })
    return serverError(msg)
  }
}
