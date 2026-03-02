// Notes API - List + Create
import { getSession } from '@/lib/auth'
import { getNoteRepository } from '@/infra/container'
import { success, created, error, unauthorized, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function GET(request: Request) {
  try {
    const log = startLog('api/notes', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/notes', 401)
      log.end(401)
      return unauthorized()
    }
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const repo = getNoteRepository()
    const result = await repo.findAll({ tenantId: session.tenantId, userId: session.userId }, { page, limit })
    inc('api/notes', 200)
    log.end(200, { userId: session.userId })
    return success(result.data, result.meta)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar notas'
    inc('api/notes', 500)
    startLog('api/notes', request).end(500, { error: msg })
    return serverError(msg)
  }
}

export async function POST(request: Request) {
  try {
    const log = startLog('api/notes', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/notes', 401)
      log.end(401)
      return unauthorized()
    }
    const body = await request.json()
    if (!body.title) {
      inc('api/notes', 400)
      log.end(400)
      return error('Titulo e obrigatorio')
    }
    const repo = getNoteRepository()
    const note = await repo.create({ tenantId: session.tenantId, userId: session.userId }, { title: body.title, content: body.content, tags: body.tags, is_pinned: body.is_pinned || false })
    inc('api/notes', 201)
    log.end(201, { userId: session.userId })
    return created(note)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar nota'
    inc('api/notes', 500)
    startLog('api/notes', request).end(500, { error: msg })
    return serverError(msg)
  }
}
