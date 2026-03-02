// Habits API - Update / Delete / Log by ID
import { getSession } from '@/lib/auth'
import { getHabitRepository } from '@/infra/container'
import { success, created, unauthorized, notFound, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const log = startLog('api/habits/[id]', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/habits/[id]', 401)
      log.end(401)
      return unauthorized()
    }
    const { id } = await params
    const body = await request.json()
    const repo = getHabitRepository()
    const habit = await repo.update({ tenantId: session.tenantId, userId: session.userId }, id, body)
    inc('api/habits/[id]', 200)
    log.end(200, { userId: session.userId })
    return success(habit)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg.includes('nao encontrado')) {
      inc('api/habits/[id]', 404)
      startLog('api/habits/[id]', request).end(404, { error: msg })
      return notFound(msg)
    }
    inc('api/habits/[id]', 500)
    startLog('api/habits/[id]', request).end(500, { error: msg })
    return serverError(msg)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const log = startLog('api/habits/[id]', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/habits/[id]', 401)
      log.end(401)
      return unauthorized()
    }
    const { id } = await params
    const repo = getHabitRepository()
    await repo.delete({ tenantId: session.tenantId, userId: session.userId }, id)
    inc('api/habits/[id]', 200)
    log.end(200, { userId: session.userId })
    return success({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    inc('api/habits/[id]', 500)
    startLog('api/habits/[id]', request).end(500, { error: msg })
    return serverError(msg)
  }
}

// POST to log habit completion
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const logger = startLog('api/habits/[id]/log', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/habits/[id]/log', 401)
      logger.end(401)
      return unauthorized()
    }
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const repo = getHabitRepository()
    const entry = await repo.logCompletion({ tenantId: session.tenantId, userId: session.userId }, id, body?.note)
    inc('api/habits/[id]/log', 201)
    logger.end(201, { userId: session.userId })
    return created(entry)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    inc('api/habits/[id]/log', 500)
    startLog('api/habits/[id]/log', request).end(500, { error: msg })
    return serverError(msg)
  }
}
