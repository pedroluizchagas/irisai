// Notes API - Get / Update / Delete by ID
import { getSession } from '@/lib/auth'
import { getNoteRepository } from '@/infra/container'
import { success, unauthorized, notFound, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const log = startLog('api/notes/[id]', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/notes/[id]', 401)
      log.end(401)
      return unauthorized()
    }
    const { id } = await params
    const repo = getNoteRepository()
    const note = await repo.findById({ tenantId: session.tenantId, userId: session.userId }, id)
    if (!note) {
      inc('api/notes/[id]', 404)
      log.end(404)
      return notFound('Nota nao encontrada')
    }
    inc('api/notes/[id]', 200)
    log.end(200, { userId: session.userId })
    return success(note)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    inc('api/notes/[id]', 500)
    startLog('api/notes/[id]', request).end(500, { error: msg })
    return serverError(msg)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const log = startLog('api/notes/[id]', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/notes/[id]', 401)
      log.end(401)
      return unauthorized()
    }
    const { id } = await params
    const body = await request.json()
    const repo = getNoteRepository()
    const note = await repo.update({ tenantId: session.tenantId, userId: session.userId }, id, body)
    inc('api/notes/[id]', 200)
    log.end(200, { userId: session.userId })
    return success(note)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg.includes('nao encontrada')) {
      inc('api/notes/[id]', 404)
      startLog('api/notes/[id]', request).end(404, { error: msg })
      return notFound(msg)
    }
    inc('api/notes/[id]', 500)
    startLog('api/notes/[id]', request).end(500, { error: msg })
    return serverError(msg)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const log = startLog('api/notes/[id]', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/notes/[id]', 401)
      log.end(401)
      return unauthorized()
    }
    const { id } = await params
    const repo = getNoteRepository()
    await repo.delete({ tenantId: session.tenantId, userId: session.userId }, id)
    inc('api/notes/[id]', 200)
    log.end(200, { userId: session.userId })
    return success({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    inc('api/notes/[id]', 500)
    startLog('api/notes/[id]', request).end(500, { error: msg })
    return serverError(msg)
  }
}
