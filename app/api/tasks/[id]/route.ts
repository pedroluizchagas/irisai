// Tasks API - Get / Update / Delete by ID
import { getSession } from '@/lib/auth'
import { getTaskRepository } from '@/infra/container'
import { success, error, unauthorized, notFound, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const log = startLog('api/tasks/[id]', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/tasks/[id]', 401)
      log.end(401)
      return unauthorized()
    }

    const { id } = await params
    const repo = getTaskRepository()
    const task = await repo.findById({ tenantId: session.tenantId, userId: session.userId }, id)
    if (!task) {
      inc('api/tasks/[id]', 404)
      log.end(404)
      return notFound('Tarefa nao encontrada')
    }

    inc('api/tasks/[id]', 200)
    log.end(200, { userId: session.userId })
    return success(task)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    inc('api/tasks/[id]', 500)
    startLog('api/tasks/[id]', request).end(500, { error: msg })
    return serverError(msg)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const log = startLog('api/tasks/[id]', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/tasks/[id]', 401)
      log.end(401)
      return unauthorized()
    }

    const { id } = await params
    const body = await request.json()
    const repo = getTaskRepository()
    const task = await repo.update({ tenantId: session.tenantId, userId: session.userId }, id, body)

    inc('api/tasks/[id]', 200)
    log.end(200, { userId: session.userId })
    return success(task)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg.includes('nao encontrada')) {
      inc('api/tasks/[id]', 404)
      startLog('api/tasks/[id]', request).end(404, { error: msg })
      return notFound(msg)
    }
    inc('api/tasks/[id]', 500)
    startLog('api/tasks/[id]', request).end(500, { error: msg })
    return serverError(msg)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const log = startLog('api/tasks/[id]', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/tasks/[id]', 401)
      log.end(401)
      return unauthorized()
    }

    const { id } = await params
    const repo = getTaskRepository()
    await repo.delete({ tenantId: session.tenantId, userId: session.userId }, id)

    inc('api/tasks/[id]', 200)
    log.end(200, { userId: session.userId })
    return success({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    inc('api/tasks/[id]', 500)
    startLog('api/tasks/[id]', request).end(500, { error: msg })
    return serverError(msg)
  }
}
