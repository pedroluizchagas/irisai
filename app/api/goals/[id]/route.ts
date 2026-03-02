// Goals API - Update / Delete by ID
import { getSession } from '@/lib/auth'
import { getGoalRepository } from '@/infra/container'
import { success, unauthorized, notFound, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const log = startLog('api/goals/[id]', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/goals/[id]', 401)
      log.end(401)
      return unauthorized()
    }
    const { id } = await params
    const body = await request.json()
    const repo = getGoalRepository()
    const goal = await repo.update({ tenantId: session.tenantId, userId: session.userId }, id, body)
    inc('api/goals/[id]', 200)
    log.end(200, { userId: session.userId })
    return success(goal)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg.includes('nao encontrada')) {
      inc('api/goals/[id]', 404)
      startLog('api/goals/[id]', request).end(404, { error: msg })
      return notFound(msg)
    }
    inc('api/goals/[id]', 500)
    startLog('api/goals/[id]', request).end(500, { error: msg })
    return serverError(msg)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const log = startLog('api/goals/[id]', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/goals/[id]', 401)
      log.end(401)
      return unauthorized()
    }
    const { id } = await params
    const repo = getGoalRepository()
    await repo.delete({ tenantId: session.tenantId, userId: session.userId }, id)
    inc('api/goals/[id]', 200)
    log.end(200, { userId: session.userId })
    return success({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    inc('api/goals/[id]', 500)
    startLog('api/goals/[id]', request).end(500, { error: msg })
    return serverError(msg)
  }
}
