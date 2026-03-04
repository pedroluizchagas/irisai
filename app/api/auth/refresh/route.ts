import { success, error, serverError } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'
import { verifyRefreshToken, createToken, createRefreshToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const log = startLog('api/auth/refresh', request)
    const rl = checkRateLimit(request, 'auth:refresh', 20, 60_000)
    if (!rl.ok) return error('Muitas requisicoes. Tente novamente em breve.', 429)

    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieHeader.split(';').filter(Boolean).map(c => {
        const [key, ...vals] = c.trim().split('=')
        return [key, vals.join('=')]
      })
    )
    const refresh = cookies['iris-refresh']
    if (!refresh) {
      inc('api/auth/refresh', 401)
      log.end(401)
      return error('Refresh token ausente', 401)
    }

    const payload = verifyRefreshToken(refresh)
    if (!payload) {
      inc('api/auth/refresh', 401)
      log.end(401)
      return error('Refresh token invalido', 401)
    }

    const result = await query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [payload.userId, payload.tenantId])
    if (result.rows.length === 0) {
      inc('api/auth/refresh', 401)
      log.end(401)
      return error('Sessao invalida', 401)
    }

    const user = result.rows[0]
    const token = createToken({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    const nextRefresh = createRefreshToken({ userId: user.id, tenantId: user.tenant_id })

    const response = success({ user: { id: user.id, tenant_id: user.tenant_id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url, created_at: user.created_at }, token })
    const url = new URL(request.url)
    const secureFlag = url.protocol === 'https:' || process.env.NODE_ENV === 'production' ? '; Secure' : ''
    const cookiesOut = [
      `iris-token=${token}; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=${60 * 60 * 24 * 7}`,
      `iris-refresh=${nextRefresh}; Path=/; HttpOnly; SameSite=Strict${secureFlag}; Max-Age=${60 * 60 * 24 * 30}`
    ]
    response.headers.set('Set-Cookie', cookiesOut.join(', '))
    inc('api/auth/refresh', 200)
    log.end(200, { userId: user.id, tenantId: user.tenant_id })
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao renovar sessao'
    const status = message.includes('Refresh') ? 401 : 500
    startLog('api/auth/refresh', request).end(status)
    return serverError(message)
  }
}
