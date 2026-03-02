// Transactions Summary API
import { getSession } from '@/lib/auth'
import { getTransactionRepository } from '@/infra/container'
import { success, unauthorized, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function GET(request: Request) {
  try {
    const log = startLog('api/transactions/summary', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/transactions/summary', 401)
      log.end(401)
      return unauthorized()
    }
    const url = new URL(request.url)
    const month = url.searchParams.get('month') || undefined
    const repo = getTransactionRepository()
    const summary = await repo.getSummary({ tenantId: session.tenantId, userId: session.userId }, month)
    inc('api/transactions/summary', 200)
    log.end(200, { userId: session.userId })
    return success(summary)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    inc('api/transactions/summary', 500)
    startLog('api/transactions/summary', request).end(500, { error: msg })
    return serverError(msg)
  }
}
