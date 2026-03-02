// Auth API - Get current session/user
import { getSession } from '@/lib/auth'
import { success, unauthorized } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function GET(request: Request) {
  const log = startLog('api/auth/me', request)
  const session = await getSession(request)
  if (!session) {
    inc('api/auth/me', 401)
    log.end(401)
    return unauthorized()
  }
  inc('api/auth/me', 200)
  log.end(200, { userId: session.userId })
  return success({ user: session })
}
