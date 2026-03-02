// Tasks Stats API
import { getSession } from '@/lib/auth'
import { getTaskRepository } from '@/infra/container'
import { success, unauthorized, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function GET(request: Request) {
  try {
    const log = startLog('api/tasks/stats', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/tasks/stats', 401)
      log.end(401)
      return unauthorized()
    }

    const repo = getTaskRepository()
    const counts = await repo.countByStatus({ tenantId: session.tenantId, userId: session.userId })
    inc('api/tasks/stats', 200)
    log.end(200, { userId: session.userId })
    return success(counts)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    inc('api/tasks/stats', 500)
    startLog('api/tasks/stats', request).end(500, { error: msg })
    return serverError(msg)
  }
}
