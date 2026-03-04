import { registerUser, createRefreshToken } from '@/lib/auth'
import { success, error, serverError } from '@/lib/api-response'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'
import { startLog } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const log = startLog('api/auth/register', request)
    const rl = checkRateLimit(request, 'auth:register', 5, 60_000)
    if (!rl.ok) return error('Muitas requisicoes. Tente novamente em breve.', 429)

    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
      tenantName: z.string().optional(),
    })
    const { name, email, password, tenantName } = schema.parse(await request.json())

    const result = await registerUser({ name, email, password, tenantName })

    const response = success({ user: result.user, tenant: result.tenant, token: result.token }, undefined, 201)
    const url = new URL(request.url)
    const secureFlag = url.protocol === 'https:' || process.env.NODE_ENV === 'production' ? '; Secure' : ''
    const refresh = createRefreshToken({ userId: result.user.id, tenantId: result.user.tenant_id })
    const cookies = [
      `iris-token=${result.token}; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=${60 * 60 * 24 * 7}`,
      `iris-refresh=${refresh}; Path=/; HttpOnly; SameSite=Strict${secureFlag}; Max-Age=${60 * 60 * 24 * 30}`
    ]
    response.headers.set('Set-Cookie', cookies.join(', '))
    log.end(201, { userId: result.user.id, tenantId: result.user.tenant_id })
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao registrar'
    if (message === 'Email ja cadastrado') return error(message, 409)
    if (message.includes('at Zod')) return error('Dados invalidos', 400)
    const status = message === 'Email ja cadastrado' ? 409 : message.includes('at Zod') ? 400 : 500
    startLog('api/auth/register', request).end(status)
    return serverError(message)
  }
}
