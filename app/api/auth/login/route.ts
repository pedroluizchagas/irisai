import { loginUser, createRefreshToken } from '@/lib/auth'
import { success, error, serverError } from '@/lib/api-response'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'
import { startLog } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const log = startLog('api/auth/login', request)
    const rl = checkRateLimit(request, 'auth:login', 10, 60_000)
    if (!rl.ok) return error('Muitas requisicoes. Tente novamente em breve.', 429)

    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    const { email, password } = schema.parse(await request.json())

    const result = await loginUser(email, password)

    const response = success({ user: result.user, token: result.token })
    const url = new URL(request.url)
    const secureFlag = url.protocol === 'https:' || process.env.NODE_ENV === 'production' ? '; Secure' : ''
    const refresh = createRefreshToken({ userId: result.user.id, tenantId: result.user.tenant_id })
    const cookies = [
      `iris-token=${result.token}; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=${60 * 60 * 24 * 7}`,
      `iris-refresh=${refresh}; Path=/; HttpOnly; SameSite=Strict${secureFlag}; Max-Age=${60 * 60 * 24 * 30}`
    ]
    response.headers.set('Set-Cookie', cookies.join(', '))
    log.end(200, { userId: result.user.id, tenantId: result.user.tenant_id })
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao fazer login'
    if (message === 'Credenciais invalidas') return error(message, 401)
    if (message.includes('at Zod')) return error('Dados invalidos', 400)
    const status = message === 'Credenciais invalidas' ? 401 : message.includes('at Zod') ? 400 : 500
    startLog('api/auth/login', request).end(status)
    return serverError(message)
  }
}
