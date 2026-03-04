import { getSession } from '@/lib/auth'
import { success, unauthorized, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc, snapshot } from '@/lib/metrics'

export async function GET(request: Request) {
  try {
    const log = startLog('api/metrics/snapshot', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/metrics/snapshot', 401)
      log.end(401)
      return unauthorized()
    }
    const data = snapshot()
    inc('api/metrics/snapshot', 200)
    log.end(200, { userId: session.userId })
    return success(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    inc('api/metrics/snapshot', 500)
    startLog('api/metrics/snapshot', request).end(500, { error: msg })
    return serverError(msg)
  }
}
